import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import '../styles/Board.css';
import {
  dispatchA,
  loadPussleA,
} from '../redux/actions';
import {
  RootState,
  BoardProps,
  CLEAR_CELL,
  CLEAR_RESTRICTED_CELLS,
  SET_BIG_NUM,
  SET_CENTER_PENCIL,
  SET_CORNER_PENCIL,
  SET_IS_LOADING,
  SET_RESTRICTED_CELLS,
  SET_SELECTED_CELLS,
} from '../types';
import Cell from './Cell';
import {
  findNextCell,
  findRestrictedCells, isArrowOrDelKey, isValidNumber,
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
    if (selectedCells && selectedCells.length === 1) {
      const restrictedCells = findRestrictedCells(selectedCells[0]);
      dispatch(SET_RESTRICTED_CELLS, { restrictedCells });
    } else {
      dispatch(CLEAR_RESTRICTED_CELLS, {});
    }
  }, [selectedCells]);

  const targetNextCell = (shift: boolean, direction: 'up' | 'down' | 'left' | 'right') => {
    const nextCell = findNextCell(selectedCells[selectedCells.length - 1], direction);
    if (!nextCell) return;
    if (shift) {
      dispatch(
        SET_SELECTED_CELLS,
        { selectedCells: [...selectedCells, nextCell] },
      );
    } else {
      dispatch(
        SET_SELECTED_CELLS,
        { selectedCells: [nextCell] },
      );
    }
  };

  // Handles inputs
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.repeat) return;
    if (!isValidNumber(e.key) && !isArrowOrDelKey(e.key)) return;
    e.preventDefault();

    switch (e.key) {
      // Delete keys
      case 'Backspace':
        selectedCells.forEach((el) => dispatch(CLEAR_CELL, { cellId: el }));
        break;
      case 'Delete':
        selectedCells.forEach((el) => dispatch(CLEAR_CELL, { cellId: el }));
        break;
      // Arrow Keys
      case 'ArrowDown':
        targetNextCell(e.shiftKey, 'down');
        break;
      case 'ArrowUp':
        targetNextCell(e.shiftKey, 'up');
        break;
      case 'ArrowLeft':
        targetNextCell(e.shiftKey, 'left');
        break;
      case 'ArrowRight':
        targetNextCell(e.shiftKey, 'right');
        break;
      // Numbers
      default:
        if (e.altKey) {
          selectedCells.forEach((el) => dispatch(SET_CORNER_PENCIL, { cellId: el, number: e.key }));
        } else if (e.ctrlKey || e.metaKey) {
          selectedCells.forEach((el) => dispatch(SET_CENTER_PENCIL, { cellId: el, number: e.key }));
        } else {
          selectedCells.forEach((el) => dispatch(SET_BIG_NUM, { cellId: el, number: e.key }));
        }
    }
  };

  // Renders the board with its content
  const renderBoard = () => {
    let cellArray: JSX.Element[] = [];
    let rowArray: JSX.Element[] = [];

    for (let x = 1; x <= 9; x += 1) {
      for (let y = 0; y < 9; y += 1) {
        rowArray = [...rowArray, <Cell key={`cell_${columns[x]}${y}`} index={(x + 1) * y} id={`${columns[y]}${x}`} />];
      }
      cellArray = [...cellArray, <div key={`column_${x}`} className="board_row">{rowArray}</div>];
      rowArray = [];
    }

    return cellArray;
  };

  return (
    <>
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
