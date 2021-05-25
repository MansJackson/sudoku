import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import '../styles/Board.css';
import {
  clearCellA,
  clearRestrictedCellsA,
  loadPussleA,
  setBigNumA,
  setCenterPencilA,
  setCornerPencilA,
  setIsLoadingA,
  setKeyA,
  setRestrictedCellsA,
} from '../redux/actions';
import { BoardProps, RootState } from '../types';
import Cell from './Cell';
import { convertNumLockShift, convertShiftNumber } from '../utils';

const Board = (props: BoardProps): JSX.Element => {
  const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
  const {
    isLoading,
    keys,
    selectedCells,
    loadPussle,
    setIsLoading,
    setKey,
    setBigNum,
    setCornerPencil,
    setCenterPencil,
    clearCell,
    setRestrictedCells,
    clearRestrictedCells,
  } = props;

  // KeyUp Event Listener
  useEffect(() => {
    document.addEventListener('keyup', (e) => {
      if (e.key === 'Shift') setKey({ shift: false });
      if (e.key === 'Control') setKey({ ctrl: false });
      if (e.key === 'Meta') setKey({ meta: false });
    });

    return (
      document.removeEventListener('keyup', (e) => {
        if (e.key === 'Shift') setKey({ shift: false });
        if (e.key === 'Control') setKey({ ctrl: false });
        if (e.key === 'Meta') setKey({ meta: false });
      })
    );
  }, []);

  // KeyDown Event Listener
  useEffect(() => {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Shift') if (!keys.shift) setKey({ shift: true });
      if (e.key === 'Control') if (!keys.ctrl) setKey({ ctrl: true });
      if (e.key === 'Meta') if (!keys.ctrl) setKey({ meta: true });
    });

    return (
      document.removeEventListener('keydown', (e) => {
        if (e.key === 'Shift') if (!keys.shift) setKey({ shift: true });
        if (e.key === 'Control') if (!keys.ctrl) setKey({ ctrl: true });
        if (e.key === 'Meta') if (!keys.ctrl) setKey({ meta: true });
      })
    );
  }, []);

  // LoadPussle
  useEffect(() => {
    loadPussle(true);
    setIsLoading(false);
  }, []);

  // update restricted cells
  useEffect(() => {
    if (selectedCells.length === 1) setRestrictedCells(selectedCells[0]);
    else clearRestrictedCells();
  }, [selectedCells]);

  // Handles inputs
  const handleKeyPress = (e: React.KeyboardEvent) => {
    const cells = document.querySelectorAll('.cell');
    e.preventDefault();
    if (e.repeat) return;

    if (e.key === 'Backspace') {
      cells.forEach((el) => {
        if (el.classList.contains('selected')) clearCell(el.id);
      });
      return;
    }
    if (e.getModifierState('NumLock') && convertNumLockShift(e.key)) {
      const key = convertNumLockShift(e.key);
      if (!key) return;
      cells.forEach((el) => {
        if (el.classList.contains('selected')) setCornerPencil(el.id, key);
      });
    } else if (keys.shift) {
      const key = convertShiftNumber(e.key);
      if (!key) return;
      cells.forEach((el) => {
        if (el.classList.contains('selected')) setCornerPencil(el.id, key);
      });
    } else if (keys.ctrl) {
      cells.forEach((el) => {
        if (el.classList.contains('selected')) setCenterPencil(el.id, e.key);
      });
    } else if (keys.meta) {
      cells.forEach((el) => {
        if (el.classList.contains('selected')) setCenterPencil(el.id, e.key);
      });
    } else {
      cells.forEach((el) => {
        if (el.classList.contains('selected')) {
          setBigNum(el.id, e.key);
        }
      });
    }
  };

  const lockPussle = () => {
    const cellsToLock = document.querySelectorAll('.big_num');
    const pussle: Record<string, string> = {};
    cellsToLock.forEach((el) => {
      pussle[el.parentElement!.id] = el.innerHTML;
    });
    loadPussle(false, pussle);
  };

  // Renders the board with content
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
      <div className="board" onKeyDown={handleKeyPress}>
        {isLoading ? <p>Loading...</p> : renderBoard()}
      </div>
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  board: state.board,
  isLoading: state.general.isLoading,
  keys: state.keys,
  selectedCells: state.general.selectedCells,
});

export default connect(mapStateToProps, {
  loadPussle: loadPussleA,
  setIsLoading: setIsLoadingA,
  setKey: setKeyA,
  setCornerPencil: setCornerPencilA,
  setCenterPencil: setCenterPencilA,
  setBigNum: setBigNumA,
  clearCell: clearCellA,
  setRestrictedCells: setRestrictedCellsA,
  clearRestrictedCells: clearRestrictedCellsA,
})(Board);
