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
  SET_SELECTED_MODE,
  UNDO,
} from '../types';
import { isPussleSolved, updateBoard } from '../utils';

const Controls = (props: ControlsProps): JSX.Element => {
  const {
    selectedCells,
    selectedMode,
    history,
    board,
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
    const pussle: Record<string, string> = {};
    cellsToLock.forEach((el) => {
      pussle[el.parentElement!.id] = el.innerHTML;
    });
    loadPussle(false, pussle, true);
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
    let newBoard = [...board];
    selectedCells.forEach((el) => { newBoard = updateBoard(newBoard, el, '1', 'delete'); });
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

  const setContent = (number: string) => {
    let newBoard = [...board];
    selectedCells.forEach((el) => { newBoard = updateBoard(newBoard, el, number, selectedMode); });
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
        variant="outlined"
        size="small"
        className={`btn btn_num num_${selectedMode} ${selectedMode === 'color' ? 'background_1 color_1' : ''}`}
      >
        1
      </Button>
      <Button
        onClick={() => setContent('2')}
        color="primary"
        variant="outlined"
        size="small"
        className={`btn btn_num num_${selectedMode} ${selectedMode === 'color' ? 'background_2 color_2' : ''}`}
      >
        2
      </Button>
      <Button
        onClick={() => setContent('3')}
        color="primary"
        variant="outlined"
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
        variant="outlined"
        size="small"
        className={`btn btn_num num_${selectedMode} ${selectedMode === 'color' ? 'background_4 color_4' : ''}`}
      >
        4
      </Button>
      <Button
        onClick={() => setContent('5')}
        color="primary"
        variant="outlined"
        size="small"
        className={`btn btn_num num_${selectedMode} ${selectedMode === 'color' ? 'background_5 color_5' : ''}`}
      >
        5
      </Button>
      <Button
        onClick={() => setContent('6')}
        color="primary"
        variant="outlined"
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
        variant="outlined"
        size="small"
        className={`btn btn_num num_${selectedMode} ${selectedMode === 'color' ? 'background_7 color_7' : ''}`}
      >
        7
      </Button>
      <Button
        onClick={() => setContent('8')}
        color="primary"
        variant="outlined"
        size="small"
        className={`btn btn_num num_${selectedMode} ${selectedMode === 'color' ? 'background_8 color_8' : ''}`}
      >
        8
      </Button>
      <Button
        onClick={() => setContent('9')}
        color="primary"
        variant="outlined"
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

    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  selectedCells: state.general.selectedCells,
  selectedMode: state.general.mode,
  history: state.history,
  board: state.board,
});

export default connect(mapStateToProps, {
  loadPussle: loadPussleA,
  dispatch: dispatchA,
})(Controls);
