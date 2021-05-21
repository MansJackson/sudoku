import React from 'react';
import { connect } from 'react-redux';
import { setMouseDownA, setSelectedCountA, setSelectingA } from '../redux/actions';
import { CellOwnProps, CellProps, RootState } from '../types';

const Cell: React.FunctionComponent<CellProps & CellOwnProps> = (
  props: CellProps & CellOwnProps,
): JSX.Element => {
  const {
    id,
    board,
    selecting,
    mouseDown,
    keys,
    selectedCount,
    setSelecting,
    setMouseDown,
    setSelectedCount,
  } = props;
  const content = board.find((el) => el.id === id);

  const handleMouseOver = (e: React.MouseEvent<HTMLDivElement>) => {
    const classes = e.currentTarget.classList;
    if (mouseDown) {
      if (selecting === true) {
        if (!classes.contains('selected')) {
          classes.add('selected');
          setSelectedCount(selectedCount + 1);
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
    let count = selectedCount;

    if (!keys.shift) {
      if (selectedCount === 1 && classes.contains('selected')) {
        classes.remove('selected');
        setSelectedCount(0);
        return;
      }
      document.querySelectorAll('.cell').forEach((el) => {
        if (el.classList.contains('selected')) el.classList.remove('selected');
      });
      setSelectedCount(0);
      count = 0;
    }

    if (classes.contains('selected')) {
      classes.remove('selected');
      setSelectedCount(count - 1);
      setSelecting(false);
    } else {
      classes.add('selected');
      setSelectedCount(count + 1);
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
  keys: state.keys,
  selectedCount: state.general.selectedCount,
});

export default connect(mapStateToProps, {
  setSelecting: setSelectingA,
  setMouseDown: setMouseDownA,
  setSelectedCount: setSelectedCountA,
})(Cell);
