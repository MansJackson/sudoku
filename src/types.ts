export type RootState = {
  board: Cell[];
  general: {
    isLoading: boolean;
    selecting: boolean | null;
    mouseDown: boolean;
    selectedCount: number;
  }
  keys: Record<string, boolean>
};

// PROPS
export type HomeProps = {

};

export type BoardProps = {
  board: Cell[];
  isLoading: boolean;
  keys: Record<string, boolean>
  setIsLoading: (isLoading: boolean) => void;
  loadPussle: () => void;
  setKey: (payload: Record<string, boolean>) => void;
  setCornerPencil: (cellId: string, number: string) => void;
  setCenterPencil: (cellId: string, number: string) => void;
  setBigNum: (cellId: string, number: string) => void;
  clearCell: (cellId: string) => void;
};

export type CellProps = {
  board: Cell[];
  selecting: boolean | null;
  mouseDown: boolean;
  keys: Record<string, boolean>;
  selectedCount: number;
  setSelecting: (payload: boolean | null) => void;
  setMouseDown: (payload: boolean) => void;
  setSelectedCount: (payload: number) => void;
};

export type CellOwnProps = {
  id: string;
  index: number;
};

// ACTION
export type BoardAction = {
  type: string;
  cell: Cell[];
  cellId: string;
  number: string;
};

export type GeneralAction = {
  type: string;
  isLoading: boolean;
  selecting: boolean | null;
  mouseDown: boolean;
  selectedCount: number;
};

export type KeyAction = {
  type: string;
  payload: {
    key: string;
    value: boolean;
  }
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
export const SET_KEY = 'SET_KEY';
export const SET_SELECTED_COUNT = 'SET_SELECTED_COUNT';
export const SET_CORNER_PENCIL = 'SET_CORNER_PENCIL';
export const SET_CENTER_PENCIL = 'SET_CENTER_PENCIL';
export const SET_BIG_NUM = 'SET_BIG_NUM';
export const CLEAR_CELL = 'CLEAR_CELL';
