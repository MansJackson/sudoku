import { Dispatch } from 'redux';
import {
  ADD_TO_HISTORY,
  CellT,
  CLEAR_HISTORY,
} from '../lib/types';

export const loadPussleA = (blank: boolean, pussle?: Record<string, string>, userCreated?: boolean) => (
  dispatch: Dispatch,
): void => {
  const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
  let setup: CellT[] = [];

  for (let x = 0; x < 9; x += 1) {
    for (let y = 1; y <= 9; y += 1) {
      const id = `${columns[x]}${y}`;
      const exists = blank ? false : !!pussle![id as keyof typeof pussle];

      setup = [
        ...setup,
        {
          id,
          centerPencil: [],
          cornerPencil: [],
          bigNum: exists ? pussle![id as keyof typeof pussle] : '',
          locked: exists,
          error: false,
          color: '1',
        },
      ];
    }
  }

  if (userCreated) {
    dispatch({
      type: ADD_TO_HISTORY,
      payload: {
        board: setup,
      },
    });
  } else {
    dispatch({
      type: CLEAR_HISTORY,
      payload: {
        board: setup,
      },
    });
  }
};

export const dispatchA = (type: string, payload: Record<string, any>) => (dispatch: Dispatch): void => {
  dispatch({
    type,
    payload,
  });
};
