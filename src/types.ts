export type RootState = {
  board: Cell[];
  general: {
    isLoading: boolean;
    selecting: boolean | null;
    mouseDown: boolean;
    mode: Mode;
    restrictedCells: string[];
    selectedCells: string[];
  },
  history: Board[];
};

// PROPS
export type HomeProps = {

};

export type ControlsProps = {
  selectedCells: string[];
  selectedMode: Mode;
  history: Board[];
  board: Cell[];
  loadPussle: (blank: boolean, pussle?: Record<string, string>, userCreated?: boolean) => void;
  dispatch: (type: string, payload: Record<string, any>) => void;
};

export type BoardProps = {
  isLoading: boolean;
  selectedCells: string[];
  selectedMode: Mode;
  history: Board[];
  board: Cell[];
  dispatch: (type: string, payload: Record<string, any>) => void;
  loadPussle: (blank: boolean, pussle?: Record<string, string>) => void;
};

export type CellProps = {
  board: Cell[];
  selecting: boolean | null;
  mouseDown: boolean;
  selectedCells: string[];
  restrictedCells: string[];
  dispatch: (type: string, payload: Record<string, any>) => void;
};

export type CellOwnProps = {
  id: string;
  index: number;
};

// ACTION
export type BoardAction = {
  type: string;
  payload: {
    cell: Cell[];
    cellId: string;
    number: string;
  };
};

export type GeneralAction = {
  type: string;
  payload: {
    isLoading: boolean,
    selecting: boolean,
    mouseDown: boolean,
    restrictedCells: string[],
    selectedCells: string[],
    mode: string,
  };
};

export type HistoryAction = {
  type: string;
  payload: {
    board: Cell[],
  };
};

// OTHER
export type Cell = {
  id: string;
  locked: boolean;
  bigNum: string;
  cornerPencil: string[];
  centerPencil: string[];
  color: string;
};

export type Board = {
  id: number;
  board: Cell[];
};

export type Mode = 'normal' | 'corner' | 'center' | 'color';

// ACTION TYPES
export const SET_PUSSLE = 'SET_PUSSLE';
export const SET_IS_LOADING = 'SET_IS_LOADING';
export const SET_SELECTING = 'SET_SELECTING';
export const SET_MOUSE_DOWN = 'SET_MOUSE_DOWN';
export const CLEAR_PUSSLE = 'CLEAR_PUSSLE';
export const CLEAR_RESTRICTED_CELLS = 'CLEAR_RESTRICTED_CELLS';
export const SET_RESTRICTED_CELLS = 'SET_RESTRICTED_CELLS';
export const SET_SELECTED_CELLS = 'SET_SELECTED_CELLS';
export const SET_SELECTED_MODE = 'SET_SELECTED_MODE';
export const TOGGLE_MODE = 'TOGGLE_MODE';
export const ADD_TO_HISTORY = 'ADD_TO_HISTORY';
export const CLEAR_HISTORY = 'CLEAR_HISTORY';
export const UNDO = 'UNDO';
export const REDO = 'REDO';
