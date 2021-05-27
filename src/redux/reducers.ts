import { combineReducers } from 'redux';
import {
  Cell,
  SET_PUSSLE,
  SET_IS_LOADING,
  SET_SELECTING,
  SET_MOUSE_DOWN,
  SET_CORNER_PENCIL,
  SET_CENTER_PENCIL,
  SET_BIG_NUM,
  CLEAR_CELL,
  SET_RESTRICTED_CELLS,
  CLEAR_RESTRICTED_CELLS,
  SET_SELECTED_CELLS,
  GeneralAction,
  BoardAction,
  CLEAR_PUSSLE,
  SET_SELECTED_MODE,
  TOGGLE_MODE,
} from '../types';
import { findRestrictedCells, isValidNumber } from '../utils';

const defaultBoardState: Cell[] = [];
const defaultGeneralState = {
  isLoading: true,
  mouseDown: false,
  selecting: null,
  mode: 'normal',
  restrictedCells: [],
  selectedCells: [],
};

const generalReducer = (state = defaultGeneralState, action: GeneralAction) => {
  const { payload } = action;

  switch (action.type) {
    case SET_IS_LOADING:
      return { ...state, isLoading: payload.isLoading };
    case SET_SELECTING:
      return { ...state, selecting: payload.selecting };
    case SET_MOUSE_DOWN:
      return { ...state, mouseDown: payload.mouseDown };
    case SET_RESTRICTED_CELLS:
      return { ...state, restrictedCells: payload.restrictedCells };
    case CLEAR_RESTRICTED_CELLS:
      return { ...state, restrictedCells: [] };
    case SET_SELECTED_CELLS:
      return { ...state, selectedCells: payload.selectedCells };
    case SET_SELECTED_MODE:
      return { ...state, mode: payload.mode };
    case TOGGLE_MODE:
      if (state.mode === 'normal') return { ...state, mode: 'corner' };
      if (state.mode === 'corner') return { ...state, mode: 'center' };
      if (state.mode === 'center') return { ...state, mode: 'color' };
      if (state.mode === 'color') return { ...state, mode: 'normal' };
      return state;
    default:
      return state;
  }
};

const boardReducer = (state = defaultBoardState, action: BoardAction) => {
  const { payload } = action;
  let filteredBoard: Cell[] = [];
  let targetCell: Cell | undefined;
  let restrictedCells: string[] = [];

  switch (action.type) {
    case SET_PUSSLE:
      return payload.cell;

    case SET_CORNER_PENCIL:
      filteredBoard = state.filter((el) => el.id !== payload.cellId);
      targetCell = state.find((el) => el.id === payload.cellId);

      if (targetCell?.locked) return state;
      if (!isValidNumber(payload.number)) return state;
      if (targetCell?.cornerPencil.includes(payload.number)) {
        targetCell = {
          ...targetCell,
          cornerPencil: targetCell.cornerPencil.filter((el) => (
            el !== payload.number
          )),
        };
      } else {
        targetCell = {
          ...targetCell!,
          cornerPencil: [...targetCell!.cornerPencil, payload.number],
        };
      }
      return [...filteredBoard, targetCell];

    case SET_CENTER_PENCIL:
      filteredBoard = state.filter((el) => el.id !== payload.cellId);
      targetCell = state.find((el) => el.id === payload.cellId);

      if (targetCell?.locked) return state;
      if (!isValidNumber(payload.number)) return state;
      if (targetCell?.centerPencil.includes(payload.number)) {
        targetCell = {
          ...targetCell,
          centerPencil: targetCell.centerPencil.filter((el) => (
            el !== payload.number
          )),
        };
      } else {
        targetCell = {
          ...targetCell!,
          centerPencil: [...targetCell!.centerPencil, payload.number],
        };
      }
      return [...filteredBoard, targetCell];

    case SET_BIG_NUM:
      restrictedCells = findRestrictedCells(payload.cellId);
      filteredBoard = state.filter((el) => el.id !== payload.cellId);
      targetCell = state.find((el) => el.id === payload.cellId);

      if (targetCell?.locked) return state;
      if (!isValidNumber(payload.number)) return state;

      filteredBoard = filteredBoard.map((cell) => {
        if (!restrictedCells.includes(cell.id)) return cell;
        if (cell.locked) return cell;
        const newCenter = cell.centerPencil.filter((num) => num !== payload.number);
        const newCorner = cell.cornerPencil.filter((num) => num !== payload.number);
        return { ...cell, cornerPencil: newCorner, centerPencil: newCenter };
      });

      targetCell = { ...targetCell!, bigNum: payload.number };
      return [...filteredBoard, targetCell];

    case CLEAR_CELL:
      filteredBoard = state.filter((el) => el.id !== payload.cellId);
      targetCell = state.find((el) => el.id === payload.cellId);

      if (targetCell?.locked) return state;
      targetCell = {
        ...targetCell!, bigNum: '', cornerPencil: [], centerPencil: [],
      };
      return [...filteredBoard, targetCell];

    case CLEAR_PUSSLE:
      return state.map((cell) => {
        if (cell.locked) return cell;
        return {
          ...cell,
          bigNum: '',
          cornerPencil: [],
          centerPencil: [],
        };
      });

    default:
      return state;
  }
};

export default combineReducers({
  board: boardReducer,
  general: generalReducer,
});
