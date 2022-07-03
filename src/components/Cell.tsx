import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { dispatchA } from '../redux/actions';
import {
  CellOwnProps, CellProps, RootState, SET_MOUSE_DOWN, SET_SELECTED_CELLS, SET_SELECTING,
} from '../lib/types';

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
    settings,
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

  // If leftMouse Is Down select or deselect on hover
  const handleMouseOver = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mouseDown) {
      let selectedCopy = [...selectedCells];
      const cellId = e.currentTarget.id;
      const isSelected = selectedCopy.includes(cellId);

      if (selecting && !isSelected) selectedCopy = [...selectedCopy, cellId];
      if (!selecting && isSelected) {
        selectedCopy = selectedCopy.filter((el) => (el !== cellId));
      }
      dispatch(SET_SELECTED_CELLS, { selectedCells: selectedCopy });
    }
  };

  // Handles selecting cells in grid
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.nativeEvent.button !== 0) return;
    let selectedCopy = selectedCells.length ? [...selectedCells] : [];
    const count = selectedCopy.length;
    let isSelected = selectedCopy.includes(content!.id);

    // If the shift key is not held down => clear selections
    if (!e.shiftKey) {
      if (count === 1 && isSelected) {
        dispatch(SET_SELECTED_CELLS, { selectedCells: [] });
        return;
      }
      selectedCopy = [];
      isSelected = selectedCopy.includes(content!.id);
    }

    // Removes or adds 'selected' to the clicked cell
    if (isSelected) {
      selectedCopy = selectedCopy.filter((el) => el !== content!.id);
      dispatch(SET_SELECTING, { selecting: false });
    } else {
      selectedCopy = [...selectedCopy, content!.id];
      dispatch(SET_SELECTING, { selecting: true });
    }
    dispatch(SET_SELECTED_CELLS, { selectedCells: selectedCopy });
    dispatch(SET_MOUSE_DOWN, { mouseDown: true });
  };

  const handleMouseUp = () => {
    dispatch(SET_SELECTING, { selecting: null });
    dispatch(SET_MOUSE_DOWN, { mouseDown: false });
  };

  const renderCellContent = () => {
    let render: JSX.Element[] = [];
    if (content?.bigNum) return <div className={`big_num ${content.locked ? 'locked' : ''}`}>{content.bigNum}</div>;
    if (content?.centerPencil.length) render = [<div key={`center_${content.id}`} className="center_pencil">{content.centerPencil}</div>];
    if (content?.cornerPencil.length) {
      const mapped = content.cornerPencil.map((el, i) => <div key={el} className={`corner_${i}`}>{el}</div>);
      render = [...render, <div key={`corner_${content.id}`} className="corner_pencil">{mapped}</div>];
    }
    return render;
  };

  return (
    <div
      onMouseEnter={handleMouseOver}
      onMouseUp={handleMouseUp}
      onMouseDown={handleMouseDown}
      className={`
        cell
        ${content?.locked ? 'locked' : ''}
        ${content?.error && settings.highlightErrors ? 'error' : ''}
        ${restricted && settings.markRestricted ? 'restricted' : ''}
        ${selected ? 'selected' : ''}
        bg_${content?.color || ''}
      `}
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
  settings: state.general.settings,
});

export default connect(mapStateToProps, {
  dispatch: dispatchA,
})(Cell);
