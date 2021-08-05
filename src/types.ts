// States
export type RootState = {
  board: CellT[];
  general: GeneralState;
  history: BoardT[];
};

export type GeneralState = {
  pussleStarted: boolean;
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
};

// PROPS
export type HomeProps = {

};

export type NavbarProps = {
  pussleStarted: boolean;
  loadPussle: (blank: boolean, pussle?: Record<string, string>, userCreated?: boolean) => void;
  dispatch: (type: string, payload: Record<string, any>) => void;
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
  history: BoardT[];
  board: CellT[];
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
  history: BoardT[];
  board: CellT[];
  settings: {
    markRestricted: boolean,
    highlightErrors: boolean,
    removePencilMarks: boolean,
  }
  dispatch: (type: string, payload: Record<string, any>) => void;
  loadPussle: (blank: boolean, pussle?: Record<string, string>, userCreated?: boolean) => void;
};

export type CellProps = {
  board: CellT[];
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
    cell: CellT[];
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
    board: CellT[],
    history: BoardT[],
  };
};

// OTHER
export type CellT = {
  id: string;
  locked: boolean;
  error: boolean;
  bigNum: string;
  cornerPencil: string[];
  centerPencil: string[];
  color: string;
};

export type BoardT = {
  id: number;
  title?: string;
  description?: string;
  board: CellT[];
};

export type SettingsT = {
  markRestricted: boolean,
  highlightErrors: boolean,
  removePencilMarks: boolean,
};

export type Mode = 'normal' | 'corner' | 'center' | 'color';
export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Extreme' | 'Diabolical' | 'Blank';
export type TStep = {
  type: 'fh' | 'hs' | 'ns' | 'hp' | 'np' | 'lcp' | 'lcc' | 'ss' | 'xw' | 'xyw' | 'xyz'
  | 'ww' | 'ssc' | 'fxw' | 'ht' | 'nt' | 'er' | 'hq' | 'nq' | 'sf' | 'fsf' | 'jf' | 'fjf';
  points: number;
  affectedNumbers: string[];
  affectedCells: string[];
  sourceCells?: string[];
  set?: string;
  fins?: string[];
  sashimi?: boolean;
};
export type TSpecs = {
  affectedNumbers: string[];
  affectedCells: string[];
  sourceCells?: string[];
  set?: string;
  fins?: string[];
  sashimi?: boolean;
};
export const setTypes = ['box', 'row', 'column'];

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
