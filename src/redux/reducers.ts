import { combineReducers } from 'redux';
import {
  BoardAction,
  Cell,
  ADD_TO_HISTORY,
  SET_PUSSLE,
  GeneralAction,
  SET_IS_LOADING,
} from '../types';

const defaultBoardState: Cell[] = [];
const defaultGeneralState = {
  isLoading: true,
  mouseDown: false,
  selecting: null,
};

const generalReducer = (state = defaultGeneralState, action: GeneralAction) => {
  switch (action.type) {
    case SET_IS_LOADING:
      return { ...state, isLoading: action.isLoading };
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
});
