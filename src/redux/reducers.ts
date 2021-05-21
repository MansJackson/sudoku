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
} from '../types';

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
  switch (action.type) {
    case SET_PUSSLE:
      return action.payload;
    case ADD_TO_HISTORY:
      return [...state, action.payload];
    default:
      return state;
  }
};

export default combineReducers({
  board: boardReducer,
  general: generalReducer,
  keys: keysReducer,
});
