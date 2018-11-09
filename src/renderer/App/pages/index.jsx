import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from './Home';
import Profile from './Profile';
import Inventory from './Inventory';
import Posts from './Posts';
import Login from './Login';
import Fallback from './Fallback';

const Routes = () => (
  <Switch>
    <Route path="/" exact render={Home} />
    <Route path="/profile" exact render={Profile} />
    <Route path="/inventory" exact render={Inventory} />
    <Route path="/login" exact render={Login} />
    <Route path="/posts" exact render={Posts} />
    <Route render={Fallback} />
  </Switch>
);

export default Routes;
