/* eslint-disable no-console */
import fs from 'fs';
import stream from 'stream';
import fx from 'mkdir-recursive';
import crypto from 'crypto';
import { createGzip } from 'zlib';
import Store from 'electron-store';
import path from 'path';
import through2 from 'through2';
import { COOKIE_TYPE_MAP } from './types';

const store = new Store();

const photoStreamReadyConstructor = function photoStreamReadyConstructor(
  socket
) {
  return (headers, user, fileNameArray, pathName) => {
    // TODO: Can also check to see if you want this user to access your photos.
    let chunkNum = 0;
    const compress = headers['accept-encoding'].includes('gzip');
    const previousETag =
      typeof headers['if-none-match'] === 'string' && headers['if-none-match'];

    return new Promise((resolve, reject) => {
      console.log(user, store.get('userId'));

      if (user.id === 'moosecouture') {
        socket.emit('Photo:streamUp$reject', pathName, user.userName, 401, {
          ETag: 'UNAUTHORIZED',
          'Cache-Control': 'private, max-age=31536001',
          'Content-Type': 'image/jpeg',
          date: new Date().toUTCString()
        });

        return reject();
      }

      socket.once('Photo:streamUp$close', pathName, user.userName, () => {
        console.log('CLOSED!');

        return reject();
      });
      fs.createReadStream(path.join('files', ...fileNameArray))
        .pipe(crypto.createHash('md5').setEncoding('hex'))
        .once('finish', function() {
          const ETag = this.read();

          socket.removeAllListeners('Photo:streamUp$close');

          return resolve(ETag);
        });
    })
      .then(
        ETag =>
          new Promise((resolve, reject) => {
            socket.once('Photo:streamUp$close', pathName, user.userName, () => {
              return reject();
            });
            const head = {
              ETag,
              'Cache-Control': 'private, max-age=31536000',
              'Content-Type': 'image/jpeg',
              date: new Date().toUTCString()
            };

            if (previousETag === ETag) {
              console.log('SAME AS PREVIOUS!');
              socket.emit('Photo:streamUp$head', pathName, head);

              return reject();
            }

            if (compress) head['Content-Encoding'] = 'gzip';

            socket.emit('Photo:streamUp$head', pathName, head);
            const readStream = fs.createReadStream(
              path.join('files', ...fileNameArray),
              {
                highWaterMark: 1024 * 1.5
              }
            );
            let gzip = createGzip();

            let chunks = [];

            if (!compress) {
              gzip = stream.PassThrough();
            }

            const transform = through2((chunk, enc, callback) => {
              chunkNum++;
              chunks.push(chunkNum);

              if (chunks.length === 7) {
                chunks = [];
                socket.emit(
                  'Photo:streamUp$chunk',
                  pathName,
                  chunk,
                  chunkNum,
                  callback
                );
              } else {
                socket.emit('Photo:streamUp$chunk', pathName, chunk, chunkNum);
                callback();
              }

              return;
            });

            return readStream
              .pipe(gzip)
              .pipe(transform)
              .once('finish', () => {
                transform.destroy();
                gzip.destroy();
                readStream.destroy();

                return reject();
              });
          })
      )
      .catch(e => {
        if (e) console.error(e);

        chunkNum = 0;

        return socket.emit('Photo:streamUp$end', pathName, () => {
          console.log('finish reached!');
          socket.removeAllListeners('Photo:streamUp$close');
          // socket.close();
          // socket.open();

          return;
        });
      });
  };
};

const cwd = process.cwd();

class File {
  constructor(socket, io, url) {
    this.URL = url;
    this.io = io;
    this.upload = ({ path, ...args }) => {
      socket.emit('FILE:upload#token', args, async file => {
        socket.emit('FILE:upload#start', file);
        // Potentially in development make it so that all event listeners are removed
        const readStream = fs.createReadStream(path);

        socket.once('FILE:upload$ready', () => {
          readStream.pipe(
            through2(function write(chunk, enc, callback) {
              if (socket.disconnected) socket.open();

              socket.emit('FILE:upload#chunk', chunk, callback);
              // trigger
            })
          );
          // eslint-disable-next-line no-console
          readStream.once('error', err => console.error(err));
        });
      });
    };
    const photoStreamReady = photoStreamReadyConstructor(socket);

    socket.on('Photo:streamUp$ready', photoStreamReady);

    socket.on('join namespace', namespaceName => {
      console.log('CHANGING NAMESPACES');
      const socket = io(this.URL + namespaceName, {
        forceNode: true,
        transports: ['polling'],
        pingInterval: 10000,
        pingTimeout: 5000,
        query: {
          token: store.get(COOKIE_TYPE_MAP.token)
        }
      });

      socket.once('FILE:streamDown$ready', (id, fileNameArray, callback) => {
        console.log('FILE:streamDown$ready');
        const dir = path.join(
          'files',
          ...fileNameArray.filter((v, i) => i !== fileNameArray.length - 1)
        );
        const fileName = fileNameArray[fileNameArray.length - 1];

        if (!fs.existsSync(dir)) fx.mkdirSync(dir);

        const writeStream = fs.createWriteStream(path.join(dir, fileName));

        socket.on('FILE:streamDown$chunk', (fileId, chunk, next) => {
          if (id !== fileId) return;

          console.log('stream chunk received');
          // gzip everything
          const gzip = createGzip();

          gzip.pipe(writeStream);
          gzip.write(chunk);

          return next();
        });

        return callback();
      });
    });

    // Receive File from Server
    socket.once('FILE:streamDown$ready', (id, fileNameArray, callback) => {
      console.log('stream chunk received');
      const writeStream = fs.createWriteStream(
        path.join(cwd, 'files', ...fileNameArray)
      );

      socket.on('FILE:streamDown$chunk', (fileId, chunk, next) => {
        if (id !== fileId) return;

        writeStream.write(chunk);

        return next();
      });

      return callback();
    });

    // Send File to Server
    socket.once('file_check', ({ fileName }) => {
      socket.emit('file_not_available');

      if (fs.existsSync(fileName)) {
        socket.emit('file_available');
        const readStream = fs.createReadStream(fileName);

        readStream.pipe(
          through2(function write(chunk, enc, callback) {
            return socket.emit('chunk', chunk, callback);
            // trigger
          })
        );
        // eslint-disable-next-line no-console
        readStream.on('error', err => console.error(err));
      }
    });
  }
}

export default File;
