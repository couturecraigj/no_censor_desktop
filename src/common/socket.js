import Store from 'electron-store';
// eslint-disable-next-line import/no-extraneous-dependencies
import io from 'socket.io-client';
import { COOKIE_TYPE_MAP } from './types';

const store = new Store();
const connectToSocket = WS_URL => {
  const socket = io(WS_URL, {
    // forceNode: true,
    // transports: ['polling'],
    // transports: ['websocket'],
    extraHeaders: {
      'x-token': store.get(COOKIE_TYPE_MAP.token),
      'Access-Control-Allow-Origin': true
      // cookie: document.cookie
    },
    pingInterval: 10000,
    pingTimeout: 5000,
    query: {
      token: store.get(COOKIE_TYPE_MAP.token)
    }
  });
  // eslint-disable-next-line
  console.log(socket);
  socket.on('error', error => {
    // eslint-disable-next-line
    console.error(error);
  });
  socket.on('FILE:streamDown$ready', error => {
    // eslint-disable-next-line
    console.error(error);
  });

  socket.on('disconnect', reason => {
    // eslint-disable-next-line
    console.error(reason);

    if (reason === 'io server disconnect') {
      // the disconnection was initiated by the server, you need to reconnect manually
      socket.connect();
    }
    // else the socket will automatically try to reconnect
  });
  // socket.connect();

  return [socket, io];
};

export default connectToSocket;
