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
  CLEAR_RESTRICTED_CELLS,
  SET_IS_LOADING,
  SET_RESTRICTED_CELLS,
  SET_SELECTED_CELLS,
  TOGGLE_MODE,
  SET_PUSSLE,
  ADD_TO_HISTORY,
  SET_PUSSLE_STARTED,
  CellT,
} from '../lib/types';
import Cell from './Cell';
import {
  findNextCell,
  findRestrictedCells, isOtherValidKey, isValidNumber, updateBoard,
} from '../lib/utils';

const Board = (props: BoardProps): JSX.Element => {
  const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
  const {
    isLoading,
    selectedCells,
    restrictedCells,
    selectedMode,
    history,
    board,
    settings,
    loadPussle,
    dispatch,
  } = props;

  // set loading to false on mount
  useEffect(() => {
    dispatch(SET_IS_LOADING, { isLoading: false });
  }, []);

  // Update board when history changes
  useEffect(() => {
    if (!history.length) {
      loadPussle(true);
      dispatch(SET_IS_LOADING, { isLoading: false });
      return;
    }
    if (history[history.length - 1].board.find((el: CellT) => el.locked)) {
      dispatch(SET_PUSSLE_STARTED, { pussleStarted: true });
    }
    dispatch(SET_PUSSLE, { cell: history[history.length - 1].board });
  }, [history]);

  // update restricted cells when selected cells update
  useEffect(() => {
    if (!settings.markRestricted) {
      if (restrictedCells.length) dispatch(CLEAR_RESTRICTED_CELLS, {});
      return;
    }
    if (selectedCells) {
      const restricted = findRestrictedCells(selectedCells);
      dispatch(SET_RESTRICTED_CELLS, { restrictedCells: restricted });
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
    if (!isValidNumber(e.key) && !isOtherValidKey(e.key)) return;
    if (!selectedCells.length) return;
    e.preventDefault();
    let newBoard = [...board];

    switch (e.key) {
      case ' ':
        dispatch(TOGGLE_MODE, {});
        break;
      // Delete keys
      case 'Backspace':
        selectedCells.forEach((el) => { newBoard = updateBoard(newBoard, el, '1', 'delete', undefined, settings.highlightErrors); });
        dispatch(ADD_TO_HISTORY, { board: newBoard });
        break;
      case 'Delete':
        selectedCells.forEach((el) => { newBoard = updateBoard(newBoard, el, '1', 'delete', undefined, settings.highlightErrors); });
        dispatch(ADD_TO_HISTORY, { board: newBoard });
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
        if (e.altKey || e.metaKey || selectedMode === 'corner') {
          selectedCells.forEach((el) => { newBoard = updateBoard(newBoard, el, e.key, 'corner'); });
        } else if (e.ctrlKey || selectedMode === 'center') {
          selectedCells.forEach((el) => { newBoard = updateBoard(newBoard, el, e.key, 'center'); });
        } else if (selectedMode === 'color') {
          selectedCells.forEach((el) => { newBoard = updateBoard(newBoard, el, e.key, 'color'); });
        } else {
          selectedCells.forEach((el) => {
            newBoard = updateBoard(newBoard, el, e.key, 'normal', settings.removePencilMarks, settings.highlightErrors);
          });
        }
        dispatch(ADD_TO_HISTORY, { board: newBoard });
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
  selectedMode: state.general.mode,
  history: state.history,
  board: state.board,
  settings: state.general.settings,
  restrictedCells: state.general.restrictedCells,
});

export default connect(mapStateToProps, {
  dispatch: dispatchA,
  loadPussle: loadPussleA,
})(Board);
