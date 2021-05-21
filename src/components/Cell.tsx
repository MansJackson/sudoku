import React from 'react';
import { connect } from 'react-redux';
import { setMouseDownA, setSelectingA } from '../redux/actions';
import { CellOwnProps, CellProps, RootState } from '../types';

const Cell: React.FunctionComponent<CellProps & CellOwnProps> = (
  props: CellProps & CellOwnProps,
): JSX.Element => {
  const {
    id, board, selecting, mouseDown, setSelecting, setMouseDown,
  } = props;
  const content = board.find((el) => el.id === id);

  const handleMouseOver = (e: React.MouseEvent<HTMLDivElement>) => {
    const classes = e.currentTarget.classList;
    if (mouseDown) {
      if (selecting === true) {
        if (!classes.contains('selected')) {
          classes.add('selected');
        }
      } else if (selecting === false) {
        if (classes.contains('selected')) {
          classes.remove('selected');
        }
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const classes = e.currentTarget.classList;
    if (classes.contains('selected')) {
      classes.remove('selected');
      setSelecting(false);
    } else {
      classes.add('selected');
      setSelecting(true);
    }
    setMouseDown(true);
  };

  const handleMouseUp = () => {
    setSelecting(null);
    setMouseDown(false);
  };

  return (
    <div
      onMouseEnter={handleMouseOver}
      onMouseUp={handleMouseUp}
      onMouseDown={handleMouseDown}
      className={`cell ${content?.locked ? 'locked' : ''}`}
      id={id}
    >
      {content?.bigNum !== '' ? content?.bigNum : ''}
    </div>
  );
};

const mapStateToProps = (state: RootState, ownProps: CellOwnProps) => ({
  board: state.board,
  id: ownProps.id,
  selecting: state.general.selecting,
  mouseDown: state.general.mouseDown,
});

export default connect(mapStateToProps, {
  setSelecting: setSelectingA,
  setMouseDown: setMouseDownA,
})(Cell);
