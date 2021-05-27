export type RootState = {
  board: Cell[];
  general: {
    isLoading: boolean;
    selecting: boolean | null;
    mouseDown: boolean;
    selectedCount: number;
    restrictedCells: string[];
    selectedCells: string[];
  }
};

// PROPS
export type HomeProps = {

};

export type BoardProps = {
  isLoading: boolean;
  selectedCells: string[];
  dispatch: (type: string, payload: Record<string, any>) => void;
  loadPussle: (blank: boolean, pussle?: Record<string, string>) => void;
};

export type CellProps = {
  board: Cell[];
  selecting: boolean | null;
  mouseDown: boolean;
  selectedCells: string[];
  restrictedCells: string[];
  updateSelectedCells: () => void;
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
    selectedCount: number,
    restrictedCells: string[],
    selectedCells: string[],
  };
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
export const SET_PUSSLE = 'SET_PUSSLE';
export const SET_IS_LOADING = 'SET_IS_LOADING';
export const SET_SELECTING = 'SET_SELECTING';
export const SET_MOUSE_DOWN = 'SET_MOUSE_DOWN';
export const SET_SELECTED_COUNT = 'SET_SELECTED_COUNT';
export const SET_CORNER_PENCIL = 'SET_CORNER_PENCIL';
export const SET_CENTER_PENCIL = 'SET_CENTER_PENCIL';
export const SET_BIG_NUM = 'SET_BIG_NUM';
export const CLEAR_CELL = 'CLEAR_CELL';
export const CLEAR_RESTRICTED_CELLS = 'CLEAR_RESTRICTED_CELLS';
export const SET_RESTRICTED_CELLS = 'SET_RESTRICTED_CELLS';
export const SET_SELECTED_CELLS = 'SET_SELECTED_CELLS';
