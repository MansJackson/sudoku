import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import '../styles/Board.css';
import { loadPussleA, setIsLoadingA } from '../redux/actions';
import { BoardProps, RootState } from '../types';
import Cell from './Cell';

const Board = (props: BoardProps): JSX.Element => {
  const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
  const {
    isLoading,
    loadPussle,
    setIsLoading,
  } = props;

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
});

export default connect(mapStateToProps, {
  loadPussle: loadPussleA,
  setIsLoading: setIsLoadingA,
})(Board);
