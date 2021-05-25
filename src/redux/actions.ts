import { Dispatch } from 'redux';
import data from '../pussles.json';
import {
  Cell,
  SET_IS_LOADING,
  SET_PUSSLE,
  SET_SELECTING,
  SET_MOUSE_DOWN,
  SET_KEY,
  SET_SELECTED_COUNT,
  SET_CORNER_PENCIL,
  SET_CENTER_PENCIL,
  SET_BIG_NUM,
  CLEAR_CELL,
  SET_RESTRICTED_CELLS,
  CLEAR_RESTRICTED_CELLS,
  SET_SELECTED_CELLS,
} from '../types';
import { findRestrictedCells } from '../utils';

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
    cell: setup,
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

export const setKeyA = (payload: Record<string, boolean>) => (dispatch: Dispatch): void => {
  dispatch({
    type: SET_KEY,
    payload,
  });
};

export const setSelectedCountA = (payload: number) => (dispatch: Dispatch): void => {
  dispatch({
    type: SET_SELECTED_COUNT,
    selectedCount: payload,
  });
};

export const setCornerPencilA = (cellId: string, number: string) => (dispatch: Dispatch): void => {
  dispatch({
    type: SET_CORNER_PENCIL,
    cellId,
    number,
  });
};

export const setCenterPencilA = (cellId: string, number: string) => (dispatch: Dispatch): void => {
  dispatch({
    type: SET_CENTER_PENCIL,
    cellId,
    number,
  });
};

export const setBigNumA = (cellId: string, number: string) => (dispatch: Dispatch): void => {
  dispatch({
    type: SET_BIG_NUM,
    cellId,
    number,
  });
};

export const clearCellA = (cellId: string) => (dispatch: Dispatch): void => {
  dispatch({
    type: CLEAR_CELL,
    cellId,
  });
};

export const setRestrictedCellsA = (cellId: string) => (dispatch: Dispatch): void => {
  const restrictedCells = findRestrictedCells(cellId);
  dispatch({
    type: SET_RESTRICTED_CELLS,
    restrictedCells,
  });
};

export const clearRestrictedCellsA = () => (dispatch: Dispatch): void => {
  dispatch({
    type: CLEAR_RESTRICTED_CELLS,
  });
};

export const updateSelectedCellsA = () => (dispatch: Dispatch): void => {
  const cells = document.querySelectorAll('.selected');
  let selected: string[] = [];

  cells.forEach((el) => {
    if (el.classList.contains('selected')) selected = [...selected, el.id];
  });

  console.log(selected);
  dispatch({
    type: SET_SELECTED_CELLS,
    selectedCells: selected,
  });
};
