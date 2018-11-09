import React from 'react';
import { NavLink } from 'react-router-dom';

import PropTypes from 'prop-types';
import styled, { createGlobalStyle } from 'styled-components';
import { Provider } from './context';

const GlobalStyle = createGlobalStyle`
  body {
    color: ${props => (props.blackColor ? '#bbb' : '#444')};
    background-color: ${props => (props.blackColor ? '#444' : '#bbb')};
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
  }
  a {
    color: ${props => (props.blackColor ? '#eee' : '#333')};
    &:visited {
      color: ${props => (props.blackColor ? '#333' : '#bbb')};
    }
  }
`;

const displayProps = {
  blackColor: true
};

const Link = styled(NavLink).attrs({
  activeClassName: 'current',
  ...displayProps
})`
  font-size: 20px;
  color: ${props => (props.blackColor ? '#eee' : '#444')};
  line-height: 2rem;
  padding: 0 0.3rem;
  height: 2rem;
  transition: all 0.2s ease-in-out;

  &.current {
    font-size: scale(1.1);
    color: ${props => (props.blackColor ? '#bbb' : '#222')};
  }
`;

const NavBanner = styled.div`
  width: 100%;
  padding: 0.5rem;
`;
const Body = styled.div`
  width: 100%;
  padding: 0.5rem;
`;

const Layout = ({ children }) => (
  <Provider>
    <div>
      <GlobalStyle {...displayProps} />
      <NavBanner>
        <Link exact to="/">
          Home
        </Link>
        <Link exact to="/profile">
          Profile
        </Link>
        <Link exact to="/login">
          Login
        </Link>
        <Link exact to="/inventory">
          Inventory
        </Link>
        <Link exact to="/posts">
          Posts
        </Link>
      </NavBanner>
      <Body>{children}</Body>
    </div>
  </Provider>
);

Layout.propTypes = {
  children: PropTypes.element.isRequired
};
export default Layout;
