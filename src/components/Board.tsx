import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import '../styles/Board.css';
import {
  clearCellA,
  loadPussleA, setBigNumA, setCenterPencilA, setCornerPencilA, setIsLoadingA, setKeyA,
} from '../redux/actions';
import { BoardProps, RootState } from '../types';
import Cell from './Cell';

const Board = (props: BoardProps): JSX.Element => {
  const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
  const {
    isLoading,
    keys,
    loadPussle,
    setIsLoading,
    setKey,
    setBigNum,
    setCornerPencil,
    setCenterPencil,
    clearCell,
  } = props;

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
  });

  useEffect(() => {
    loadPussle();
    setIsLoading(false);
  }, []);

  const convertShiftNumber = (input: string): string | false => {
    switch (input) {
      case '!': return '1';
      case '"': return '2';
      case '#': return '3';
      case '€': return '4';
      case '%': return '5';
      case '&': return '6';
      case '/': return '7';
      case '(': return '8';
      case ')': return '9';
      default: return false;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    const cells = document.querySelectorAll('.cell');
    if (e.repeat) return;

    if (e.key === 'Backspace') {
      cells.forEach((el) => {
        if (el.classList.contains('selected')) clearCell(el.id);
      });
      return;
    }
    if (keys.shift) {
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
    <div className="board" onKeyDown={handleKeyPress}>
      {isLoading ? <p>Loading...</p> : renderBoard()}
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  board: state.board,
  isLoading: state.general.isLoading,
  keys: state.keys,
});

export default connect(mapStateToProps, {
  loadPussle: loadPussleA,
  setIsLoading: setIsLoadingA,
  setKey: setKeyA,
  setCornerPencil: setCornerPencilA,
  setCenterPencil: setCenterPencilA,
  setBigNum: setBigNumA,
  clearCell: clearCellA,
})(Board);
