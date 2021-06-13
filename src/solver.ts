import { CellT } from './types';
import { findRestrictedCells } from './utils';

const getRowsBoxesColumns = (board: CellT[]): Record<string, CellT[][]> => {
  const boardCopy = board.sort((a, b) => {
    if (a.id < b.id) return -1;
    if (a.id > b.id) return 1;
    return 0;
  });

  let rows: CellT[][] = [];
  let columns: CellT[][] = [];
  let boxes: CellT[][] = [];

  let row: CellT[] = [];
  let column: CellT[] = [];
  let box: CellT[] = [];

  for (let i = 0; i < 3; i += 1) {
    for (let x = 0; x < 3; x += 1) {
      row = [];
      column = [];
      box = [];
      for (let y = 0; y < 3; y += 1) {
        for (let z = 0; z < 3; z += 1) {
          row = [...row, boardCopy[(y * 3 + z) + ((i * 3 + x) * 9)]];
          column = [...column, boardCopy[(i * 3 + x) + ((y * 3 + z) * 9)]];
          box = [...box, boardCopy[(i * 27) + (x * 3) + ((y * 9) + z)]];
        }
      }
      rows = [...rows, row];
      columns = [...columns, column];
      boxes = [...boxes, box];
    }
  }

  return {
    rows,
    columns,
    boxes,
  };
};

// Fill all possibilities
export const fillPossibleNums = (board: CellT[]): CellT[] => board.map((cell) => {
  if (cell.bigNum) return cell;
  const restrictedCells = board.filter((el) => findRestrictedCells([cell.id]).includes(el.id));
  let notPossibleNums: string[] = [];
  let possibleNums: string[] = [];
  restrictedCells.forEach((rCell) => {
    if (!rCell.bigNum) return;
    notPossibleNums = [...notPossibleNums, rCell.bigNum];
  });
  for (let i = 1; i <= 9; i += 1) {
    if (!notPossibleNums.includes(i.toString())) possibleNums = [...possibleNums, i.toString()];
  }
  return { ...cell, cornerPencil: possibleNums, centerPencil: [] };
});

// Full House
export const checkFullHouse = (board: CellT[]): CellT[] | false => {
  let boardCopy = [...board];
  const { boxes } = getRowsBoxesColumns(board);

  // Loop through each box
  for (let x = 0; x < 9; x += 1) {
    let counter = 0;
    let cellId = '';
    let usedNums: string[] = [];

    // Loop through each cell
    for (let y = 0; y < 9; y += 1) {
      // If cell does not have a number filled
      if (!boxes[x][y].bigNum) {
        cellId = boxes[x][y].id;
        counter += 1;
      } else {
        usedNums = [...usedNums, boxes[x][y].bigNum];
      }
    }

    // If only 1 cell in the box does not contain a number
    if (counter === 1) {
      let notUsedNum = '';

      // Check which numbers are used in box
      for (let i = 1; i <= 9; i += 1) {
        if (!usedNums.includes(i.toString())) notUsedNum = i.toString();
      }

      const targetCell = boardCopy.find((el) => el.id === cellId);
      boardCopy = board.filter((el) => el.id !== cellId);
      boardCopy = [...boardCopy, { ...targetCell!, bigNum: notUsedNum }];

      return boardCopy;
    }
  }

  return false;
};

// Naked Singles
export const checkNakedSingles = (board: CellT[]): CellT[] | false => {
  let boardCopy = [...board];
  boardCopy = fillPossibleNums(board);

  // Loop through eeach cell in board
  for (let i = 0; i < boardCopy.length; i += 1) {
    // If there is only 1 possible number for this cell and it does not already contain a number
    if (!boardCopy[i].bigNum && boardCopy[i].cornerPencil.length === 1) {
      const targetCell = boardCopy[i];
      const num = boardCopy[i].cornerPencil[0];
      boardCopy = board.filter((el) => el.id !== board[i].id);
      boardCopy = [...boardCopy, { ...targetCell, bigNum: num }];
      return boardCopy;
    }
  }

  return false;
};

