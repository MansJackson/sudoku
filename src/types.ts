export type RootState = {
  board: Cell[];
  general: {
    isLoading: boolean;
  }
};

// PROPS
export type HomeProps = {
  isLoading: boolean;
};

export type BoardProps = {
  board: Cell[];
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  loadPussle: () => void;
};

export type CellProps = {
  board: Cell[];
};

export type CellOwnProps = {
  id: string;
};

// ACTION
export type BoardAction = {
  type: string;
  payload: Cell[];
};

export type GeneralAction = {
  type: string;
  isLoading: boolean;
};

// OTHER
export type Cell = {
  id: string;
  locked: boolean;
  bigNum: string;
  cornerPencil: string[];
  centerPencil: string[];
};

// ACTION TYPES
export const ADD_TO_HISTORY = 'ADD_TO_HISTORY';
export const SET_PUSSLE = 'SET_PUSSLE';
export const SET_IS_LOADING = 'SET_IS_LOADING';
