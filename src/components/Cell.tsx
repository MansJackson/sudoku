import React, { useState } from 'react';
import { connect } from 'react-redux';
import { CellOwnProps, CellProps, RootState } from '../types';

const Cell: React.FunctionComponent<CellProps & CellOwnProps> = (
  props: CellProps & CellOwnProps,
): JSX.Element => {
  const { id, board } = props;
  const content = board.find((el) => el.id === id);
  const [mouseDown, setMouseDown] = useState(false);
  const [selecting, setSelecting] = useState<null | boolean>(null);

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

  return (
    <div
      onMouseEnter={handleMouseOver}
      onMouseUp={() => {
        setSelecting(null);
        setMouseDown(false);
      }}
      onMouseDown={(e) => {
        const classes = e.currentTarget.classList;
        if (classes.contains('selected')) {
          classes.remove('selected');
          setSelecting(false);
        } else {
          classes.add('selected');
          setSelecting(true);
        }
        setMouseDown(true);
      }}
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
});

export default connect(mapStateToProps, {})(Cell);
