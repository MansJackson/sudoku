import { combineReducers } from 'redux';
import {
  Cell,
  SET_PUSSLE,
  SET_IS_LOADING,
  SET_SELECTING,
  SET_MOUSE_DOWN,
  SET_SELECTED_COUNT,
  SET_CORNER_PENCIL,
  SET_CENTER_PENCIL,
  SET_BIG_NUM,
  CLEAR_CELL,
  SET_RESTRICTED_CELLS,
  CLEAR_RESTRICTED_CELLS,
  SET_SELECTED_CELLS,
  GeneralAction,
  BoardAction,
} from '../types';
import { isValidNumber } from '../utils';

const defaultBoardState: Cell[] = [];
const defaultGeneralState = {
  isLoading: true,
  mouseDown: false,
  selecting: null,
  selectedCount: 0,
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
    case SET_SELECTED_COUNT:
      return { ...state, selectedCount: payload.selectedCount };
    case SET_RESTRICTED_CELLS:
      return { ...state, restrictedCells: payload.restrictedCells };
    case CLEAR_RESTRICTED_CELLS:
      return { ...state, restrictedCells: [] };
    case SET_SELECTED_CELLS:
      return { ...state, selectedCells: payload.selectedCells };
    default:
      return state;
  }
};

const boardReducer = (state = defaultBoardState, action: BoardAction) => {
  const { payload } = action;
  let filteredBoard: Cell[] = [];
  let targetCell: Cell | undefined;

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
      filteredBoard = state.filter((el) => el.id !== payload.cellId);
      targetCell = state.find((el) => el.id === payload.cellId);

      if (targetCell?.locked) return state;
      if (!isValidNumber(payload.number)) return state;
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

    default:
      return state;
  }
};

export default combineReducers({
  board: boardReducer,
  general: generalReducer,
});
