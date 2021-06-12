import {
  AppBar, Toolbar, Button,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import '../styles/Navbar.css';
import { NavbarProps, RootState } from '../types';
import { formatTimer } from '../utils';
import Settings from './Settings';

const Navbar: React.FunctionComponent<NavbarProps> = (props): JSX.Element => {
  const { pussleStarted } = props;
  const [timer, setTimer] = useState(0);
  const [formattedTimer, setFormattedTimer] = useState('0:00:00');

  useEffect(() => {
    const savedTime = window.localStorage.getItem('timer');
    if (savedTime) setTimer(Number(savedTime));
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (pussleStarted) {
      interval = setInterval(() => {
        setTimer((time) => time + 1);
        window.localStorage.setItem('timer', timer.toString());
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [pussleStarted]);

  useEffect(() => {
    setFormattedTimer(formatTimer(timer));
  }, [timer]);

  return (
    <nav className="navbar">
      <AppBar color="transparent" position="static">
        <Toolbar>
          <p className="timer">{formattedTimer}</p>
          <Settings />
          <Button color="inherit">New Game</Button>
          <Button color="inherit">Register</Button>
          <Button color="inherit">Login</Button>
        </Toolbar>
      </AppBar>
    </nav>
  );
};

const mapStateToProps = (state: RootState) => ({
  pussleStarted: state.general.pussleStarted,
});

export default connect(mapStateToProps, {

})(Navbar);
