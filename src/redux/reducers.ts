import { combineReducers } from 'redux';
import {
  BoardAction,
  Cell,
  ADD_TO_HISTORY,
  SET_PUSSLE,
  GeneralAction,
  SET_IS_LOADING,
  SET_SELECTING,
  SET_MOUSE_DOWN,
  KeyAction,
  SET_KEY,
  SET_SELECTED_COUNT,
  SET_CORNER_PENCIL,
  SET_CENTER_PENCIL,
  SET_BIG_NUM,
  CLEAR_CELL,
} from '../types';
import { isValidNumber } from '../utils';

const defaultBoardState: Cell[] = [];
const defaultGeneralState = {
  isLoading: true,
  mouseDown: false,
  selecting: null,
  selectedCount: 0,
};
const defaultKeyState = {
  shift: false,
  ctrl: false,
  meta: false,
};

const generalReducer = (state = defaultGeneralState, action: GeneralAction) => {
  switch (action.type) {
    case SET_IS_LOADING:
      return { ...state, isLoading: action.isLoading };
    case SET_SELECTING:
      return { ...state, selecting: action.selecting };
    case SET_MOUSE_DOWN:
      return { ...state, mouseDown: action.mouseDown };
    case SET_SELECTED_COUNT:
      return { ...state, selectedCount: action.selectedCount };
    default:
      return state;
  }
};

const keysReducer = (state = defaultKeyState, action: KeyAction) => {
  switch (action.type) {
    case SET_KEY:
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

const boardReducer = (state = defaultBoardState, action: BoardAction) => {
  const filteredBoard = state.filter((el) => el.id !== action.cellId);
  let targetCell = state.find((el) => el.id === action.cellId);

  switch (action.type) {
    case SET_PUSSLE:
      return action.cell;

    case ADD_TO_HISTORY:
      return [...state, action.cell];

    case SET_CORNER_PENCIL:
      if (targetCell?.locked) return state;
      if (!isValidNumber(action.number)) return state;
      if (targetCell?.cornerPencil.includes(action.number)) {
        targetCell = {
          ...targetCell,
          cornerPencil: targetCell.cornerPencil.filter((el) => (
            el !== action.number
          )),
        };
      } else {
        targetCell = { ...targetCell!, cornerPencil: [...targetCell!.cornerPencil, action.number] };
      }
      return [...filteredBoard, targetCell];

    case SET_CENTER_PENCIL:
      if (targetCell?.locked) return state;
      if (!isValidNumber(action.number)) return state;
      if (targetCell?.centerPencil.includes(action.number)) {
        targetCell = {
          ...targetCell,
          centerPencil: targetCell.centerPencil.filter((el) => (
            el !== action.number
          )),
        };
      } else {
        targetCell = { ...targetCell!, centerPencil: [...targetCell!.centerPencil, action.number] };
      }
      return [...filteredBoard, targetCell];

    case SET_BIG_NUM:
      if (targetCell?.locked) return state;
      if (!isValidNumber(action.number)) return state;
      targetCell = { ...targetCell!, bigNum: action.number };
      return [...filteredBoard, targetCell];

    case CLEAR_CELL:
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
  keys: keysReducer,
});
