import { Button } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { dispatchA, loadPussleA } from '../redux/actions';
import '../styles/Controls.css';
import {
  ADD_TO_HISTORY,
  ControlsProps,
  Mode,
  REDO,
  RootState,
  SET_PUSSLE_STARTED,
  SET_SELECTED_MODE,
  UNDO,
} from '../types';
import { isPussleSolved, updateBoard } from '../utils';
import {
  checkFishes,
  checkSubsets,
  checkTwoStringKite,
  fillPossibleNums,
} from '../solver';

const Controls = (props: ControlsProps): JSX.Element => {
  const {
    selectedCells,
    selectedMode,
    history,
    board,
    settings,
    loadPussle,
    dispatch,
  } = props;
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    if (history.length >= 2 && history[history.length - 1].id !== 0) setCanUndo(true);
    else setCanUndo(false);

    if (history.length >= 2 && history[0].id !== 0) setCanRedo(true);
    else setCanRedo(false);
  }, [history]);

  // Locks the pussle
  const lockPussle = () => {
    const cellsToLock = document.querySelectorAll('.big_num');
    if (!cellsToLock.length) return;

    const pussle: Record<string, string> = {};
    cellsToLock.forEach((el) => {
      pussle[el.parentElement!.id] = el.innerHTML;
    });
    dispatch(SET_PUSSLE_STARTED, { pussleStarted: true });
    loadPussle(false, pussle, true);
    fetch('http://localhost:8000/sudoku', {
      method: 'POST',
      body: JSON.stringify({ board: pussle }),
      headers: {
        'content-type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((res: Record<string, any>) => console.log(res.message))
      .catch((err) => console.error(err));
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
      dispatch(SET_PUSSLE_STARTED, { pussleStarted: false });
    } else {
      alert('That doesn\'t look right');
    }
  };

  // Deletes content of selected cells
  const deleteContent = () => {
    let newBoard = [...board];
    selectedCells.forEach((el) => { newBoard = updateBoard(newBoard, el, '1', 'delete', undefined, settings.highlightErrors); });
    dispatch(ADD_TO_HISTORY, { board: newBoard });
  };

  const restart = () => {
    let hasContent = false;
    for (let i = 0; i < 81; i += 1) {
      if (!board[i].locked) {
        if (!!board[i].bigNum || !!board[i].centerPencil.length || !!board[i].cornerPencil.length) hasContent = true;
      }
    }
    if (!hasContent) return;
    const newBoard = updateBoard(board, 'a1', '1', 'restart');
    dispatch(ADD_TO_HISTORY, { board: newBoard });
  };

  const setSelectedMode = (mode: Mode) => {
    dispatch(SET_SELECTED_MODE, { mode });
  };

  // Sets Big numbers in cells
  const setContent = (number: string) => {
    let newBoard = [...board];
    selectedCells.forEach((el) => {
      newBoard = updateBoard(newBoard, el, number, selectedMode, settings.removePencilMarks, settings.highlightErrors);
    });
    dispatch(ADD_TO_HISTORY, { board: newBoard });
  };

  const test = () => {
    const newBoard = checkTwoStringKite(board);
    if (!newBoard) {
      console.log('no changes');
      return;
    }
    dispatch(ADD_TO_HISTORY, { board: newBoard });
  };

  const fillPossible = () => {
    const newBoard = fillPossibleNums(board);
    dispatch(ADD_TO_HISTORY, { board: newBoard });
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
        onClick={() => setContent('1')}
        color="primary"
        variant="contained"
        size="small"
        className={`btn btn_num num_${selectedMode} ${selectedMode === 'color' ? 'background_1 color_1' : ''}`}
      >
        1
      </Button>
      <Button
        onClick={() => setContent('2')}
        color="primary"
        variant="contained"
        size="small"
        className={`btn btn_num num_${selectedMode} ${selectedMode === 'color' ? 'background_2 color_2' : ''}`}
      >
        2
      </Button>
      <Button
        onClick={() => setContent('3')}
        color="primary"
        variant="contained"
        size="small"
        className={`btn btn_num num_${selectedMode} ${selectedMode === 'color' ? 'background_3 color_3' : ''}`}
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
        onClick={() => setContent('4')}
        color="primary"
        variant="contained"
        size="small"
        className={`btn btn_num num_${selectedMode} ${selectedMode === 'color' ? 'background_4 color_4' : ''}`}
      >
        4
      </Button>
      <Button
        onClick={() => setContent('5')}
        color="primary"
        variant="contained"
        size="small"
        className={`btn btn_num num_${selectedMode} ${selectedMode === 'color' ? 'background_5 color_5' : ''}`}
      >
        5
      </Button>
      <Button
        onClick={() => setContent('6')}
        color="primary"
        variant="contained"
        size="small"
        className={`btn btn_num num_${selectedMode} ${selectedMode === 'color' ? 'background_6 color_6' : ''}`}
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
        onClick={() => setContent('7')}
        color="primary"
        variant="contained"
        size="small"
        className={`btn btn_num num_${selectedMode} ${selectedMode === 'color' ? 'background_7 color_7' : ''}`}
      >
        7
      </Button>
      <Button
        onClick={() => setContent('8')}
        color="primary"
        variant="contained"
        size="small"
        className={`btn btn_num num_${selectedMode} ${selectedMode === 'color' ? 'background_8 color_8' : ''}`}
      >
        8
      </Button>
      <Button
        onClick={() => setContent('9')}
        color="primary"
        variant="contained"
        size="small"
        className={`btn btn_num num_${selectedMode} ${selectedMode === 'color' ? 'background_9 color_9' : ''}`}
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
      {canUndo
        ? (
          <Button
            onClick={() => { dispatch(UNDO, {}); }}
            color="primary"
            variant="outlined"
            size="small"
            className="btn btn_extra"
          >
            Undo
          </Button>
        )
        : (
          <Button
            onClick={() => { dispatch(UNDO, {}); }}
            color="primary"
            variant="outlined"
            size="small"
            className="btn btn_extra"
            disabled
          >
            Undo
          </Button>
        )}
      {canRedo
        ? (
          <Button
            onClick={() => { dispatch(REDO, {}); }}
            color="primary"
            variant="outlined"
            size="small"
            className="btn btn_extra"
          >
            Redo
          </Button>
        )
        : (
          <Button
            onClick={() => { dispatch(REDO, {}); }}
            color="primary"
            variant="outlined"
            size="small"
            className="btn btn_extra"
            disabled
          >
            Redo
          </Button>
        )}
      <Button
        onClick={restart}
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
      <Button
        onClick={test}
        color="primary"
        variant="outlined"
        size="small"
        className="btn btn_extra"
      >
        test
      </Button>
      <Button
        onClick={fillPossible}
        color="primary"
        variant="outlined"
        size="small"
        className="btn btn_extra"
      >
        fill
      </Button>
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  selectedCells: state.general.selectedCells,
  selectedMode: state.general.mode,
  history: state.history,
  board: state.board,
  settings: state.general.settings,
});

export default connect(mapStateToProps, {
  loadPussle: loadPussleA,
  dispatch: dispatchA,
})(Controls);
