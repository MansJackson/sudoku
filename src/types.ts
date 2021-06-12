export type RootState = {
  board: Cell[];
  general: {
    pussleStarted: boolean,
    isLoading: boolean;
    selecting: boolean | null;
    mouseDown: boolean;
    mode: Mode;
    restrictedCells: string[];
    selectedCells: string[];
    settings: {
      markRestricted: boolean,
      highlightErrors: boolean,
      removePencilMarks: boolean,
    }
  },
  history: Board[];
};

// PROPS
export type HomeProps = {

};

export type NavbarProps = {
  pussleStarted: boolean,
};

export type SettingsProps = {
  settings: {
    markRestricted: boolean,
    highlightErrors: boolean,
    removePencilMarks: boolean,
  }
  dispatch: (type: string, payload: Record<string, any>) => void;
};

export type ControlsProps = {
  selectedCells: string[];
  selectedMode: Mode;
  history: Board[];
  board: Cell[];
  settings: {
    markRestricted: boolean,
    highlightErrors: boolean,
    removePencilMarks: boolean,
  }
  loadPussle: (blank: boolean, pussle?: Record<string, string>, userCreated?: boolean) => void;
  dispatch: (type: string, payload: Record<string, any>) => void;
};

export type BoardProps = {
  isLoading: boolean;
  selectedCells: string[];
  restrictedCells: string[];
  selectedMode: Mode;
  history: Board[];
  board: Cell[];
  settings: {
    markRestricted: boolean,
    highlightErrors: boolean,
    removePencilMarks: boolean,
  }
  dispatch: (type: string, payload: Record<string, any>) => void;
  loadPussle: (blank: boolean, pussle?: Record<string, string>, userCreated?: boolean) => void;
};

export type CellProps = {
  board: Cell[];
  selecting: boolean | null;
  mouseDown: boolean;
  selectedCells: string[];
  restrictedCells: string[];
  settings: {
    markRestricted: boolean,
    highlightErrors: boolean,
    removePencilMarks: boolean,
  }
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
    markRestricted: boolean,
    highlightErrors: boolean,
    removePencilMarks: boolean,
    pussleStarted: boolean,
  };
};

export type HistoryAction = {
  type: string;
  payload: {
    board: Cell[],
    history: Board[],
  };
};

// OTHER
export type Cell = {
  id: string;
  locked: boolean;
  error: boolean;
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
export const SET_PUSSLE_STARTED = 'SET_PUSSLE_STARTED';
export const SET_PUSSLE = 'SET_PUSSLE';
export const SET_IS_LOADING = 'SET_IS_LOADING';
export const SET_SELECTING = 'SET_SELECTING';
export const SET_MOUSE_DOWN = 'SET_MOUSE_DOWN';
export const CLEAR_RESTRICTED_CELLS = 'CLEAR_RESTRICTED_CELLS';
export const SET_RESTRICTED_CELLS = 'SET_RESTRICTED_CELLS';
export const SET_SELECTED_CELLS = 'SET_SELECTED_CELLS';
export const SET_SELECTED_MODE = 'SET_SELECTED_MODE';
export const TOGGLE_MODE = 'TOGGLE_MODE';
export const SET_HISTORY = 'SET_HISTORY';
export const ADD_TO_HISTORY = 'ADD_TO_HISTORY';
export const CLEAR_HISTORY = 'CLEAR_HISTORY';
export const UPDATE_SETTINGS = 'UPDATE_SETTINGS';
export const UNDO = 'UNDO';
export const REDO = 'REDO';
export const CLEAR_ERRORS = 'CLEAR_ERRORS';
export const UPDATE_ERRORS = 'UPDATE_ERRORS';
