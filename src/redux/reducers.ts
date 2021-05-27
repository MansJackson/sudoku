import { combineReducers } from 'redux';
import {
  Cell,
  SET_PUSSLE,
  SET_IS_LOADING,
  SET_SELECTING,
  SET_MOUSE_DOWN,
  SET_RESTRICTED_CELLS,
  CLEAR_RESTRICTED_CELLS,
  SET_SELECTED_CELLS,
  GeneralAction,
  BoardAction,
  CLEAR_PUSSLE,
  SET_SELECTED_MODE,
  TOGGLE_MODE,
  HistoryAction,
  ADD_TO_HISTORY,
  UNDO,
  REDO,
  Board,
  CLEAR_HISTORY,
} from '../types';

const defaultHistoryState: Board[] = [];
const defaultBoardState: Cell[] = [];
const defaultGeneralState = {
  isLoading: true,
  mouseDown: false,
  selecting: null,
  mode: 'normal',
  restrictedCells: [],
  selectedCells: [],
};

const historyReducer = (state = defaultHistoryState, action: HistoryAction) => {
  const { payload } = action;
  let filtered: Board[];
  let board: Board;
  let startIndex: number;

  switch (action.type) {
    case ADD_TO_HISTORY:
      if (state.length > 1) {
        startIndex = state.findIndex((el) => el.id === 0);
        if (startIndex > 0) {
          filtered = state.filter((_el, i) => i >= startIndex);
          return [...filtered, { id: state.length, board: payload.board }];
        }
      }
      return [...state, { id: state.length, board: payload.board }];

    case CLEAR_HISTORY:
      return [{ id: state.length, board: payload.board }];

    case UNDO:
      if (state.length < 2) return state;
      filtered = state.filter((_el, i) => i !== state.length - 1);
      board = state[state.length - 1];
      return [board, ...filtered];

    case REDO:
      if (state[0].id === 0) return state;
      filtered = state.filter((el) => el.id !== state[0].id);
      [board] = state;
      return [...filtered, board];
    default:
      return state;
  }
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

  switch (action.type) {
    case SET_PUSSLE:
      return payload.cell;

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
  history: historyReducer,
});
