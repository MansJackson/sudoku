import { Button } from '@material-ui/core';
import React from 'react';
import { connect } from 'react-redux';
import { dispatchA, loadPussleA } from '../redux/actions';
import '../styles/Controls.css';
import {
  CLEAR_CELL,
  CLEAR_PUSSLE,
  ControlsProps,
  Mode,
  RootState,
  SET_BIG_NUM,
  SET_CENTER_PENCIL,
  SET_CORNER_PENCIL,
  SET_SELECTED_MODE,
} from '../types';
import { isPussleSolved } from '../utils';

const Controls = (props: ControlsProps): JSX.Element => {
  const {
    selectedCells,
    selectedMode,
    loadPussle,
    dispatch,
  } = props;

  // Locks the pussle
  const lockPussle = () => {
    const cellsToLock = document.querySelectorAll('.big_num');
    const pussle: Record<string, string> = {};
    cellsToLock.forEach((el) => {
      pussle[el.parentElement!.id] = el.innerHTML;
    });
    loadPussle(false, pussle);
  };

  // Checks if pussle is correctly solved
  const checkSolved = () => {
    let pussle: string[] = [];
    const cells = document.querySelectorAll('.big_num');
    cells.forEach((el) => {
      pussle = [...pussle, el.innerHTML];
    });
    if (isPussleSolved(pussle)) {
      alert('Congratulations!');
    } else {
      alert('That doesn\'t look right');
    }
  };

  // Deletes content of selected cells
  const deleteContent = () => {
    selectedCells.forEach((el) => dispatch(CLEAR_CELL, { cellId: el }));
  };

  const setSelectedMode = (mode: Mode) => {
    dispatch(SET_SELECTED_MODE, { mode });
  };

  const setNumber = (number: string) => {
    switch (selectedMode) {
      case 'normal':
        selectedCells.forEach((el) => dispatch(SET_BIG_NUM, { cellId: el, number }));
        break;
      case 'corner':
        selectedCells.forEach((el) => dispatch(SET_CORNER_PENCIL, { cellId: el, number }));
        break;
      case 'center':
        selectedCells.forEach((el) => dispatch(SET_CENTER_PENCIL, { cellId: el, number }));
        break;
      default:
        selectedCells.forEach((el) => dispatch(SET_BIG_NUM, { cellId: el, number }));
    }
  };

  return (
    <div className="controls">
      <Button
        onClick={() => setSelectedMode('normal')}
        color="primary"
        variant={selectedMode === 'normal' ? 'contained' : 'outlined'}
        size="small"
        className="btn btn_mode"
      >
        Normal
      </Button>
      <Button
        onClick={() => setNumber('1')}
        color="primary"
        variant="outlined"
        size="small"
        className="btn btn_num"
      >
        1
      </Button>
      <Button
        onClick={() => setNumber('2')}
        color="primary"
        variant="outlined"
        size="small"
        className="btn btn_num"
      >
        2
      </Button>
      <Button
        onClick={() => setNumber('3')}
        color="primary"
        variant="outlined"
        size="small"
        className="btn btn_num"
      >
        3
      </Button>
      <Button
        onClick={() => setSelectedMode('corner')}
        color="primary"
        variant={selectedMode === 'corner' ? 'contained' : 'outlined'}
        size="small"
        className="btn btn_mode"
      >
        Corner
      </Button>
      <Button
        onClick={() => setNumber('4')}
        color="primary"
        variant="outlined"
        size="small"
        className="btn btn_num"
      >
        4
      </Button>
      <Button
        onClick={() => setNumber('5')}
        color="primary"
        variant="outlined"
        size="small"
        className="btn btn_num"
      >
        5
      </Button>
      <Button
        onClick={() => setNumber('6')}
        color="primary"
        variant="outlined"
        size="small"
        className="btn btn_num"
      >
        6
      </Button>
      <Button
        onClick={() => setSelectedMode('center')}
        color="primary"
        variant={selectedMode === 'center' ? 'contained' : 'outlined'}
        size="small"
        className="btn btn_mode"
      >
        Center
      </Button>
      <Button
        onClick={() => setNumber('7')}
        color="primary"
        variant="outlined"
        size="small"
        className="btn btn_num"
      >
        7
      </Button>
      <Button
        onClick={() => setNumber('8')}
        color="primary"
        variant="outlined"
        size="small"
        className="btn btn_num"
      >
        8
      </Button>
      <Button
        onClick={() => setNumber('9')}
        color="primary"
        variant="outlined"
        size="small"
        className="btn btn_num"
      >
        9
      </Button>
      <Button
        onClick={() => setSelectedMode('color')}
        color="primary"
        variant={selectedMode === 'color' ? 'contained' : 'outlined'}
        size="small"
        className="btn btn_mode"
      >
        Color
      </Button>
      <Button
        onClick={deleteContent}
        color="primary"
        variant="outlined"
        size="small"
        className="btn btn_delete"
      >
        Delete
      </Button>
      <Button
        color="primary"
        variant="outlined"
        size="small"
        className="btn btn_extra"
      >
        Undo
      </Button>
      <Button
        color="primary"
        variant="outlined"
        size="small"
        className="btn btn_extra"
      >
        Redo
      </Button>
      <Button
        onClick={() => dispatch(CLEAR_PUSSLE, {})}
        color="primary"
        variant="outlined"
        size="small"
        className="btn btn_extra"
      >
        Restart
      </Button>
      <Button
        onClick={checkSolved}
        color="primary"
        variant="outlined"
        size="small"
        className="btn btn_extra"
      >
        Check
      </Button>
      <Button
        onClick={lockPussle}
        color="primary"
        variant="outlined"
        size="small"
        className="btn btn_extra"
      >
        Lock
      </Button>

    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  selectedCells: state.general.selectedCells,
  selectedMode: state.general.mode,
});

export default connect(mapStateToProps, {
  loadPussle: loadPussleA,
  dispatch: dispatchA,
})(Controls);
