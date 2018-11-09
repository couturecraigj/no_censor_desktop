import React from 'react';
import { ApolloProvider } from 'react-apollo';
import { HashRouter } from 'react-router-dom';
import { hot } from 'react-hot-loader';
import client from './apollo';
import Routes from './pages';
import Layout from './components/Layout';

const Store = require('electron-store');

const store = new Store();

window.store = store;

const App = () => (
  <ApolloProvider client={client(window.fetch)}>
    <HashRouter>
      <Layout>
        <Routes />
      </Layout>
    </HashRouter>
  </ApolloProvider>
);

export default hot(module)(App);
