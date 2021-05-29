import {
  AppBar, Toolbar, Button,
} from '@material-ui/core';
import React from 'react';
import { connect } from 'react-redux';
import '../styles/Navbar.css';
import { NavbarProps, RootState } from '../types';
import Settings from './Settings';

const Navbar: React.FunctionComponent<NavbarProps> = (props): JSX.Element => (
  <nav className="navbar">
    <AppBar color="transparent" position="static">
      <Toolbar>
        <Settings />
        <Button color="inherit">New Game</Button>
        <Button color="inherit">Register</Button>
        <Button color="inherit">Login</Button>
      </Toolbar>
    </AppBar>
  </nav>
);

const mapStateToProps = (state: RootState) => ({

});

export default connect(mapStateToProps, {})(Navbar);
