export type RootState = {
  board: Cell[];
  general: {
    isLoading: boolean;
    selecting: boolean | null;
    mouseDown: boolean;
  }
};

// PROPS
export type HomeProps = {

};

export type BoardProps = {
  board: Cell[];
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  loadPussle: () => void;
};

export type CellProps = {
  board: Cell[];
  selecting: boolean | null;
  mouseDown: boolean;
  setSelecting: (payload: boolean | null) => void;
  setMouseDown: (payload: boolean) => void;
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
  selecting: boolean | null;
  mouseDown: boolean;
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
export const SET_SELECTING = 'SET_SELECTING';
export const SET_MOUSE_DOWN = 'SET_MOUSE_DOWN';
