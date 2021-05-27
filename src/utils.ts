import { Cell, Mode } from './types';

export const isValidNumber = (input: string): boolean => (
  Number.isInteger(Number(input)) && Number(input) > 0
);

export const isOtherValidKey = (input: string): boolean => {
  switch (input) {
    case 'ArrowRight': return true;
    case 'ArrowLeft': return true;
    case 'ArrowUp': return true;
    case 'ArrowDown': return true;
    case 'Backspace': return true;
    case 'Delete': return true;
    case ' ': return true;
    default: return false;
  }
};

export const findRestrictedCells = (cellId: string): string[] => {
  const row = Number(cellId[1]);
  const column = cellId[0];
  let boxRows: string[] = [];
  let boxColumns: string[] = [];
  let cells: string[] = [];
  const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

  if (row <= 3) boxRows = ['1', '2', '3'];
  else if (row <= 6) boxRows = ['4', '5', '6'];
  else boxRows = ['7', '8', '9'];

  if (column === 'A' || column === 'B' || column === 'C') boxColumns = ['A', 'B', 'C'];
  else if (column === 'D' || column === 'E' || column === 'F') boxColumns = ['D', 'E', 'F'];
  if (column === 'G' || column === 'H' || column === 'I') boxColumns = ['G', 'H', 'I'];

  for (let x = 0; x < 3; x += 1) {
    for (let y = 0; y < 3; y += 1) {
      cells = [...cells, boxColumns[x] + boxRows[y]];
    }
  }

  for (let i = 0; i < 9; i += 1) {
    const cell1 = columns[i] + row.toString();
    const cell2 = column + (i + 1).toString();
    if (!cells.includes(cell1)) cells = [...cells, cell1];
    if (!cells.includes(cell2)) cells = [...cells, cell2];
  }

  cells = cells.filter((el) => el !== cellId);

  return cells;
};

export const isPussleSolved = (pussle: string[]): boolean => {
  let row: string[] = [];
  let column: string[] = [];
  let box: string[] = [];

  for (let i = 0; i < 3; i += 1) {
    for (let x = 0; x < 3; x += 1) {
      row = [];
      column = [];
      box = [];
      for (let y = 0; y < 3; y += 1) {
        for (let z = 0; z < 3; z += 1) {
          row = [...row, pussle[(y * 3 + z) + ((i * 3 + x) * 9)]];
          column = [...column, pussle[(i * 3 + x) + ((y * 3 + z) * 9)]];
          box = [...box, pussle[i * 27 + x * 3 + y * 9 + z]];
        }
      }
      if (row.sort().join('') !== '123456789') return false;
      if (column.sort().join('') !== '123456789') return false;
      if (box.sort().join('') !== '123456789') return false;
    }
  }

  return true;
};

export const findNextCell = (cellId: string, direction: 'up' | 'down' | 'left' | 'right'): string | false => {
  const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
  const column: string = cellId[0];
  const row = Number(cellId[1]);
  let cIndex: number;

  switch (direction) {
    case 'up':
      if (row === 1) return false;
      return `${column}${row - 1}`;
    case 'down':
      if (row === 9) return false;
      return `${column}${row + 1}`;
    case 'left':
      cIndex = columns.findIndex((el) => el === column);
      if (column === 'A') return false;
      return `${columns[cIndex - 1]}${row}`;
    case 'right':
      cIndex = columns.findIndex((el) => el === column);
      if (column === 'I') return false;
      return `${columns[cIndex + 1]}${row}`;
    default:
      return false;
  }
};

export const updateBoard = (state: Cell[], cellId: string, number: string, mode: Mode | 'delete' | 'restart'): Cell[] => {
  let filteredBoard = state.filter((el) => el.id !== cellId);
  let targetCell = state.find((el) => el.id === cellId);
  let restrictedCells: string[];

  if (targetCell?.locked) return state;
  if (!isValidNumber(number)) return state;

  switch (mode) {
    case 'corner':
      if (targetCell?.cornerPencil.includes(number)) {
        targetCell = {
          ...targetCell,
          cornerPencil: targetCell.cornerPencil.filter((el) => (
            el !== number
          )),
        };
      } else {
        targetCell = {
          ...targetCell!,
          cornerPencil: [...targetCell!.cornerPencil, number],
        };
      }
      return [...filteredBoard, targetCell];

    case 'center':
      if (targetCell?.centerPencil.includes(number)) {
        targetCell = {
          ...targetCell,
          centerPencil: targetCell.centerPencil.filter((el) => (
            el !== number
          )),
        };
      } else {
        targetCell = {
          ...targetCell!,
          centerPencil: [...targetCell!.centerPencil, number],
        };
      }
      return [...filteredBoard, targetCell];

    case 'normal':
      restrictedCells = findRestrictedCells(cellId);
      filteredBoard = filteredBoard.map((cell) => {
        if (!restrictedCells.includes(cell.id)) return cell;
        if (cell.locked) return cell;
        const newCenter = cell.centerPencil.filter((num) => num !== number);
        const newCorner = cell.cornerPencil.filter((num) => num !== number);
        return { ...cell, cornerPencil: newCorner, centerPencil: newCenter };
      });

      targetCell = { ...targetCell!, bigNum: number };
      return [...filteredBoard, targetCell];

    case 'color':
      targetCell = { ...targetCell!, color: number };
      return [...filteredBoard, targetCell];

    case 'delete':
      if (targetCell?.locked) return state;
      targetCell = {
        ...targetCell!, bigNum: '', cornerPencil: [], centerPencil: [],
      };
      return [...filteredBoard, targetCell];

    case 'restart':
      return state.map((cell) => {
        if (cell.locked) return cell;
        return {
          ...cell,
          bigNum: '',
          cornerPencil: [],
          centerPencil: [],
        };
      });

    default: return state;
  }
};