// Hidden Singles
export const checkHiddenSingles = (board: CellT[]): CellT[] | false => {
  let boardCopy = [...board];
  boardCopy = fillPossibleNums(boardCopy);
  const { rows, columns, boxes } = getRowsBoxesColumns(boardCopy);

  // Loop through each box, row and column
  for (let x = 0; x < 9; x += 1) {
    // Loop through each number from 1-9
    for (let i = 1; i <= 9; i += 1) {
      let boxOccurrences = 0;
      let rowOccurrences = 0;
      let columnOccurrences = 0;
      let boxCell = '';
      let rowCell = '';
      let columnCell = '';
      let boxNum = 0;
      let rowNum = 0;
      let columnNum = 0;

      // Loop through each cell in box, row and column
      for (let y = 0; y < 9; y += 1) {
        // If cell in box contains the number 'i'
        if (!boxes[x][y].bigNum && boxes[x][y].cornerPencil.includes(i.toString())) {
          boxOccurrences += 1;
          boxCell = boxes[x][y].id;
          boxNum = i;
        }
        // If cell in row contains the number 'i'
        if (!rows[x][y].bigNum && rows[x][y].cornerPencil.includes(i.toString())) {
          rowOccurrences += 1;
          rowCell = rows[x][y].id;
          rowNum = i;
        }
        // If cell in column contains the number 'i'
        if (!columns[x][y].bigNum && columns[x][y].cornerPencil.includes(i.toString())) {
          columnOccurrences += 1;
          columnCell = columns[x][y].id;
          columnNum = i;
        }
      }

      // If the number occurres only 1 time in box
      if (boxOccurrences === 1) {
        const targetCell = board.find((el) => el.id === boxCell);
        boardCopy = board.filter((el) => el.id !== boxCell);
        boardCopy = [...boardCopy, { ...targetCell!, bigNum: boxNum.toString() }];
        return boardCopy;
      }
      // If the number occurres only 1 time in row
      if (rowOccurrences === 1) {
        const targetCell = board.find((el) => el.id === rowCell);
        boardCopy = board.filter((el) => el.id !== rowCell);
        boardCopy = [...boardCopy, { ...targetCell!, bigNum: rowNum.toString() }];
        return boardCopy;
      }
      // If the number occurres only 1 time in column
      if (columnOccurrences === 1) {
        const targetCell = board.find((el) => el.id === columnCell);
        boardCopy = board.filter((el) => el.id !== columnCell);
        boardCopy = [...boardCopy, { ...targetCell!, bigNum: columnNum.toString() }];
        return boardCopy;
      }
    }
  }

  return false;
};

// Locked Candidates
export const checkLockedCandidatesPointing = (board: CellT[]): CellT[] | false => {
  let boardCopy = [...board];
  const { boxes } = getRowsBoxesColumns(board);

  // Loop through each box
  for (let x = 0; x < 9; x += 1) {
    // Loop through each number from 1-9
    for (let i = 1; i <= 9; i += 1) {
      let occurrences = 0;
      let cellIds: string[] = [];

      // Loop through each cell in box
      for (let y = 0; y < 9; y += 1) {
        // Cheeck if cell can contain the number 'i'
        if (!boxes[x][y].bigNum && boxes[x][y].cornerPencil.includes(i.toString())) {
          occurrences += 1;
          cellIds = [...cellIds, boxes[x][y].id];
        }
      }

      // If 'i' can only be in 2 or 3 cells in the box
      if (occurrences === 3 || occurrences === 2) {
        const occurrenceRows = cellIds.map((el) => el[1]);
        const occurrenceColumns = cellIds.map((el) => el[0]);
        let singleRow = true;
        let singleColumn = true;

        // Check if they all appear in the same row or column
        for (let q = 1; q < occurrences; q += 1) {
          if (occurrenceRows[q] !== occurrenceRows[q - 1]) singleRow = false;
          if (occurrenceColumns[q] !== occurrenceColumns[q - 1]) singleColumn = false;
        }

        // If they are in the same row
        if (singleRow) {
          boardCopy = boardCopy.map((cell) => {
            if (cellIds.includes(cell.id) || cell.id[1] !== occurrenceRows[0] || !cell.cornerPencil.includes(i.toString())) return cell;
            return { ...cell, cornerPencil: cell.cornerPencil.filter((num) => num !== i.toString()) };
          });
          return boardCopy;
        }

        // if they are in the same column
        if (singleColumn) {
          boardCopy = boardCopy.map((cell) => {
            if (cellIds.includes(cell.id) || cell.id[0] !== occurrenceColumns[0] || !cell.cornerPencil.includes(i.toString())) return cell;
            return { ...cell, cornerPencil: cell.cornerPencil.filter((num) => num !== i.toString()) };
          });
          return boardCopy;
        }
      }
    }
  }

  return false;
};
