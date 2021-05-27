import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import '../styles/Board.css';
import {
  dispatchA,
  loadPussleA,
} from '../redux/actions';
import {
  BoardProps,
  CLEAR_CELL,
  CLEAR_RESTRICTED_CELLS,
  RootState,
  SET_BIG_NUM,
  SET_CENTER_PENCIL,
  SET_CORNER_PENCIL,
  SET_IS_LOADING,
  SET_RESTRICTED_CELLS,
} from '../types';
import Cell from './Cell';
import {
  findRestrictedCells, isPussleSolved,
} from '../utils';

const Board = (props: BoardProps): JSX.Element => {
  const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
  const {
    isLoading,
    selectedCells,
    loadPussle,
    dispatch,
  } = props;

  // Load an empty board on mount
  useEffect(() => {
    loadPussle(true);
    dispatch(SET_IS_LOADING, { isLoading: false });
  }, []);

  // update restricted cells
  useEffect(() => {
    if (selectedCells.length === 1) {
      const restrictedCells = findRestrictedCells(selectedCells[0]);
      dispatch(SET_RESTRICTED_CELLS, { restrictedCells });
    } else {
      dispatch(CLEAR_RESTRICTED_CELLS, {});
    }
  }, [selectedCells]);

  // Handles inputs
  const handleKeyPress = (e: React.KeyboardEvent) => {
    const cells = document.querySelectorAll('.cell');
    e.preventDefault();
    if (e.repeat) return;

    if (e.key === 'Backspace' || e.key === 'Delete') {
      cells.forEach((el) => {
        if (el.classList.contains('selected')) dispatch(CLEAR_CELL, { cellId: el.id });
      });
      return;
    }
    if (e.altKey) {
      cells.forEach((el) => {
        if (el.classList.contains('selected')) dispatch(SET_CORNER_PENCIL, { cellId: el.id, number: e.key });
      });
    } else if (e.ctrlKey) {
      cells.forEach((el) => {
        if (el.classList.contains('selected')) dispatch(SET_CENTER_PENCIL, { cellId: el.id, number: e.key });
      });
    } else if (e.metaKey) {
      cells.forEach((el) => {
        if (el.classList.contains('selected')) dispatch(SET_CENTER_PENCIL, { cellId: el.id, number: e.key });
      });
    } else {
      cells.forEach((el) => {
        if (el.classList.contains('selected')) {
          dispatch(SET_BIG_NUM, { cellId: el.id, number: e.key });
        }
      });
    }
  };

  // Locks a user added pussle
  const lockPussle = () => {
    const cellsToLock = document.querySelectorAll('.big_num');
    const pussle: Record<string, string> = {};
    cellsToLock.forEach((el) => {
      pussle[el.parentElement!.id] = el.innerHTML;
    });
    loadPussle(false, pussle);
  };

  // Checks if pussle is correctly solved
  const handleSolve = () => {
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

  // Renders the board with its content
  const renderBoard = () => {
    let cellArray: JSX.Element[] = [];
    let rowArray: JSX.Element[] = [];

    for (let x = 0; x < 9; x += 1) {
      for (let y = 1; y <= 9; y += 1) {
        rowArray = [...rowArray, <Cell key={`cell_${columns[x]}${y}`} index={(x + 1) * y} id={`${columns[x]}${y}`} />];
      }
      cellArray = [...cellArray, <div key={`column_${x}`} className="board_row">{rowArray}</div>];
      rowArray = [];
    }

    return cellArray;
  };

  return (
    <>
      <button type="button" onClick={lockPussle}>Lock</button>
      <button type="button" onClick={handleSolve}>Solve</button>
      <div className="board" onKeyDown={handleKeyPress}>
        {isLoading ? <p>Loading...</p> : renderBoard()}
      </div>
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  isLoading: state.general.isLoading,
  selectedCells: state.general.selectedCells,
});

export default connect(mapStateToProps, {
  dispatch: dispatchA,
  loadPussle: loadPussleA,
})(Board);
