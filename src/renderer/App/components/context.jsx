import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { remote } from 'electron';
import createSocket from '../../../common/socket';
import File from '../../../common/File';

const URL = remote.getGlobal('__WS_URL__');
const [socket, io] = createSocket(URL);
const file = new File(socket, io, URL);

export const { Provider, Consumer } = React.createContext({
  socket,
  file
});
