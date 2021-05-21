import { Dispatch } from 'redux';
import data from '../pussles.json';
import {
  Cell, SET_IS_LOADING, SET_PUSSLE, SET_SELECTING, SET_MOUSE_DOWN,
} from '../types';

export const loadPussleA = () => (dispatch: Dispatch): void => {
  const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
  let setup: Cell[] = [];

  for (let x = 0; x < 9; x += 1) {
    for (let y = 1; y <= 9; y += 1) {
      const pussle = data.hard[0];
      const id = `${columns[x]}${y}`;
      const exists = !!pussle[id as keyof typeof pussle];

      setup = [
        ...setup,
        {
          id,
          centerPencil: [],
          cornerPencil: [],
          bigNum: exists ? pussle[id as keyof typeof pussle] : '',
          locked: exists,
        },
      ];
    }
  }

  dispatch({
    type: SET_PUSSLE,
    payload: setup,
  });
};

export const setIsLoadingA = (isLoading: boolean) => (dispatch: Dispatch): void => {
  dispatch({
    type: SET_IS_LOADING,
    isLoading,
  });
};

export const setSelectingA = (payload: boolean | null) => (dispatch: Dispatch): void => {
  dispatch({
    type: SET_SELECTING,
    selecting: payload,
  });
};

export const setMouseDownA = (payload: boolean) => (dispatch: Dispatch): void => {
  dispatch({
    type: SET_MOUSE_DOWN,
    mouseDown: payload,
  });
};
