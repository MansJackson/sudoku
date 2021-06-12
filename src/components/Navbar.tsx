import {
  AppBar, Toolbar, Button, Menu, MenuItem,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { dispatchA, loadPussleA } from '../redux/actions';
import '../styles/Navbar.css';
import {
  Difficulty,
  NavbarProps,
  RootState,
  SET_PUSSLE_STARTED,
} from '../types';
import { formatTimer } from '../utils';
import Settings from './Settings';

const Navbar: React.FunctionComponent<NavbarProps> = (props): JSX.Element => {
  const { pussleStarted, loadPussle, dispatch } = props;
  const [timer, setTimer] = useState(0);
  const [formattedTimer, setFormattedTimer] = useState('0:00:00');
  const [newGameAnchorEl, setNewGameAnchorEl] = React.useState<null | HTMLElement>(null);

  useEffect(() => {
    const savedTime = window.localStorage.getItem('timer');
    if (savedTime) setTimer(Number(savedTime));
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (pussleStarted) {
      interval = setInterval(() => {
        setTimer((time) => {
          window.localStorage.setItem('timer', (time + 1).toString());
          return time + 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [pussleStarted]);

  useEffect(() => {
    setFormattedTimer(formatTimer(timer));
  }, [timer]);

  const handleNewGameClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setNewGameAnchorEl(event.currentTarget);
  };

  const handleNewGameClose = () => {
    setNewGameAnchorEl(null);
  };

  const handleNewGame = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'Easy':
        // LoadPussle();
        break;
      case 'Medium':
        // LoadPussle();
        break;
      case 'Hard':
        // LoadPussle();
        break;
      case 'Extreme':
        // LoadPussle();
        break;
      case 'Diabolical':
        // LoadPussle();
        break;
      default:
        loadPussle(true);
        dispatch(SET_PUSSLE_STARTED, { pussleStarted: false });
        setTimer(0);
    }
    setNewGameAnchorEl(null);
    window.localStorage.removeItem('history');
    window.localStorage.removeItem('timer');
  };

  return (
    <nav className="navbar">
      <AppBar color="transparent" position="static">
        <Toolbar>
          <p className="timer">{formattedTimer}</p>
          <Settings />
          <div>
            <Button aria-controls="simple-menu" aria-haspopup="true" color="inherit" onClick={handleNewGameClick}>New Game</Button>
            <Menu
              id="simple-menu"
              anchorEl={newGameAnchorEl}
              keepMounted
              open={Boolean(newGameAnchorEl)}
              onClose={handleNewGameClose}
            >
              <MenuItem onClick={() => handleNewGame('Blank')}>Blank</MenuItem>
              <MenuItem onClick={() => handleNewGame('Easy')}>Easy</MenuItem>
              <MenuItem onClick={() => handleNewGame('Medium')}>Medium</MenuItem>
              <MenuItem onClick={() => handleNewGame('Hard')}>Hard</MenuItem>
              <MenuItem onClick={() => handleNewGame('Extreme')}>Extreme</MenuItem>
              <MenuItem onClick={() => handleNewGame('Diabolical')}>Diabolical</MenuItem>
            </Menu>
          </div>
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
  loadPussle: loadPussleA,
  dispatch: dispatchA,
})(Navbar);
