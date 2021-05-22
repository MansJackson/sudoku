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
    index,
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

  const renderCellContent = () => {
    if (content?.bigNum) return <div className={`big_num ${content.locked ? 'locked' : ''}`}>{content.bigNum}</div>;
    if (content?.centerPencil.length) return <div className="center_pencil">{content.centerPencil}</div>;
    if (content?.cornerPencil.length) {
      const mapped = content.cornerPencil.map((el, i) => <div key={el} className={`corner_${i}`}>{el}</div>);
      return <div className="corner_pencil">{mapped}</div>;
    }
    return '';
  };

  return (
    <div
      onMouseEnter={handleMouseOver}
      onMouseUp={handleMouseUp}
      onMouseDown={handleMouseDown}
      className={`cell ${content?.locked ? 'locked' : ''}`}
      id={id}
      tabIndex={index}
    >
      {renderCellContent()}
    </div>
  );
};

const mapStateToProps = (state: RootState, ownProps: CellOwnProps) => ({
  board: state.board,
  id: ownProps.id,
  index: ownProps.index,
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
