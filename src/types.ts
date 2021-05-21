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
