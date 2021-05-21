import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import '../styles/Board.css';
import {
  loadPussleA, setIsLoadingA, setKeyA,
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

  const renderBoard = () => {
    let cellArray: JSX.Element[] = [];
    let rowArray: JSX.Element[] = [];

    for (let x = 0; x < 9; x += 1) {
      for (let y = 1; y <= 9; y += 1) {
        rowArray = [...rowArray, <Cell key={`${columns[x]}${y}`} id={`${columns[x]}${y}`} />];
      }
      cellArray = [...cellArray, <div key={x} className="board_row">{rowArray}</div>];
      rowArray = [];
    }

    return cellArray;
  };

  return (
    <div className="board">
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
})(Board);
