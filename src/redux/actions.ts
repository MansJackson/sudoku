import { Dispatch } from 'redux';
import {
  Cell,
  SET_PUSSLE,
} from '../types';

export const loadPussleA = (blank: boolean, pussle?: Record<string, string>) => (
  dispatch: Dispatch,
): void => {
  const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
  let setup: Cell[] = [];

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
        },
      ];
    }
  }

  dispatch({
    type: SET_PUSSLE,
    payload: {
      cell: setup,
    },
  });
};

export const dispatchA = (type: string, payload: any) => (dispatch: Dispatch): void => {
  dispatch({
    type,
    payload,
  });
};
