import fs from 'fs';
// eslint-disable-next-line import/no-extraneous-dependencies
import { app, BrowserWindow, ipcMain } from 'electron';
import fetch from 'electron-fetch';
import * as path from 'path';
import { format as formatUrl } from 'url';
import File from '../common/File';
import createSocket from '../common/socket';

const isDevelopment = process.env.NODE_ENV !== 'production';
const WS_URL = 'http://localhost:3002';
const HTTP_URL = 'http://localhost:3000';
// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow;

async function createMainWindow() {
  global.__WS_URL__ = WS_URL;

  if (!isDevelopment) {
    ipcMain.on('ondragstart', (event, files) => {
      event.sender.startDrag({
        icon: `${__static}/origami_butterfly_by_fotland-d8poemn.jpg`,
        file: files
      });
    });

    ipcMain.on('onfilechange', (event, { path, name, ...props }) => {
      const [socket, io] = createSocket(WS_URL);

      const file = new File(socket, io, WS_URL);

      if (!fs.existsSync('temp')) fs.mkdirSync('temp');

      const newPath = `temp/${name}`;
      const writeStream = fs.createWriteStream(newPath);

      writeStream.on('finish', () => {
        // eslint-disable-next-line
        console.log('finished');
        file.upload({ originalFileName: name, path: newPath, ...props });
      });
      fs.createReadStream(path).pipe(writeStream);
    });
  }

  let urls;

  try {
    urls = await fetch(`${HTTP_URL}/api/graphql-urls`).then(response =>
      response.json()
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }

  global.__SUBSCRIPTION_URL__ = urls.subscriptionsPath;

  global.__GRAPHQL_URL__ = urls.graphqlPath;

  const window = new BrowserWindow();

  if (isDevelopment) {
    window.webContents.openDevTools();
  }

  if (isDevelopment) {
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);
  } else {
    window.loadURL(
      formatUrl({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true
      })
    );
  }

  window.on('closed', () => {
    mainWindow = null;
  });

  window.webContents.on('devtools-opened', () => {
    window.focus();
    setImmediate(() => {
      window.focus();
    });
  });

  return window;
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow();
  }
});

// create main BrowserWindow when electron is ready
app.on('ready', async () => {
  mainWindow = createMainWindow();
});
