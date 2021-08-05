import {
  CellT, setTypes, TSpecs, TStep,
} from './types';
import { findRestrictedCells, isPussleSolved, updateBoard } from './utils';

/**
 * Splits each row, column and box into arrays
 * @param board current state of the board
 * @returns - { rows, columns, boxes } => split into 1 array for each row column or box
 */
const getRowsBoxesColumns = (board: CellT[]): Record<'rows' | 'columns' | 'boxes', CellT[][]> => {
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
          column = [...column, boardCopy[(y * 3 + z) + ((i * 3 + x) * 9)]];
          row = [...row, boardCopy[(i * 3 + x) + ((y * 3 + z) * 9)]];
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

/**
 * gets the boxindexes for a given set of cellIds
 * @param board sudoku board
 * @param cellIds cellIds that you want to check
 * @returns [cellId, boxIndex] 2D array where each inner array contains a given cellId and the box index
 */
const getBoxIndexes = (board: CellT[], cellIds: string[]): [string, number][] => {
  const { boxes } = getRowsBoxesColumns(board);
  return cellIds.map((cellId) => [
    cellId,
    boxes.findIndex((box) => box.find(((cell) => cell.id === cellId))),
  ]);
};

/**
 * Enumerates how many candidates there are for each number in a given row, column or box
 * @param board current state of the board (has to be filled with all possible numbers)
 * @param x index of the set you want to enumerate
 * @returns [box, row, column] => objects where the key is the number and the value is an array of the cells it can go into
 */
const enumSets = (board: CellT[], x: number): Record<string, string[]>[] => {
  const { boxes, rows, columns } = getRowsBoxesColumns(board);

  let boxEnum: Record<string, string[]> = {};
  let rowEnum: Record<string, string[]> = {};
  let columnEnum: Record<string, string[]> = {};
  // Loop through each number from 1-9
  for (let i = 1; i <= 9; i += 1) {
    // Loop through each cell in box, row and column
    for (let y = 0; y < 9; y += 1) {
      // Enumerate how many cells each number can go into for box row and column
      if (boxes[x][y].cornerPencil.includes(String(i))) {
        boxEnum = { ...boxEnum, [String(i)]: boxEnum[String(i)] ? [...boxEnum[String(i)], boxes[x][y].id] : [boxes[x][y].id] };
      }
      if (rows[x][y].cornerPencil.includes(String(i))) {
        rowEnum = { ...rowEnum, [String(i)]: rowEnum[String(i)] ? [...rowEnum[i], rows[x][y].id] : [rows[x][y].id] };
      }
      if (columns[x][y].cornerPencil.includes(String(i))) {
        columnEnum = { ...columnEnum, [String(i)]: columnEnum[String(i)] ? [...columnEnum[i], columns[x][y].id] : [columns[x][y].id] };
      }
    }
  }

  return [boxEnum, rowEnum, columnEnum];
};

/**
 * checks if a given set is missing exactly 1 number
 * @param set set of cells from a box, row or column
 * @returns [cell id, missing number] | false
 */
const isMissingOneNum = (set: CellT[]): string[] | false => {
  let numsInSet: string[] = [];
  let cellId = '';
  set.forEach((cell) => {
    if (cell.bigNum) numsInSet = [...numsInSet, cell.bigNum];
    else cellId = cell.id;
  });

  if (numsInSet.length !== 8) return false;

  numsInSet = numsInSet.sort();
  for (let n = 1; n <= 9; n += 1) {
    if (numsInSet[n - 1] !== String(n)) return [cellId, String(n)];
  }

  return false;
};

/**
 * Checks if for a given box and number, an Empty Rectangle exists
 * @param box box to test
 * @param num number to test
 * @if regular ER
 * @return [col, row] -> the column and row which the ER is pointing at
 * @if ER with only 2 candidates
 * @return [col1, row1, col2, row2] -> both columns and rows which the ER is pointing at
 * @else
 * @return false
 */
const isEmptyRectangle = (box: CellT[], num: string): string[] | false => {
  const filteredCells = box.filter((cell) => cell.cornerPencil.includes(num));
  if (!filteredCells.length) return false;
  const allRows = filteredCells.map((cell) => cell.id[1]);
  const allCols = filteredCells.map((cell) => cell.id[0]);
  // get rows and cols where {num} appears more than once
  const duplicateRows = allRows.sort().filter((row, pos, arr) => pos && arr[pos - 1] === row);
  const duplicateCols = allCols.sort().filter((col, pos, arr) => pos && arr[pos - 1] === col);

  // if {num} appears more than once in more than one row or column, it's not an empty rectangle
  if (duplicateCols.length > 1 || duplicateRows.length > 1) return false;
  // if {num} does not appear more than once in any row or column, and there are more than 3 cells, it's not an empty rectangle
  if (!duplicateCols.length && !duplicateRows.length && filteredCells.length > 2) return false;

  // otherwise if {num} appears more than once in both 1 row and 1 column
  if (duplicateCols.length && duplicateRows.length) {
    // and there are no extra cells in the box
    for (let i = 0; i < filteredCells.length; i += 1) {
      if (filteredCells[i].id[0] !== duplicateCols[0] && filteredCells[i].id[1] !== duplicateRows[0]) return false;
    }
    // it's an empty rectangle
    return [...duplicateCols, ...duplicateRows];
  }

  // otherwise if {num} appears more than once in either the row or the column, it's an empty rectangle
  if (duplicateCols.length) {
    const erRow = filteredCells.filter((cell) => cell.id[0] !== duplicateCols[0][0]);
    if (erRow.length) return [...duplicateCols, erRow[0].id[1]];
  }

  if (duplicateRows.length) {
    const erCol = filteredCells.filter((cell) => cell.id[1] !== duplicateRows[0][0]);
    if (erCol.length) return [erCol[0].id[0], ...duplicateRows];
  }

  // otherwise if there are only 2 conditates in the box and they both apear in diffrent rows and columns
  // it's an empty rectangle with only 2 candidates
  if ([...allCols, ...allRows].sort().filter((el, pos, arr) => !pos || arr[pos - 1] !== el).length === 4) {
    return [allCols[0], allRows[1], allCols[1], allRows[0]];
  }

  // we should never get here
  return false;
};

/**
 * checks if the empty rectangle affects the state  of the board and updates
 * @param board current state of the board
 * @param n the number which the ER is made up of (1-9)
 * @param erCol the column the empty rectangle is pointing at
 * @param erRow the row the empty rectangle is pointing at
 * @returns updated  state of the board | false
 */
const updateEmptyRectangle = (board: CellT[], n: string, erCol: string, erRow: string): { newBoard: CellT[], specs: TSpecs } | false => {
  for (let i = 0; i < 9; i += 1) {
    const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
    const colIndex = columns.findIndex((col) => col === erCol);
    let notNeededRows: string[] = [];
    let notNeededCols: string[] = [];

    if (colIndex < 3) notNeededCols = ['A', 'B', 'C'];
    else if (colIndex < 6) notNeededCols = ['D', 'E', 'F'];
    else notNeededCols = ['G', 'H', 'I'];

    if (Number(erRow) < 3) notNeededRows = ['1', '2', '3'];
    else if (Number(erRow) < 6) notNeededRows = ['4', '5', '6'];
    else notNeededRows = ['7', '8', '9'];

    const [, rowEnum, colEnum] = enumSets(board, i);

    // get row or column that of given number {n} only has 2 candidates and 1 of the candidates can bee seen by the empty rectangle
    let asArray = Object.entries(rowEnum);
    const filteredRowEnum = asArray.filter(([num, cellIds]) => {
      if (num !== n) return false;
      if (notNeededRows.includes(cellIds[0][1])) return false;
      if (cellIds.length !== 2) return false;
      for (let c = 0; c < 2; c += 1) {
        if (cellIds[c][0] === erCol) return true;
      }
      return false;
    }).map(([, cellIds]) => cellIds);

    asArray = Object.entries(colEnum);
    const filteredColumnEnum = asArray.filter(([num, cellIds]) => {
      if (num !== n) return false;
      if (notNeededCols.includes(cellIds[0][0])) return false;
      if (cellIds.length !== 2) return false;
      for (let c = 0; c < 2; c += 1) {
        if (cellIds[c][1] === erRow) return true;
      }
      return false;
    }).map(([, cellIds]) => cellIds);

    let somethingChanged = false;
    let fin: string;
    let restrictedCell: string;
    let newBoard: CellT[];

    // for each candidate in rows
    if (filteredRowEnum.length) {
      for (let c = 0; c < filteredRowEnum.length; c += 1) {
        const cellIds = filteredRowEnum[c];
        // the cell that is not seen by the empty rectangle
        [fin] = cellIds.filter((el) => el[0] !== erCol);
        // the cell that is restricted by empty rectangle logic
        restrictedCell = fin[0] + erRow;

        newBoard = board.map((cell) => {
          if (cell.id !== restrictedCell) return cell;
          if (!cell.cornerPencil.includes(n)) return cell;
          somethingChanged = true;
          return { ...cell, cornerPencil: cell.cornerPencil.filter((num) => num !== n) };
        });
        if (somethingChanged) {
          return {
            newBoard,
            specs: {
              sourceCells: [],
              affectedCells: [restrictedCell],
              affectedNumbers: [n],
              fins: cellIds,
            },
          };
        }
      }
    }
    // for each candidate in columns
    if (filteredColumnEnum.length) {
      for (let c = 0; c < filteredColumnEnum.length; c += 1) {
        const cellIds = filteredColumnEnum[c];
        // the cell that is not seen by the empty rectangle
        [fin] = cellIds.filter((el) => el[1] !== erRow);
        // the cell that is restricted by empty rectangle logic
        restrictedCell = erCol + fin[1];

        newBoard = board.map((cell) => {
          if (cell.id !== restrictedCell) return cell;
          if (!cell.cornerPencil.includes(n)) return cell;
          somethingChanged = true;
          return { ...cell, cornerPencil: cell.cornerPencil.filter((num) => num !== n) };
        });
        if (somethingChanged) {
          return {
            newBoard,
            specs: {
              sourceCells: [],
              affectedCells: [restrictedCell],
              affectedNumbers: [n],
              fins: cellIds,
            },
          };
        }
      }
    }
  }

  return false;
};

/**
 * finds hidden pairs in a given set of cells and updates the board appropriatly
 * @param set row, column or box
 * @param board current state of the board
 * @returns updated board if changes are made | false
 */
const checkHiddenPairs = (set: [string, string[]][], board: CellT[]): { newBoard: CellT[], specs: TSpecs } | false => {
  if (!set.length) return false;
  let nums: string[] = [];
  let cells: string[] = [];
  // Loop through all possible number cominations
  for (let a = 0; a < set.length; a += 1) {
    for (let b = a + 1; b < set.length; b += 1) {
      // The numbers we are looking for
      nums = [set[a][0], set[b][0]];
      // All the cells theese number can go into in this set
      cells = [...set[a][1], ...set[b][1]].sort().filter((el, pos, arr) => pos === 0 || el !== arr[pos - 1]);

      // if they can only go into 2 cells it is a pair
      if (cells.length === 2) {
        let somethingChanged = false;
        const newBoard = board.map((cell) => {
          // if the pair contains pencilmarks for other numbers -> remove them
          if (!cells.includes(cell.id)) return cell;
          if (cell.cornerPencil.length < 3) return cell;
          somethingChanged = true;
          return { ...cell, cornerPencil: cell.cornerPencil.filter((num) => nums.includes(num)) };
        });

        if (somethingChanged) {
          return {
            newBoard,
            specs: {
              affectedCells: cells,
              affectedNumbers: nums,
            },
          };
        }
      }
    }
  }

  return false;
};

/**
 * finds naked pairs in a given set of cells and updates the board appropriatly
 * @param set set of cells from a box, column or row
 * @param board current state of the board
 * @returns if something was updated => updated board; else => false;
 */
const checkNakedPairs = (set: CellT[], board: CellT[]): { newBoard: CellT[], specs: TSpecs } | false => {
  const candidates = set.filter((cell) => cell.cornerPencil.length === 2);
  if (candidates.length < 2) return false;
  for (let a = 0; a < candidates.length; a += 1) {
    for (let b = a + 1; b < candidates.length; b += 1) {
      const combinedNums = [...candidates[a].cornerPencil, ...candidates[b].cornerPencil]
        .sort()
        .filter((num, pos, arr) => !pos || num !== arr[pos - 1]);
      // It's a naked pair
      if (combinedNums.length === 2) {
        const pairedCells = [candidates[a].id, candidates[b].id];
        const restrictedCells = findRestrictedCells(pairedCells);
        let affectedCells: string[] = [];
        let somethingChanged = false;
        const newBoard = board.map((cell) => {
          if (cell.bigNum) return cell;
          if (!restrictedCells.includes(cell.id)) return cell;
          if (!cell.cornerPencil.includes(combinedNums[0]) && !cell.cornerPencil.includes(combinedNums[1])) return cell;
          somethingChanged = true;
          affectedCells = [...affectedCells, cell.id];
          return { ...cell, cornerPencil: cell.cornerPencil.filter((num) => !combinedNums.includes(num)) };
        });
        if (somethingChanged) {
          return {
            newBoard,
            specs: {
              affectedCells,
              affectedNumbers: combinedNums,
              sourceCells: pairedCells,
            },
          };
        }
      }
    }
  }

  return false;
};

/**
 * finds hidden triples in a given set of cells and updates the board appropriatly
 * @param set row, column or box
 * @param board current state of the board
 * @returns updated board if changes are made | false
 */
const checkHiddenTriples = (set: [string, string[]][], board: CellT[]): { newBoard: CellT[], specs: TSpecs } | false => {
  if (!set.length) return false;
  let nums: string[] = [];
  let cells: string[] = [];

  for (let a = 0; a < set.length; a += 1) {
    for (let b = a + 1; b < set.length; b += 1) {
      for (let c = b + 1; c < set.length; c += 1) {
        // The numbers we are looking for
        nums = [set[a][0], set[b][0], set[c][0]];
        // All the cells theese number can go into in this set
        cells = [...set[a][1], ...set[b][1], ...set[c][1]].sort().filter((el, pos, arr) => !pos || el !== arr[pos - 1]);

        // if they can only go into 3 cells it is a triple
        if (cells.length === 3) {
          let somethingChanged = false;
          const newBoard = board.map((cell) => {
            // if the triple contains pencilmarks for other numbers -> remove them
            if (!cells.includes(cell.id)) return cell;
            for (let i = 0; i < cell.cornerPencil.length; i += 1) {
              if (!nums.includes(cell.cornerPencil[i])) {
                somethingChanged = true;
                return { ...cell, cornerPencil: cell.cornerPencil.filter((num) => nums.includes(num)) };
              }
            }
            return cell;
          });

          if (somethingChanged) {
            return {
              newBoard,
              specs: {
                affectedCells: cells,
                affectedNumbers: nums,
              },
            };
          }
        }
      }
    }
  }

  return false;
};

/**
 * finds naked triples in a given set of cells and updates the board appropriatly
 * @param set set of cells from a box, column or row
 * @param board current state of the board
 * @returns if something was updated => updated board; else => false;
 */
const checkNakedTriples = (set: CellT[], board: CellT[]): { newBoard: CellT[], specs: TSpecs } | false => {
  const candidates = set.filter((cell) => cell.cornerPencil.length <= 3 && cell.cornerPencil.length > 1);
  if (candidates.length < 3) return false;
  for (let a = 0; a < candidates.length; a += 1) {
    for (let b = a + 1; b < candidates.length; b += 1) {
      for (let c = b + 1; c < candidates.length; c += 1) {
        const combinedNums = [
          ...candidates[a].cornerPencil,
          ...candidates[b].cornerPencil,
          ...candidates[c].cornerPencil,
        ]
          .sort()
          .filter((num, pos, arr) => !pos || num !== arr[pos - 1]);
        // It's a naked triple
        if (combinedNums.length === 3) {
          const pairedCells = [candidates[a].id, candidates[b].id, candidates[c].id];
          const restrictedCells = findRestrictedCells(pairedCells);
          let affectedCells: string[] = [];
          let somethingChanged = false;
          const newBoard = board.map((cell) => {
            if (cell.bigNum) return cell;
            if (!restrictedCells.includes(cell.id)) return cell;
            if (
              !cell.cornerPencil.includes(combinedNums[0])
              && !cell.cornerPencil.includes(combinedNums[1])
              && !cell.cornerPencil.includes(combinedNums[2])
            ) return cell;
            somethingChanged = true;
            affectedCells = [...affectedCells, cell.id];
            return { ...cell, cornerPencil: cell.cornerPencil.filter((num) => !combinedNums.includes(num)) };
          });
          if (somethingChanged) {
            return {
              newBoard,
              specs: {
                affectedCells,
                affectedNumbers: combinedNums,
                sourceCells: pairedCells,
              },
            };
          }
        }
      }
    }
  }

  return false;
};

/**
 * finds hidden quads in a given set of cells and updates the board appropriatly
 * @param set row, column or box
 * @param board current state of the board
 * @returns updated board if changes are made | false
 */
const checkHiddenQuads = (set: [string, string[]][], board: CellT[]): { newBoard: CellT[], specs: TSpecs } | false => {
  if (!set.length) return false;
  let nums: string[] = [];
  let cells: string[] = [];

  for (let a = 0; a < set.length; a += 1) {
    for (let b = a + 1; b < set.length; b += 1) {
      for (let c = b + 1; c < set.length; c += 1) {
        for (let d = c + 1; d < set.length; d += 1) {
          // The numbers we are looking for
          nums = [set[a][0], set[b][0], set[c][0], set[d][0]];
          // All the cells theese number can go into in this set
          cells = [...set[a][1], ...set[b][1], ...set[c][1], ...set[d][1]].sort().filter((el, pos, arr) => pos === 0 || el !== arr[pos - 1]);

          // if they can only go into 4 cells it is a quad
          if (cells.length === 4) {
            let somethingChanged = false;
            const newBoard = board.map((cell) => {
              // if the quad contains pencilmarks for other numbers -> remove them
              if (!cells.includes(cell.id)) return cell;
              for (let i = 0; i < cell.cornerPencil.length; i += 1) {
                if (!nums.includes(cell.cornerPencil[i])) {
                  somethingChanged = true;
                  return { ...cell, cornerPencil: cell.cornerPencil.filter((num) => nums.includes(num)) };
                }
              }
              return cell;
            });

            if (somethingChanged) {
              return {
                newBoard,
                specs: {
                  affectedCells: cells,
                  affectedNumbers: nums,
                },
              };
            }
          }
        }
      }
    }
  }

  return false;
};

/**
 * finds naked quads in a given set of cells and updates the board appropriatly
 * @param set set of cells from a box, column or row
 * @param board current state of the board
 * @returns if something was updated => updated board; else => false;
 */
const checkNakedQuads = (set: CellT[], board: CellT[]): { newBoard: CellT[], specs: TSpecs } | false => {
  const candidates = set.filter((cell) => cell.cornerPencil.length <= 4 && cell.cornerPencil.length > 1);
  if (candidates.length < 4) return false;
  for (let a = 0; a < candidates.length; a += 1) {
    for (let b = a + 1; b < candidates.length; b += 1) {
      for (let c = b + 1; c < candidates.length; c += 1) {
        for (let d = c + 1; d < candidates.length; d += 1) {
          const combinedNums = [
            ...candidates[a].cornerPencil,
            ...candidates[b].cornerPencil,
            ...candidates[c].cornerPencil,
            ...candidates[d].cornerPencil,
          ]
            .sort()
            .filter((num, pos, arr) => !pos || num !== arr[pos - 1]);
          // It's a naked triple
          if (combinedNums.length === 4) {
            const pairedCells = [candidates[a].id, candidates[b].id, candidates[c].id, candidates[d].id];
            const restrictedCells = findRestrictedCells(pairedCells);
            let affectedCells: string[] = [];
            let somethingChanged = false;
            const newBoard = board.map((cell) => {
              if (cell.bigNum) return cell;
              if (!restrictedCells.includes(cell.id)) return cell;
              if (
                !cell.cornerPencil.includes(combinedNums[0])
                && !cell.cornerPencil.includes(combinedNums[1])
                && !cell.cornerPencil.includes(combinedNums[2])
                && !cell.cornerPencil.includes(combinedNums[3])
              ) return cell;
              somethingChanged = true;
              affectedCells = [...affectedCells, cell.id];
              return { ...cell, cornerPencil: cell.cornerPencil.filter((num) => !combinedNums.includes(num)) };
            });
            if (somethingChanged) {
              return {
                newBoard,
                specs: {
                  affectedCells,
                  affectedNumbers: combinedNums,
                  sourceCells: pairedCells,
                },
              };
            }
          }
        }
      }
    }
  }

  return false;
};

/**
 * Checks if for given rows or columns an X-Wing exists
 * @param board current state of the board
 * @param sets all possible candidates for rows OR columns (not both at the same time)
 * @param finned check for finned or regular X-Wings?
 * @returns updated board if changes are made | false
 */
const checkXWing = (board: CellT[], sets: [string, string[]][], finned: boolean): { newBoard: CellT[], specs: TSpecs } | false => {
  let rows: string[] = [];
  let columns: string[] = [];
  let cells: string[] = [];

  for (let n = 1; n <= 9; n += 1) {
    const filteredSets = sets.filter((el) => el[0] === String(n));
    if (filteredSets.length >= 2) {
      for (let a = 0; a < filteredSets.length; a += 1) {
        for (let b = a + 1; b < filteredSets.length; b += 1) {
          const targetCells = [...filteredSets[a][1], ...filteredSets[b][1]];
          rows = [...filteredSets[a][1].map((el) => el[1]), ...filteredSets[b][1].map((el) => el[1])].sort();
          columns = [...filteredSets[a][1].map((el) => el[0]), ...filteredSets[b][1].map((el) => el[0])].sort();
          cells = [...filteredSets[a][1], ...filteredSets[b][1]];
          const uniqRows = rows.filter((el, i, arr) => !i || el !== arr[i - 1]);
          const uniqCols = columns.filter((el, i, arr) => !i || el !== arr[i - 1]);

          // Looking for finned X-Wings
          if (finned) {
            let rowDuplicates: string[] = [];
            let colDuplicates: string[] = [];
            let fins: string[] = [];
            let restrictedCells: string[] = [];
            let isSahimi = false;

            // X-Wing in column
            if (uniqCols.length === 2 && uniqRows.length !== 2) {
              cells.sort((cellA, cellB) => {
                if (cellA[1] < cellB[1]) return -1;
                if (cellA[1] > cellB[1]) return 1;
                return 0;
              }).forEach((el, i, arr) => {
                if (!i) return;
                if (arr[i - 1][1] === el[1] && !rowDuplicates.includes(el)) rowDuplicates = [...rowDuplicates, el];
              });
              // finned
              if (rowDuplicates.length === 2) {
                const restrictedRows = rowDuplicates.map((el) => el[1]);
                isSahimi = false;
                fins = cells.filter((el) => !restrictedRows.includes(el[1]));
                restrictedCells = findRestrictedCells(fins).filter((el) => restrictedRows.includes(el[1]));
              }
              // Sashimi/skyscraper
              if (rowDuplicates.length === 1) {
                fins = cells.filter((el) => el[1] !== rowDuplicates[0][1]);
                restrictedCells = findRestrictedCells(fins);
                isSahimi = true;
              }
              if (restrictedCells) {
                let somethingChanged = false;
                let affectedCells: string[] = [];
                const newBoard = board.map((cell) => {
                  if (cell.bigNum || !restrictedCells.includes(cell.id) || cells.includes(cell.id)) return cell;
                  if (!cell.cornerPencil.includes(String(n))) return cell;
                  somethingChanged = true;
                  affectedCells = [...affectedCells, cell.id];
                  return { ...cell, cornerPencil: cell.cornerPencil.filter((num) => num !== String(n)) };
                });
                if (somethingChanged) {
                  return {
                    newBoard,
                    specs: {
                      sourceCells: rowDuplicates,
                      affectedCells,
                      affectedNumbers: [String(n)],
                      fins,
                      sashimi: isSahimi,
                    },
                  };
                }
              }
            }
            // X-Wing in rows
            if (uniqRows.length === 2 && uniqCols.length !== 2) {
              cells.sort().forEach((el, i, arr) => {
                if (!i) return;
                if (arr[i - 1][0] === el[0] && !colDuplicates.includes(el)) colDuplicates = [...colDuplicates, el];
              });
              // finned
              if (colDuplicates.length === 2) {
                const restrictedCols = colDuplicates.map((el) => el[0]);
                isSahimi = false;
                fins = cells.filter((el) => !restrictedCols.includes(el[0]));
                restrictedCells = findRestrictedCells(fins).filter((el) => restrictedCols.includes(el[0]));
              }
              // Sashimi
              if (colDuplicates.length === 1) {
                fins = cells.filter((el) => el[0] !== colDuplicates[0][0]);
                restrictedCells = findRestrictedCells(fins);
                isSahimi = true;
              }
              if (restrictedCells) {
                let somethingChanged = false;
                let affectedCells: string[] = [];
                const newBoard = board.map((cell) => {
                  if (cell.bigNum || !restrictedCells.includes(cell.id) || cells.includes(cell.id)) return cell;
                  if (!cell.cornerPencil.includes(String(n))) return cell;
                  somethingChanged = true;
                  affectedCells = [...affectedCells, cell.id];
                  return { ...cell, cornerPencil: cell.cornerPencil.filter((num) => num !== String(n)) };
                });
                if (somethingChanged) {
                  return {
                    newBoard,
                    specs: {
                      sourceCells: colDuplicates,
                      affectedCells,
                      affectedNumbers: [String(n)],
                      fins,
                      sashimi: isSahimi,
                    },
                  };
                }
              }
            }
            // Not looking for finned X-Wings
          } else {
            let somethingChanged = false;
            let affectedCells: string[] = [];
            if (uniqCols.length === 2) {
              const newBoard = board.map((cell) => {
                if (cell.bigNum || targetCells.includes(cell.id)) return cell;
                if (!uniqCols.includes(cell.id[0])) return cell;
                if (!cell.cornerPencil.includes(String(n))) return cell;
                somethingChanged = true;
                affectedCells = [...affectedCells, cell.id];
                return { ...cell, cornerPencil: cell.cornerPencil.filter((num) => num !== String(n)) };
              });
              if (somethingChanged) {
                return {
                  newBoard,
                  specs: {
                    sourceCells: targetCells,
                    affectedCells,
                    affectedNumbers: [String(n)],
                    set: `Columns: ${uniqCols[0]} and ${uniqCols[1]}`,
                  },
                };
              }
            }

            if (uniqRows.length === 2) {
              const newBoard = board.map((cell) => {
                if (cell.bigNum || targetCells.includes(cell.id)) return cell;
                if (!uniqRows.includes(cell.id[1])) return cell;
                if (!cell.cornerPencil.includes(String(n))) return cell;
                affectedCells = [...affectedCells, cell.id];
                somethingChanged = true;
                return { ...cell, cornerPencil: cell.cornerPencil.filter((num) => num !== String(n)) };
              });
              if (somethingChanged) {
                return {
                  newBoard,
                  specs: {
                    sourceCells: targetCells,
                    affectedCells,
                    affectedNumbers: [String(n)],
                    set: `Rows: ${uniqRows[0]} and ${uniqRows[1]}`,
                  },
                };
              }
            }
          }
        }
      }
    }
  }

  return false;
};

/**
 * Checks if for given rows or columns a Sword Fish exists
 * @param board current state of the board
 * @param sets all possible candidates for rows OR columns (not both at the same time)
 * @param finned check for finned or regular Sword Fishes?
 * @returns updated board if changes are made | false
 */
const checkSwordFish = (board: CellT[], sets: [string, string[]][], finned: boolean): { newBoard: CellT[], specs: TSpecs } | false => {
  let rows: string[] = [];
  let columns: string[] = [];
  let cells: string[] = [];

  for (let n = 1; n <= 9; n += 1) {
    const filteredSets = sets.filter((el) => el[0] === String(n));
    if (filteredSets.length >= 3) {
      for (let a = 0; a < filteredSets.length; a += 1) {
        for (let b = a + 1; b < filteredSets.length; b += 1) {
          for (let c = b + 1; c < filteredSets.length; c += 1) {
            const targetCells = [...filteredSets[a][1], ...filteredSets[b][1], ...filteredSets[c][1]];
            rows = [
              ...filteredSets[a][1].map((el) => el[1]),
              ...filteredSets[b][1].map((el) => el[1]),
              ...filteredSets[c][1].map((el) => el[1]),
            ].sort();
            columns = [
              ...filteredSets[a][1].map((el) => el[0]),
              ...filteredSets[b][1].map((el) => el[0]),
              ...filteredSets[c][1].map((el) => el[0]),
            ].sort();
            cells = [
              ...filteredSets[a][1],
              ...filteredSets[b][1],
              ...filteredSets[c][1],
            ];
            const uniqRows = rows.filter((el, i, arr) => !i || el !== arr[i - 1]);
            const uniqCols = columns.filter((el, i, arr) => !i || el !== arr[i - 1]);

            rows = rows.filter((el, i, arr) => !i || el !== arr[i - 1]);
            columns = columns.filter((el, i, arr) => !i || el !== arr[i - 1]);

            // Looking for finned SwordFishes
            if (finned) {
              let rowDuplicates: string[] = [];
              let rowDuplicatesCols: string[] = [];
              let colDuplicates: string[] = [];
              let colDuplicatesRows: string[] = [];
              let fins: string[] = [];
              let restrictedCells: string[] = [];
              let isSashimi = false;
              // SwordFish in column
              if (uniqCols.length === 3 && uniqRows.length !== 3) {
                cells.sort((cellA, cellB) => {
                  if (cellA[1] < cellB[1]) return -1;
                  if (cellA[1] > cellB[1]) return 1;
                  return 0;
                }).forEach((el, i, arr) => {
                  if (!i) return;
                  if (arr[i - 1][1] === el[1] && !rowDuplicates.includes(el)) rowDuplicates = [...rowDuplicates, el];
                });
                // finned
                if (rowDuplicates.length === 3) {
                  let validFin = true;
                  const restrictedRows = rowDuplicates.map((el) => el[1]);
                  isSashimi = false;
                  fins = cells.filter((el) => !restrictedRows.includes(el[1]));
                  rowDuplicatesCols = cells.filter((el) => !fins.includes(el)).map((el) => el[0]);
                  for (let i = 0; i < fins.length; i += 1) {
                    if (!rowDuplicatesCols.includes(fins[i][0])) validFin = false;
                  }
                  if (validFin) restrictedCells = findRestrictedCells(fins).filter((el) => restrictedRows.includes(el[1]));
                }
                // Sashimi
                if (rowDuplicates.length === 2) {
                  let validSashimi = true;
                  isSashimi = true;
                  fins = cells.filter((el) => el[1] !== rowDuplicates[0][1] && el[1] !== rowDuplicates[1][1]);
                  rowDuplicatesCols = cells.filter((el) => !fins.includes(el)).map((el) => el[0]);
                  for (let i = 0; i < fins.length; i += 1) {
                    if (!rowDuplicatesCols.includes(fins[i][0])) validSashimi = false;
                  }
                  if (validSashimi) restrictedCells = findRestrictedCells(fins);
                }
                if (restrictedCells) {
                  let somethingChanged = false;
                  let affectedCells: string[] = [];
                  const newBoard = board.map((cell) => {
                    if (cell.bigNum || !restrictedCells.includes(cell.id) || cells.includes(cell.id)) return cell;
                    if (!cell.cornerPencil.includes(String(n))) return cell;
                    somethingChanged = true;
                    affectedCells = [...affectedCells, cell.id];
                    return { ...cell, cornerPencil: cell.cornerPencil.filter((num) => num !== String(n)) };
                  });
                  if (somethingChanged) {
                    return {
                      newBoard,
                      specs: {
                        sourceCells: cells.filter((el) => !fins.includes(el)),
                        affectedCells,
                        affectedNumbers: [String(n)],
                        fins,
                        sashimi: isSashimi,
                      },
                    };
                  }
                }
              }
              // SwordFish in rows
              if (uniqRows.length === 3 && uniqCols.length !== 3) {
                cells.sort().forEach((el, i, arr) => {
                  if (!i) return;
                  if (arr[i - 1][0] === el[0] && !colDuplicates.includes(el)) colDuplicates = [...colDuplicates, el];
                });
                // finned
                if (colDuplicates.length === 3) {
                  let validFin = true;
                  isSashimi = false;
                  const restrictedCols = colDuplicates.map((el) => el[0]);
                  fins = cells.filter((el) => !restrictedCols.includes(el[0]));
                  colDuplicatesRows = cells.filter((el) => !fins.includes(el)).map((el) => el[1]);
                  for (let i = 0; i < fins.length; i += 1) {
                    if (!colDuplicatesRows.includes(fins[i][1])) validFin = false;
                  }
                  if (validFin) restrictedCells = findRestrictedCells(fins).filter((el) => restrictedCols.includes(el[0]));
                }
                // Sashimi
                if (colDuplicates.length === 2) {
                  let validSashimi = true;
                  isSashimi = true;
                  fins = cells.filter((el) => el[0] !== colDuplicates[0][0] && el[0] !== colDuplicates[1][0]);
                  colDuplicatesRows = cells.filter((el) => !fins.includes(el)).map((el) => el[1]);
                  for (let i = 0; i < fins.length; i += 1) {
                    if (!colDuplicatesRows.includes(fins[i][1])) validSashimi = false;
                  }
                  if (validSashimi) restrictedCells = findRestrictedCells(fins);
                }
                if (restrictedCells) {
                  let somethingChanged = false;
                  const affectedCells: string[] = [];
                  const newBoard = board.map((cell) => {
                    if (cell.bigNum || !restrictedCells.includes(cell.id) || cells.includes(cell.id)) return cell;
                    if (!cell.cornerPencil.includes(String(n))) return cell;
                    somethingChanged = true;
                    return { ...cell, cornerPencil: cell.cornerPencil.filter((num) => num !== String(n)) };
                  });
                  if (somethingChanged) {
                    return {
                      newBoard,
                      specs: {
                        sourceCells: cells.filter((el) => !fins.includes(el)),
                        affectedCells,
                        affectedNumbers: [String(n)],
                        fins,
                        sashimi: isSashimi,
                      },
                    };
                  }
                }
              }
              // Not looking for finned SwordFishs
            } else {
              let somethingChanged = false;
              let affectedCells: string[] = [];
              if (uniqCols.length === 3) {
                const newBoard = board.map((cell) => {
                  if (cell.bigNum || targetCells.includes(cell.id)) return cell;
                  if (!uniqCols.includes(cell.id[0])) return cell;
                  if (!cell.cornerPencil.includes(String(n))) return cell;
                  somethingChanged = true;
                  affectedCells = [...affectedCells, cell.id];
                  return { ...cell, cornerPencil: cell.cornerPencil.filter((num) => num !== String(n)) };
                });
                if (somethingChanged) {
                  return {
                    newBoard,
                    specs: {
                      sourceCells: cells,
                      affectedCells,
                      affectedNumbers: [String(n)],
                    },
                  };
                }
              }

              if (uniqRows.length === 3) {
                const newBoard = board.map((cell) => {
                  if (cell.bigNum || targetCells.includes(cell.id)) return cell;
                  if (!uniqRows.includes(cell.id[1])) return cell;
                  if (!cell.cornerPencil.includes(String(n))) return cell;
                  somethingChanged = true;
                  affectedCells = [...affectedCells, cell.id];
                  return { ...cell, cornerPencil: cell.cornerPencil.filter((num) => num !== String(n)) };
                });
                if (somethingChanged) {
                  return {
                    newBoard,
                    specs: {
                      sourceCells: cells,
                      affectedCells,
                      affectedNumbers: [String(n)],
                    },
                  };
                }
              }
            }
          }
        }
      }
    }
  }

  return false;
};

/**
 * Checks if for given rows or columns a Jelly Fish exists
 * @param board current state of the board
 * @param sets all possible candidates for rows OR columns (not both at the same time)
 * @param finned check for finned or regular Jelly Fishes?
 * @returns updated board if changes are made | false
 */
const checkJellyFish = (board: CellT[], sets: [string, string[]][], finned: boolean): { newBoard: CellT[], specs: TSpecs } | false => {
  let rows: string[] = [];
  let columns: string[] = [];
  let cells: string[] = [];

  for (let n = 1; n <= 9; n += 1) {
    const filteredSets = sets.filter((el) => el[0] === String(n));
    if (filteredSets.length >= 4) {
      for (let a = 0; a < filteredSets.length; a += 1) {
        for (let b = a + 1; b < filteredSets.length; b += 1) {
          for (let c = b + 1; c < filteredSets.length; c += 1) {
            for (let d = c + 1; d < filteredSets.length; d += 1) {
              const targetCells = [...filteredSets[a][1], ...filteredSets[b][1], ...filteredSets[c][1], ...filteredSets[d][1]];
              rows = [
                ...filteredSets[a][1].map((el) => el[1]),
                ...filteredSets[b][1].map((el) => el[1]),
                ...filteredSets[c][1].map((el) => el[1]),
                ...filteredSets[d][1].map((el) => el[1]),
              ].sort();
              columns = [
                ...filteredSets[a][1].map((el) => el[0]),
                ...filteredSets[b][1].map((el) => el[0]),
                ...filteredSets[c][1].map((el) => el[0]),
                ...filteredSets[d][1].map((el) => el[0]),
              ].sort();
              cells = [
                ...filteredSets[a][1],
                ...filteredSets[b][1],
                ...filteredSets[c][1],
                ...filteredSets[d][1],
              ];

              const uniqRows = rows.filter((el, i, arr) => !i || el !== arr[i - 1]);
              const uniqCols = columns.filter((el, i, arr) => !i || el !== arr[i - 1]);

              rows = rows.sort().filter((el, i, arr) => !i || el !== arr[i - 1]);
              columns = columns.sort().filter((el, i, arr) => !i || el !== arr[i - 1]);

              // Looking for finned SwordHishes
              if (finned) {
                let rowDuplicates: string[] = [];
                let rowDuplicatesCols: string[] = [];
                let colDuplicates: string[] = [];
                let colDuplicatesRows: string[] = [];
                let fins: string[] = [];
                let restrictedCells: string[] = [];
                let isSashimi = false;
                // JellyFish in column
                if (uniqCols.length === 4 && uniqRows.length !== 4) {
                  cells.sort((cellA, cellB) => {
                    if (cellA[1] < cellB[1]) return -1;
                    if (cellA[1] > cellB[1]) return 1;
                    return 0;
                  }).forEach((el, i, arr) => {
                    if (!i) return;
                    if (arr[i - 1][1] === el[1] && !rowDuplicates.includes(el[1])) rowDuplicates = [...rowDuplicates, el[1]];
                  });
                  // finned
                  if (rowDuplicates.length === 4) {
                    let validFin = true;
                    isSashimi = false;
                    const restrictedRows = rowDuplicates.map((el) => el[1]);
                    fins = cells.filter((el) => !restrictedRows.includes(el[1]));
                    rowDuplicatesCols = cells.filter((el) => !fins.includes(el)).map((el) => el[0]);
                    for (let i = 0; i < fins.length; i += 1) {
                      if (!rowDuplicatesCols.includes(fins[i][0])) validFin = false;
                    }
                    if (validFin) restrictedCells = findRestrictedCells(fins).filter((el) => restrictedRows.includes(el[1]));
                  }
                  // Sashimi
                  if (rowDuplicates.length === 3) {
                    let validSahimi = true;
                    isSashimi = true;
                    fins = cells.filter((el) => (
                      el[1] !== rowDuplicates[0][1]
                      && el[1] !== rowDuplicates[1][1]
                      && el[1] !== rowDuplicates[2][1]
                    ));
                    rowDuplicatesCols = cells.filter((el) => !fins.includes(el)).map((el) => el[0]);
                    for (let i = 0; i < fins.length; i += 1) {
                      if (!rowDuplicatesCols.includes(fins[i][1])) validSahimi = false;
                    }
                    if (validSahimi) restrictedCells = findRestrictedCells(fins);
                  }
                  if (restrictedCells) {
                    let somethingChanged = false;
                    let affectedCells: string[] = [];
                    const newBoard = board.map((cell) => {
                      if (cell.bigNum || !restrictedCells.includes(cell.id) || cells.includes(cell.id)) return cell;
                      if (!cell.cornerPencil.includes(String(n))) return cell;
                      somethingChanged = true;
                      affectedCells = [...affectedCells, cell.id];
                      return { ...cell, cornerPencil: cell.cornerPencil.filter((num) => num !== String(n)) };
                    });
                    if (somethingChanged) {
                      return {
                        newBoard,
                        specs: {
                          sourceCells: cells.filter((el) => !fins.includes(el)),
                          affectedCells,
                          affectedNumbers: [String(n)],
                          fins,
                          sashimi: isSashimi,
                        },
                      };
                    }
                  }
                }
                // JellyFish in rows
                if (uniqRows.length === 4 && uniqCols.length !== 4) {
                  cells.sort().forEach((el, i, arr) => {
                    if (!i) return;
                    if (arr[i - 1][0] === el[0] && !colDuplicates.includes(el[0])) colDuplicates = [...colDuplicates, el[0]];
                  });
                  // finned
                  if (colDuplicates.length === 4) {
                    let validFin = true;
                    isSashimi = false;
                    const restrictedCols = colDuplicates.map((el) => el[0]);
                    fins = cells.filter((el) => !restrictedCols.includes(el[0]));
                    colDuplicatesRows = cells.filter((el) => !fins.includes(el)).map((el) => el[1]);
                    for (let i = 0; i < fins.length; i += 1) {
                      if (!colDuplicatesRows.includes(fins[i][1])) validFin = false;
                    }
                    if (validFin) restrictedCells = findRestrictedCells(fins).filter((el) => restrictedCols.includes(el[0]));
                  }
                  // Sashimi
                  if (colDuplicates.length === 3) {
                    let validSahimi = true;
                    isSashimi = true;
                    fins = cells.filter((el) => (
                      el[0] !== colDuplicates[0][0]
                      && el[0] !== colDuplicates[1][0]
                      && el[0] !== colDuplicates[2][0]
                    ));
                    colDuplicatesRows = cells.filter((el) => !fins.includes(el)).map((el) => el[1]);
                    for (let i = 0; i < fins.length; i += 1) {
                      if (!colDuplicatesRows.includes(fins[i][1])) validSahimi = false;
                    }
                    if (validSahimi) restrictedCells = findRestrictedCells(fins);
                  }
                  if (restrictedCells) {
                    let somethingChanged = false;
                    let affectedCells: string[] = [];
                    const newBoard = board.map((cell) => {
                      if (cell.bigNum || !restrictedCells.includes(cell.id) || cells.includes(cell.id)) return cell;
                      if (!cell.cornerPencil.includes(String(n))) return cell;
                      somethingChanged = true;
                      affectedCells = [...affectedCells, cell.id];
                      return { ...cell, cornerPencil: cell.cornerPencil.filter((num) => num !== String(n)) };
                    });
                    if (somethingChanged) {
                      return {
                        newBoard,
                        specs: {
                          sourceCells: cells.filter((el) => !fins.includes(el)),
                          affectedCells,
                          affectedNumbers: [String(n)],
                          fins,
                          sashimi: isSashimi,
                        },
                      };
                    }
                  }
                }
                // Not looking for finned SwordFishs
              } else {
                let somethingChanged = false;
                let affectedCells: string[] = [];
                if (uniqCols.length === 4) {
                  const newBoard = board.map((cell) => {
                    if (cell.bigNum || targetCells.includes(cell.id)) return cell;
                    if (!uniqCols.includes(cell.id[0])) return cell;
                    if (!cell.cornerPencil.includes(String(n))) return cell;
                    somethingChanged = true;
                    affectedCells = [...affectedCells, cell.id];
                    return { ...cell, cornerPencil: cell.cornerPencil.filter((num) => num !== String(n)) };
                  });
                  if (somethingChanged) {
                    return {
                      newBoard,
                      specs: {
                        sourceCells: cells,
                        affectedCells,
                        affectedNumbers: [String(n)],
                      },
                    };
                  }
                }

                if (uniqRows.length === 4) {
                  const newBoard = board.map((cell) => {
                    if (cell.bigNum || targetCells.includes(cell.id)) return cell;
                    if (!uniqRows.includes(cell.id[1])) return cell;
                    if (!cell.cornerPencil.includes(String(n))) return cell;
                    somethingChanged = true;
                    affectedCells = [...affectedCells, cell.id];
                    return { ...cell, cornerPencil: cell.cornerPencil.filter((num) => num !== String(n)) };
                  });
                  if (somethingChanged) {
                    return {
                      newBoard,
                      specs: {
                        sourceCells: cells,
                        affectedCells,
                        affectedNumbers: [String(n)],
                      },
                    };
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return false;
};

/** Fill all possibilities for each cell in a given board
 * @param board current state of the board
 * @returns board with the possible numbers added to cornerPencil property
 */
export const fillPossibleNums = (board: CellT[]): CellT[] => board.map((cell) => {
  if (cell.bigNum) return { ...cell, cornerPencil: [] };
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

/**
 * Checks boxes rows and columns for a full house
 * @param board current state of the board
 * @returns updated state of the board | false
 */
export const checkFullHouse = (board: CellT[]): {
  newBoard: CellT[],
  specs: TSpecs,
} | false => {
  const { boxes, rows, columns } = getRowsBoxesColumns(board);
  const sets = [boxes, rows, columns];

  // Loop through each set
  for (let x = 0; x < 9; x += 1) {
    for (let c = 0; c < 3; c += 1) {
      const set = `${setTypes[c]}: ${x + 1}`;
      const result = isMissingOneNum(sets[c][x]);
      if (result) {
        const [cellId, num] = result;
        const newBoard = updateBoard(board, cellId, num, 'normal', true);
        return { newBoard, specs: { affectedNumbers: [num], affectedCells: [cellId], set } };
      }
    }
  }

  return false;
};

/**
 * check cells for a naked single
 * @param board current state of the board
 * @returns updated state of the board | false
 */
export const checkNakedSingles = (board: CellT[]): { newBoard: CellT[], specs: TSpecs } | false => {
  // Loop through eeach cell in board
  for (let i = 0; i < board.length; i += 1) {
    // If there is only 1 possible number for this cell and it does not already contain a number
    if (!board[i].bigNum && board[i].cornerPencil.length === 1) {
      const cellId = board[i].id;
      const [num] = board[i].cornerPencil;
      const newBoard = updateBoard(board, cellId, num, 'normal', true);
      return { newBoard, specs: { affectedCells: [cellId], affectedNumbers: [num] } };
    }
  }

  return false;
};

/**
 * checks cells for a hidden single
 * @param board current state of the board
 * @returns updated state of the board | false
 */
export const checkHiddenSingles = (board: CellT[]): {
  newBoard: CellT[],
  specs: TSpecs,
} | false => {
  // Loop through each box, row and column
  for (let x = 0; x < 9; x += 1) {
    const sets = enumSets(board, x);
    for (let i = 0; i < 3; i += 1) {
      const set = `${setTypes[i]}: ${x + 1}`;
      const asArray = Object.entries(sets[i]);
      const result = asArray.find(([, cells]) => cells.length === 1);
      if (result) {
        const [num, [cellId]] = result;
        const newBoard = updateBoard(board, cellId, num, 'normal', true);
        return {
          newBoard,
          specs: {
            affectedCells: [cellId],
            affectedNumbers: [num],
            set,
          },
        };
      }
    }
  }

  return false;
};

/**
 * Check for numbers in a box where it's only possible for it to go in a single row or a single column and update the state of the board
 * @param board current state of the board
 * @returns updated state of the board | false
 */
export const checkLockedCandidatesPointing = (board: CellT[]): { newBoard: CellT[], specs: TSpecs } | false => {
  // Loop through each box
  for (let x = 0; x < 9; x += 1) {
    // get nums in box where only 2 or 3 cells are possible
    const [box] = enumSets(board, x);
    const asArray = Object.entries(box);
    const candidates = asArray.filter(([, cellIds]) => cellIds.length <= 3 && cellIds.length >= 2);

    // Loop through each possible candidate
    for (let i = 0; i < candidates.length; i += 1) {
      const [num, cellIds] = candidates[i];

      // are all possible cells in a single column
      const isSingleCol = cellIds.map((id) => id[0])
        .sort()
        .filter((col, pos, arr) => !pos || col !== arr[pos - 1])
        .length === 1;
      // are all possible cells in a single row
      const isSingleRow = cellIds.map((id) => id[1])
        .sort()
        .filter((col, pos, arr) => !pos || col !== arr[pos - 1])
        .length === 1;

      // If they are in either a single row or column
      if (isSingleCol || isSingleRow) {
        const restrictedCells = findRestrictedCells(cellIds);
        let somethingChanged = false;
        const newBoard = board.map((cell) => {
          if (cell.bigNum) return cell;
          if (!restrictedCells.includes(cell.id)) return cell;
          if (!cell.cornerPencil.includes(num)) return cell;
          somethingChanged = true;
          return { ...cell, cornerPencil: cell.cornerPencil.filter((mark) => mark !== num) };
        });

        if (somethingChanged) {
          return {
            newBoard,
            specs: {
              affectedCells: cellIds,
              affectedNumbers: [num],
              set: `box: ${x + 1}`,
            },
          };
        }
      }
    }
  }

  return false;
};

/**
 * checks if in a row or column, a number can only be placed in a box and updates the board approriatly
 * @param board current state of the board
 * @returns updated state of the board | false
 */
export const checkLockedCandidatesClaiming = (board: CellT[]): { newBoard: CellT[], specs: TSpecs } | false => {
  // Loop through each row and column
  for (let x = 0; x < 9; x += 1) {
    const [, rowEnum, colEnum] = enumSets(board, x);
    const sets = [rowEnum, colEnum];

    // Lopp through the enumerated sets
    for (let c = 0; c < 2; c += 1) {
      // Get numbers that can only go in 2 or 3 positions in the set
      const asArray = Object.entries(sets[c]);
      const candidates = asArray.filter(([, cellIds]) => cellIds.length >= 2 && cellIds.length <= 3);

      // Lopp thruogh each candidate
      for (let i = 0; i < candidates.length; i += 1) {
        const [num, cellIds] = candidates[i];
        // are the possible positions in the same box
        const isSameBox = getBoxIndexes(board, cellIds)
          .map(([, boxIndex]) => boxIndex)
          .sort()
          .filter((id, pos, arr) => !pos || id !== arr[pos - 1])
          .length === 1;

        // If they are in the same box
        if (isSameBox) {
          const restrictedCells = findRestrictedCells(cellIds);
          let somethingChanged = false;
          const newBoard = board.map((cell) => {
            if (cell.bigNum) return cell;
            if (!restrictedCells.includes(cell.id)) return cell;
            if (!cell.cornerPencil.includes(num)) return cell;
            somethingChanged = true;
            return { ...cell, cornerPencil: cell.cornerPencil.filter((mark) => mark !== num) };
          });
          if (somethingChanged) {
            return {
              newBoard,
              specs: {
                affectedCells: cellIds,
                affectedNumbers: [num],
                set: `${setTypes[c + 1]}: ${x + 1}`,
              },
            };
          }
        }
      }
    }
  }

  return false;
};

/**
 * Checks for hidden subsets(pairs, triples or quadruples) annd updates the state of the board
 * @param board currennt  state of the board
 * @param amount { 2 | 3 | 4 }, represents pairs | triples | quadruples
 * @returns updatd state of the board | false
 */
export const checkHiddenSubsets = (board: CellT[], amount: number): { newBoard: CellT[], specs: TSpecs } | false => {
  // Loop through each box row and column
  for (let x = 0; x < 9; x += 1) {
    const [boxEnum, rowEnum, colEnum] = enumSets(board, x);

    // convert enumerated objects to arrays and filter out results with to many hits
    let asArray = Object.entries(boxEnum);
    const filteredBoxEnum = asArray.filter(([, cells]) => cells.length <= amount && cells.length > 1);
    asArray = Object.entries(rowEnum);
    const filteredRowEnum = asArray.filter(([, cells]) => cells.length <= amount && cells.length > 1);
    asArray = Object.entries(colEnum);
    const filteredColEnum = asArray.filter(([, cells]) => cells.length <= amount && cells.length > 1);
    const filteredEnums = [filteredBoxEnum, filteredRowEnum, filteredColEnum];

    let result: { newBoard: CellT[], specs: TSpecs } | false;
    // If we are looking for pairs
    for (let c = 0; c < filteredEnums.length; c += 1) {
      let set = '';
      if (c === 0) set = `box: ${x + 1};`;
      if (c === 1) set = `row: ${x + 1};`;
      if (c === 2) set = `column: ${x + 1};`;

      switch (amount) {
        case 2:
          result = checkHiddenPairs(filteredEnums[c], board);
          if (result) return { ...result, specs: { ...result.specs, set } };
          break;
        case 3:
          result = checkHiddenTriples(filteredEnums[c], board);
          if (result) return { ...result, specs: { ...result.specs, set } };
          break;
        case 4:
          result = checkHiddenQuads(filteredEnums[c], board);
          if (result) return { ...result, specs: { ...result.specs, set } };
          break;
        default:
          return false;
      }
    }
  }

  return false;
};

/**
 * Checks for naked subsets(pairs, triples or quadruples) annd updates the state of the board
 * @param board current state of the board
 * @param amount { 2 | 3 | 4 }, represents pairs | triples | quadruples
 * @returns updated state of the board | false
 */
export const checkNakedSubsets = (board: CellT[], amount: number): { newBoard: CellT[], specs: TSpecs } | false => {
  const { boxes, columns, rows } = getRowsBoxesColumns(board);

  for (let i = 0; i < 9; i += 1) {
    const filteredBoxes = boxes[i].filter((cell) => cell.cornerPencil.length <= amount && cell.cornerPencil.length > 1);
    const filteredRows = rows[i].filter((cell) => cell.cornerPencil.length <= amount && cell.cornerPencil.length > 1);
    const filteredColumns = columns[i].filter((cell) => cell.cornerPencil.length <= amount && cell.cornerPencil.length > 1);

    const filteredSets = [filteredBoxes, filteredRows, filteredColumns];
    for (let c = 0; c < 3; c += 1) {
      let result: { newBoard: CellT[], specs: TSpecs } | false = false;

      let set = '';
      if (c === 0) set = `box: ${i + 1};`;
      if (c === 1) set = `row: ${i + 1};`;
      if (c === 2) set = `column: ${i + 1};`;

      switch (amount) {
        case 2:
          result = checkNakedPairs(filteredSets[c], board);
          if (result) return { ...result, specs: { ...result.specs, set } };
          break;
        case 3:
          result = checkNakedTriples(filteredSets[c], board);
          if (result) return { ...result, specs: { ...result.specs, set } };
          break;
        case 4:
          result = checkNakedQuads(filteredSets[c], board);
          if (result) return { ...result, specs: { ...result.specs, set } };
          break;
        default:
          return false;
      }
    }
  }

  return false;
};

/**
 * checks the board for so called fishes, X-Wings | Sword fishes | Jelly Fishes
 * @param board current state of the board
 * @param amount { 2 | 3 | 4 }, -> { X-Wings | Sword fishes | Jelly Fishes }
 * @param finned check for finned fishes?
 * @returns updated state of the board | false
 */
export const checkFishes = (board: CellT[], amount: number, finned: boolean): { newBoard: CellT[], specs: TSpecs } | false => {
  let filteredRows: [string, string[]][] = [];
  let filteredColumns: [string, string[]][] = [];

  // Loop through each row and column
  for (let x = 0; x < 9; x += 1) {
    const [, rowEnum, columnEnum] = enumSets(board, x);
    const fAmount = finned ? amount + 2 : amount;

    // convert enumerated objects to arrays and filter out results with to many hits
    let asArray = Object.entries(rowEnum);
    const filteredRowEnum = asArray.filter((el) => el[1].length <= fAmount);
    asArray = Object.entries(columnEnum);
    const filteredColumnEnum = asArray.filter((el) => el[1].length <= fAmount);

    if (filteredRowEnum.length && filteredRowEnum[0][1].length <= fAmount) filteredRows = [...filteredRows, ...filteredRowEnum];
    if (filteredColumnEnum.length && filteredColumnEnum[0][1].length <= fAmount) filteredColumns = [...filteredColumns, ...filteredColumnEnum];
  }

  let result: { newBoard: CellT[], specs: TSpecs } | false;
  switch (amount) {
    case 2:
      if (filteredColumns.length >= 2) {
        result = checkXWing(board, filteredColumns, finned);
        if (result) return result;
      }
      if (filteredRows.length >= 2) {
        result = checkXWing(board, filteredRows, finned);
        if (result) return result;
      }
      break;

    case 3:
      if (filteredColumns.length >= 3) {
        result = checkSwordFish(board, filteredColumns, finned);
        if (result) return result;
      }
      if (filteredRows.length >= 3) {
        result = checkSwordFish(board, filteredRows, finned);
        if (result) return result;
      }
      break;

    case 4:
      if (filteredColumns.length >= 4) {
        result = checkJellyFish(board, filteredColumns, finned);
        if (result) return result;
      }
      if (filteredRows.length >= 4) {
        result = checkJellyFish(board, filteredRows, finned);
        if (result) return result;
      }
      break;

    default:
      return false;
  }

  return false;
};

/**
 * checks for a 2-string kite, also known as a turbot fish or a 4 candidate long x-chain
 * @param board current state of the board
 * @returns updated state of the board | false
 */
export const checkTwoStringKite = (board: CellT[]): CellT[] | false => {
  let rows: [string, string[]][] = [];
  let cols: [string, string[]][] = [];

  // Enumerate all rows and columns where a number can only be in 2 positions
  for (let x = 0; x < 9; x += 1) {
    const [, rowEnum, colEnum] = enumSets(board, x);

    let asArray = Object.entries(rowEnum);
    const filteredRowEnum = asArray.filter((el) => el[1].length === 2);
    asArray = Object.entries(colEnum);
    const filteredColumnEnum = asArray.filter((el) => el[1].length === 2);

    if (filteredRowEnum.length && filteredRowEnum[0][1].length === 2) rows = [...rows, ...filteredRowEnum];
    if (filteredColumnEnum.length && filteredColumnEnum[0][1].length === 2) cols = [...cols, ...filteredColumnEnum];
  }
  if (!rows.length || !cols.length) return false;

  // Loop through all possible numbers
  for (let n = 1; n <= 9; n += 1) {
    // Extract only the enumerations which are specified for n
    const filteredRows = rows.filter((el) => el[0] === String(n));
    const filteredCols = cols.filter((el) => el[0] === String(n));
    // Loop through each row and column
    for (let x = 0; x < filteredRows.length; x += 1) {
      for (let y = 0; y < filteredCols.length; y += 1) {
        let duplicateIndex: number;
        // Get all 4 cells from row and column
        const cells = [...filteredRows[x][1], ...filteredCols[y][1]];

        // Continue only if we are looking in 4 different cells
        if (cells.sort().filter((el, pos, arr) => !pos || arr[pos - 1] !== el).length === 4) {
          const boxIndexes = getBoxIndexes(board, cells);
          // remove duplicated boxIndxes
          const uniqIndexes = boxIndexes.map((el) => el[1]).sort().filter((el, pos, arr) => {
            if (!pos) return true;
            if (el !== arr[pos - 1]) return true;
            duplicateIndex = el;
            return false;
          });

          // if 2 of the cells are in the same box
          if (uniqIndexes.length === 3) {
            let somethingChanged = false;
            // Get cells that aren't in the same box
            const fins = boxIndexes.filter((el) => el[1] !== duplicateIndex).map((el) => el[0]);
            // Find the cells which can see both fins
            const restrictedCells = findRestrictedCells(fins);
            const newBoard = board.map((cell) => {
              if (cell.bigNum || !restrictedCells.includes(cell.id)) return cell;
              if (!cell.cornerPencil.includes(String(n))) return cell;
              somethingChanged = true;
              return { ...cell, cornerPencil: cell.cornerPencil.filter((num) => num !== String(n)) };
            });
            if (somethingChanged) return newBoard;
          }
        }
      }
    }
  }

  return false;
};

/**
 * checks for an "Empty Rectangle ("ER")", also known as a "finnned mutant X-Wing" or "Grouped nice loop"
 * @param board current state of the board
 * @returns updated state of the board | false
 */
export const checkEmptyRectangle = (board: CellT[]): { newBoard: CellT[], specs: TSpecs } | false => {
  const { boxes } = getRowsBoxesColumns(board);

  // Loop through all boxes
  for (let i = 0; i < boxes.length; i += 1) {
    // Loop through all numbers 1-9
    for (let n = 1; n <= 9; n += 1) {
      // check if there is an empty ractangle for {box[i]} on number: {n}
      const emptyRectangle = isEmptyRectangle(boxes[i], String(n));

      // If there is an empty rectangle
      if (emptyRectangle) {
        let result: { newBoard: CellT[], specs: TSpecs } | false = false;
        const sourceCells = boxes[i].filter((el) => el.cornerPencil.includes(String(n))).map((el) => el.id);

        if (emptyRectangle.length === 2) {
          // if it's regular empty rectangle
          const [erRow, erCol] = emptyRectangle;
          result = updateEmptyRectangle(board, String(n), erRow, erCol);
          if (result) {
            return { ...result, specs: { ...result.specs, sourceCells } };
          }
        } else {
          // empty rectangle with only 2 candidates
          const [erCol1, erRow1, erCol2, erRow2] = emptyRectangle;

          result = updateEmptyRectangle(board, String(n), erCol1, erRow2);
          if (!result) result = updateEmptyRectangle(board, String(n), erCol2, erRow1);
          if (result) {
            return { ...result, specs: { ...result.specs, sourceCells } };
          }
        }
      }
    }
  }

  return false;
};

/**
 * looks for an XY-Wing also called "bent triple" and updates the board if found
 * @param board current state of the eboard
 * @returns updateed state of the board | false
 */
export const checkXYwing = (board: CellT[]): { newBoard: CellT[], specs: TSpecs } | false => {
  // all cells that have 2 possibilities
  const bivalueCells = board.filter((cell) => cell.cornerPencil.length === 2);
  // Loop through each bivalue cell
  for (let i = 0; i < bivalueCells.length; i += 1) {
    const bivalueRestrictedCells = findRestrictedCells([bivalueCells[i].id]);
    // The possible pincer cells / the cells that can be seen by the bivalue cell and only have 2 possibilities
    const pincerCells = board.filter((cell) => {
      if (cell.bigNum) return false;
      if (!bivalueRestrictedCells.includes(cell.id)) return false;
      if (cell.cornerPencil.length !== 2) return false;
      return true;
    });
    const [x, y] = bivalueCells[i].cornerPencil;
    // Look for a pincercell that contains a number from the bivalue cell
    for (let a = 0; a < pincerCells.length; a += 1) {
      let z: string | undefined;

      // if the pincer cell contains a number from the bivalue cell -> the z = the other numbre in that cell
      if (pincerCells[a].cornerPencil.includes(x)) z = pincerCells[a].cornerPencil.find((num) => num !== x);
      if (pincerCells[a].cornerPencil.includes(y)) z = pincerCells[a].cornerPencil.find((num) => num !== y);

      if (z) {
        // Look for another pincer cell that contains
        for (let b = a + 1; b < pincerCells.length; b += 1) {
          // if the 3 cells combined only contain 3 diffrent numbers
          let isXYwing = [...pincerCells[a].cornerPencil, ...pincerCells[b].cornerPencil, ...bivalueCells[i].cornerPencil]
            .sort()
            .filter((el, pos, arr) => !pos || el !== arr[pos - 1])
            .length === 3;
          // and the cells are not all in thee same row or column
          const columns = [bivalueCells[i].id, pincerCells[a].id, pincerCells[b].id].map((el) => el[0])
            .sort()
            .filter((el, pos, arr) => !pos || arr[i - 1] === el);
          const rows = [bivalueCells[i].id, pincerCells[a].id, pincerCells[b].id].map((el) => el[0])
            .sort()
            .filter((el, pos, arr) => !pos || arr[i - 1] === el);
          if (columns.length === 1 || rows.length === 1) isXYwing = false;

          // It's an XY-Wing
          if (isXYwing) {
            const restrictedCells = findRestrictedCells([pincerCells[a].id, pincerCells[b].id]);
            let somethingChanged = false;
            let affectedCells: string[] = [];
            const newBoard = board.map((cell) => {
              if (cell.bigNum) return cell;
              if (bivalueCells[i].id === cell.id) return cell;
              if (!restrictedCells.includes(cell.id)) return cell;
              if (!cell.cornerPencil.includes(z!)) return cell;
              somethingChanged = true;
              affectedCells = [...affectedCells, cell.id];
              return { ...cell, cornerPencil: cell.cornerPencil.filter((num) => num !== z) };
            });

            if (somethingChanged) {
              return {
                newBoard,
                specs: {
                  sourceCells: [bivalueCells[i].id],
                  affectedCells,
                  affectedNumbers: [z],
                  fins: [pincerCells[a].id, pincerCells[b].id],
                },
              };
            }
          }
        }
      }
    }
  }

  return false;
};

/**
 * looks for an XYZ-Wing also called "bent triple" and updates the board if found
 * @param board current state of the board
 * @returns updated state of the board | false
 */
export const checkXYZwing = (board: CellT[]): { newBoard: CellT[], specs: TSpecs } | false => {
  const bivalueCells = board.filter((cell) => cell.cornerPencil.length === 3);

  for (let i = 0; i < bivalueCells.length; i += 1) {
    const bivalueRestrictedCells = findRestrictedCells([bivalueCells[i].id]);
    // The possible pincer cells / the cells that can be seen by the bivalue cell and only have 2 possibilities
    const pincerCells = board.filter((cell) => {
      if (cell.bigNum) return false;
      if (!bivalueRestrictedCells.includes(cell.id)) return false;
      if (cell.cornerPencil.length !== 2) return false;
      return true;
    });
    const bivalueCellNums = bivalueCells[i].cornerPencil;

    // Loop through all the pincercells
    for (let a = 0; a < pincerCells.length; a += 1) {
      // if the pincer cell only contains numbers from the bivalue cell
      let validPincerCell = true;
      for (let c = 0; c < 2; c += 1) {
        if (!bivalueCellNums.includes(pincerCells[a].cornerPencil[c])) validPincerCell = false;
      }

      if (validPincerCell) {
        // Loop through remaining pincer cells
        for (let b = a + 1; b < pincerCells.length; b += 1) {
          // if the pincer cell only contains numbers from the bivalue cell
          let isXYZwing = true;
          for (let c = 0; c < 2; c += 1) {
            if (!bivalueCellNums.includes(pincerCells[b].cornerPencil[c])) isXYZwing = false;
          }

          if (isXYZwing) {
            // Find the number which is common to all the cell in the wing
            const commonNums = [...bivalueCells[i].cornerPencil, ...pincerCells[a].cornerPencil, ...pincerCells[b].cornerPencil]
              .sort()
              .filter((num, pos, arr) => pos > 1 && num === arr[pos - 1] && num === arr[pos - 2]);

            if (commonNums.length === 1) {
              const numToLookFor = commonNums[0];
              // find the cells that can be seen by all the cells in the XYZ-Wing
              const restrictedCells = findRestrictedCells([bivalueCells[i].id, pincerCells[a].id, pincerCells[b].id]);
              let somethingChanged = false;
              let affectedCells: string[] = [];

              const newBoard = board.map((cell) => {
                if (cell.bigNum) return cell;
                if (!restrictedCells.includes(cell.id)) return cell;
                if (!cell.cornerPencil.includes(numToLookFor)) return cell;
                somethingChanged = true;
                affectedCells = [...affectedCells, cell.id];
                return { ...cell, cornerPencil: cell.cornerPencil.filter((num) => num !== numToLookFor) };
              });

              if (somethingChanged) {
                return {
                  newBoard,
                  specs: {
                    sourceCells: [bivalueCells[i].id],
                    affectedCells,
                    affectedNumbers: [numToLookFor],
                    fins: [pincerCells[a].id, pincerCells[b].id],
                  },
                };
              }
            }
          }
        }
      }
    }
  }

  return false;
};

/**
 * checks for a W-Wing and updates the bourd if found
 * @param board current state of the board
 * @returns updated state of the board | false
 */
export const checkWwing = (board: CellT[]): { newBoard: CellT[], specs: TSpecs } | false => {
  // all cells that only contain 2 candidates
  const bivalueCells = board.filter((cell) => cell.cornerPencil.length === 2);

  // loop through each combination of bivalue cells
  for (let a = 0; a < bivalueCells.length; a += 1) {
    for (let b = a + 1; b < bivalueCells.length; b += 1) {
      // Check if bivalue cells contain the same candidates -> if so it's a candidate for a W-Wing
      const uniqueNums = [...bivalueCells[a].cornerPencil, ...bivalueCells[b].cornerPencil]
        .sort()
        .filter((num, pos, arr) => !pos || num !== arr[pos - 1]);
      if (uniqueNums.length === 2) {
        // loop through each row and column
        for (let i = 0; i < 9; i += 1) {
          // Extract the rows and columns for the bivalue cells
          const bivalueCellRows = [bivalueCells[a].id[1], bivalueCells[b].id[1]];
          const bivalueCellCols = [bivalueCells[a].id[0], bivalueCells[b].id[0]];
          const [, rowEnum, colEnum] = enumSets(board, i);
          const rowEnumAsArray = Object.entries(rowEnum);
          const colEnumAsArray = Object.entries(colEnum);

          // Check for a strong link in the row
          const strongLinksRow = rowEnumAsArray.filter(([num, cellIds]) => {
            // if a number can only go in 2 postions in the row
            if (cellIds.length !== 2) return false;
            // and it's not the same row as one of the bivalue cells
            if (bivalueCellRows.includes(cellIds[0][1])) return false;
            // and it contains 1 of the numbers in the bivalue cells
            if (!uniqueNums.includes(num)) return false;
            // and the rows of the columns match the columns of the bivalue cells
            const cellCols = cellIds.map((id) => id[0]);
            const isStrongLink = [...bivalueCellCols, ...cellCols]
              .sort()
              .filter((el, pos, arr) => !pos || el !== arr[pos - 1])
              .length === 2;
            if (!isStrongLink) return false;
            // it's a strong link
            return true;
          });

          // check for a strong link in the row (check above for detailed explanation)
          const strongLinksColumn = colEnumAsArray.filter(([num, cellIds]) => {
            if (cellIds.length !== 2) return false;
            if (bivalueCellCols.includes(cellIds[0][0])) return false;
            if (!uniqueNums.includes(num)) return false;
            const cellRows = cellIds.map((id) => id[1]);
            const isStrongLink = [...bivalueCellRows, ...cellRows]
              .sort()
              .filter((el, pos, arr) => !pos || el !== arr[pos - 1])
              .length === 2;
            if (!isStrongLink) return false;
            return true;
          });

          // The number which strongly links the bivalue cells
          let strongLinkNum: string | undefined;
          let strongLinkCells: string[] | undefined;
          if (strongLinksColumn.length) [[strongLinkNum, strongLinkCells]] = strongLinksColumn;
          if (strongLinksRow.length) [[strongLinkNum, strongLinkCells]] = strongLinksRow;

          if (strongLinkNum) {
            // Thee number that gets restricted by the W-Wing
            const [numToRemove] = uniqueNums.filter((num) => num !== strongLinkNum);
            // the cells that are seen by both byvalue cells
            const restrictedCells = findRestrictedCells([bivalueCells[a].id, bivalueCells[b].id]);
            let somethingChanged = false;
            let affectedCells: string[] = [];

            const newBoard = board.map((cell) => {
              if (cell.bigNum) return cell;
              if (!restrictedCells.includes(cell.id)) return cell;
              if (!cell.cornerPencil.includes(numToRemove)) return cell;
              somethingChanged = true;
              affectedCells = [...affectedCells, cell.id];
              return { ...cell, cornerPencil: cell.cornerPencil.filter((num) => num !== numToRemove) };
            });

            if (somethingChanged) {
              return {
                newBoard,
                specs: {
                  sourceCells: [bivalueCells[a].id, bivalueCells[b].id],
                  affectedCells,
                  affectedNumbers: [numToRemove],
                  fins: strongLinkCells,
                },
              };
            }
          }
        }
      }
    }
  }
  return false;
};

/**
 * solves the pussle
 * @param board current state of the board
 * @param steps the steps it's taken to this point
 * @returns current state of the board | false
 */
export const solve = (board: CellT[], steps: TStep[] = []): { board: CellT[], steps: TStep[] } => {
  const boardCopy = [...board];
  const solved = isPussleSolved(boardCopy.map((cell) => cell.bigNum));
  if (solved) return { board: boardCopy, steps };

  let result = checkFullHouse(boardCopy);
  if (result) {
    const { newBoard, specs } = result;
    return solve(newBoard, [...steps, { type: 'fh', points: 10, ...specs }]);
  }

  result = checkHiddenSingles(boardCopy);
  if (result) {
    const { newBoard, specs } = result;
    return solve(newBoard, [...steps, { type: 'hs', points: 100, ...specs }]);
  }

  result = checkNakedSingles(boardCopy);
  if (result) {
    const { newBoard, specs } = result;
    return solve(newBoard, [...steps, { type: 'ns', points: 100, ...specs }]);
  }

  result = checkLockedCandidatesPointing(boardCopy);
  if (result) {
    const { newBoard, specs } = result;
    return solve(newBoard, [...steps, { type: 'lcp', points: 250, ...specs }]);
  }

  result = checkLockedCandidatesClaiming(boardCopy);
  if (result) {
    const { newBoard, specs } = result;
    return solve(newBoard, [...steps, { type: 'lcc', points: 500, ...specs }]);
  }

  result = checkHiddenSubsets(boardCopy, 2);
  if (result) {
    const { newBoard, specs } = result;
    return solve(newBoard, [...steps, { type: 'hp', points: 600, ...specs }]);
  }

  result = checkNakedSubsets(boardCopy, 2);
  if (result) {
    const { newBoard, specs } = result;
    return solve(newBoard, [...steps, { type: 'np', points: 1000, ...specs }]);
  }

  result = checkHiddenSubsets(boardCopy, 3);
  if (result) {
    const { newBoard, specs } = result;
    return solve(newBoard, [...steps, { type: 'ht', points: 1300, ...specs }]);
  }

  result = checkNakedSubsets(boardCopy, 3);
  if (result) {
    const { newBoard, specs } = result;
    return solve(newBoard, [...steps, { type: 'nt', points: 1600, ...specs }]);
  }

  result = checkFishes(boardCopy, 2, false);
  if (result) {
    const { newBoard, specs } = result;
    return solve(newBoard, [...steps, { type: 'xw', points: 1700, ...specs }]);
  }

  result = checkFishes(boardCopy, 2, true);
  if (result) {
    const { newBoard, specs } = result;
    if (specs.sashimi) {
      return solve(newBoard, [...steps, { type: 'ssc', points: 2200, ...specs }]);
    }
    return solve(newBoard, [...steps, { type: 'fxw', points: 2400, ...specs }]);
  }

  result = checkEmptyRectangle(boardCopy);
  if (result) {
    const { newBoard, specs } = result;
    return solve(newBoard, [...steps, { type: 'er', points: 3000, ...specs }]);
  }

  result = checkXYwing(boardCopy);
  if (result) {
    const { newBoard, specs } = result;
    return solve(newBoard, [...steps, { type: 'xyw', points: 3200, ...specs }]);
  }

  result = checkXYZwing(boardCopy);
  if (result) {
    const { newBoard, specs } = result;
    return solve(newBoard, [...steps, { type: 'xyz', points: 3400, ...specs }]);
  }

  result = checkWwing(boardCopy);
  if (result) {
    const { newBoard, specs } = result;
    return solve(newBoard, [...steps, { type: 'ww', points: 3600, ...specs }]);
  }

  result = checkNakedSubsets(boardCopy, 4);
  if (result) {
    const { newBoard, specs } = result;
    return solve(newBoard, [...steps, { type: 'nq', points: 4000, ...specs }]);
  }

  result = checkHiddenSubsets(boardCopy, 4);
  if (result) {
    const { newBoard, specs } = result;
    return solve(newBoard, [...steps, { type: 'hq', points: 4500, ...specs }]);
  }

  result = checkFishes(boardCopy, 3, false);
  if (result) {
    const { newBoard, specs } = result;
    return solve(newBoard, [...steps, { type: 'sf', points: 5000, ...specs }]);
  }

  result = checkFishes(boardCopy, 4, false);
  if (result) {
    const { newBoard, specs } = result;
    return solve(newBoard, [...steps, { type: 'jf', points: 8000, ...specs }]);
  }

  result = checkFishes(boardCopy, 3, true);
  if (result) {
    const { newBoard, specs } = result;
    return solve(newBoard, [...steps, { type: 'fsf', points: 10000, ...specs }]);
  }

  result = checkFishes(boardCopy, 4, true);
  if (result) {
    const { newBoard, specs } = result;
    return solve(newBoard, [...steps, { type: 'fjf', points: 11000, ...specs }]);
  }

  return { board: boardCopy, steps };
};

/**
 * Left to develop
 * - Uniqueness
 * - Frankenfish
 * - Sue de Coq
 * - advanced chains
 * - advanced loops
 * - Almost Locked Sets (ALS)
 * - Bifurcation
 */

// const getUniqueRectangleCandidate = (board: CellT[]): string[] | false => {
//   const { rows, columns } = getRowsBoxesColumns(board);

//   for (let x = 0; x < 9; x += 1) {
//     // rows
//     let candidates = rows[x].filter((cell) => cell.cornerPencil.length === 2);
//     if (candidates.length >= 2) {
//       //
//       for (let a = 0; a < 9; a += 1) {
//         for (let b = a + 1; b < 9; b += 1) {
//           const combinedNums = [...candidates[a].cornerPencil, ...candidates[b].cornerPencil]
//             .sort()
//             .filter((num, pos, arr) => !pos || num !== arr[pos - 1]);
//           if (combinedNums.length === 2) {
//             const pairColumns = [candidates[a].id[0], candidates[b].id[0]];
//             for (let y = x + 1; y < 9; y += 1) {
//               const matchingCells = rows[y].filter((cell) => pairColumns.includes(cell.id[0]));
//               for (let c = 0; c < matchingCells.length; c += 1) {
//                 if (matchingCells[c].cornerPencil.includes(combinedNums[0]) && matchingCells[c].cornerPencil.includes(combinedNums[1])) {
//                   // It's a uniquerectangle candidate
//                   return [candidates[a].id, candidates[b].id, matchingCells[0].id, matchingCells[1].id];
//                 }
//               }
//             }
//           }
//         }
//       }
//     }
//     // Columns
//     candidates = columns[x].filter((cell) => cell.cornerPencil.length === 2);
//     if (candidates.length >= 2) {
//       for (let a = 0; a < 9; a += 1) {
//         for (let b = a + 1; b < 9; b += 1) {
//           const combinedNums = [...candidates[a].cornerPencil, ...candidates[b].cornerPencil]
//             .sort()
//             .filter((num, pos, arr) => !pos || num !== arr[pos - 1]);
//           if (combinedNums.length === 2) {
//             const pairRows = [candidates[a].id[1], candidates[b].id[1]];
//             for (let y = x + 1; y < 9; y += 1) {
//               const matchingCells = columns[y].filter((cell) => pairRows.includes(cell.id[1]));
//               for (let c = 0; c < matchingCells.length; c += 1) {
//                 if (matchingCells[c].cornerPencil.includes(combinedNums[0]) && matchingCells[c].cornerPencil.includes(combinedNums[1])) {
//                   // It's a uniquerectangle candidate
//                   return [candidates[a].id, candidates[b].id, matchingCells[0].id, matchingCells[1].id];
//                 }
//               }
//             }
//           }
//         }
//       }
//     }
//   }

//   return false;
// }
