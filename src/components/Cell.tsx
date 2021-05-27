import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
  dispatchA,
  updateSelectedCellsA,
} from '../redux/actions';
import {
  CellOwnProps, CellProps, RootState, SET_MOUSE_DOWN, SET_SELECTING,
} from '../types';

const Cell: React.FunctionComponent<CellProps & CellOwnProps> = (
  props: CellProps & CellOwnProps,
): JSX.Element => {
  const {
    id,
    board,
    index,
    selecting,
    mouseDown,
    selectedCells,
    restrictedCells,
    updateSelectedCells,
    dispatch,
  } = props;
  const content = board.find((el) => el.id === id);
  const [restricted, setRestricted] = useState(false);
  const [selected, setSelected] = useState(false);

  // if this cell is in restriced cells array, set local state to true
  useEffect(() => {
    if (!content) return;
    if (restrictedCells && restrictedCells.includes(content.id)) {
      setRestricted(true);
    } else if (restricted) setRestricted(false);
  }, [restrictedCells]);

  // If this cell is in selected array, set local state to true
  useEffect(() => {
    if (!content) return;
    if (selectedCells && selectedCells.includes(content.id)) {
      setSelected(true);
    } else if (selected) setSelected(false);
  }, [selectedCells]);

  // Should refactor this to not use classlist but state instead
  const handleMouseOver = (e: React.MouseEvent<HTMLDivElement>) => {
    const classes = e.currentTarget.classList;
    if (mouseDown) {
      if (selecting) {
        if (!classes.contains('selected')) {
          classes.add('selected');
          updateSelectedCells();
        }
      } else if (selecting === false) {
        if (classes.contains('selected')) {
          classes.remove('selected');
          updateSelectedCells();
        }
      }
    }
  };

  // Should refactor this to not use classlist but state instead
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.nativeEvent.button !== 0) return;
    const classes = e.currentTarget.classList;
    const count = selectedCells.length;

    // If the shift key is not held down => clear selections
    if (!e.shiftKey) {
      if (count === 1 && classes.contains('selected')) {
        classes.remove('selected');
        updateSelectedCells();
        return;
      }
      document.querySelectorAll('.cell').forEach((el) => {
        if (el.classList.contains('selected')) el.classList.remove('selected');
      });
    }

    // Removes or adds 'selected' to the clicked cell
    if (classes.contains('selected')) {
      classes.remove('selected');
      dispatch(SET_SELECTING, { selecting: false });
    } else {
      classes.add('selected');
      dispatch(SET_SELECTING, { selecting: true });
    }
    updateSelectedCells();
    dispatch(SET_MOUSE_DOWN, { mouseDown: true });
  };

  const handleMouseUp = () => {
    dispatch(SET_SELECTING, { selecting: null });
    dispatch(SET_MOUSE_DOWN, { mouseDown: false });
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
      className={`cell ${content?.locked ? 'locked' : ''} ${restricted ? 'restricted' : ''} ${selected ? 'selected' : ''}`}
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
  selectedCells: state.general.selectedCells,
  restrictedCells: state.general.restrictedCells,
});

export default connect(mapStateToProps, {
  updateSelectedCells: updateSelectedCellsA,
  dispatch: dispatchA,
})(Cell);
