import {
  BoardT, CellT, Mode, TStep,
} from './types';

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

export const findRestrictedCells = (targetCells: string[]): string[] => {
  let restrictedCells: string[] = [];
  const counts: Record<string, number> = {};
  let restrictedDuplicates: string[] = [];

  // Finds all restricted cells for each targetCell
  targetCells.forEach((cellId) => {
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
    else if (column === 'G' || column === 'H' || column === 'I') boxColumns = ['G', 'H', 'I'];

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

    restrictedCells = [...restrictedCells, ...cells];
  });

  // Removes the target cells from restricted cells
  restrictedCells = restrictedCells.filter((cell) => !targetCells.includes(cell));

  // Counts the occurance of each restricted cell
  restrictedCells.forEach((cell) => {
    counts[cell] = counts[cell] ? counts[cell] + 1 : 1;
  });

  // Extracts the cells that are restricted by all target cells
  restrictedCells.forEach((cell) => {
    if (!counts[cell]) return;
    if (counts[cell] === targetCells.length && !restrictedDuplicates.includes(cell)) {
      restrictedDuplicates = [...restrictedDuplicates, cell];
    }
  });

  return restrictedDuplicates;
};

export const isPussleSolved = (board: string[]): boolean => {
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
          row = [...row, board[(y * 3 + z) + ((i * 3 + x) * 9)]];
          column = [...column, board[(i * 3 + x) + ((y * 3 + z) * 9)]];
          box = [...box, board[i * 27 + x * 3 + y * 9 + z]];
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

const cellHasError = (board: CellT[], cellId: string): boolean => {
  const number = board.find((cell) => cell.id === cellId)?.bigNum;
  if (!number) return false;

  const restrictedCells = findRestrictedCells([cellId]);
  for (let i = 0; i < restrictedCells.length; i += 1) {
    const cellNum = board.find((cell) => cell.id === restrictedCells[i])?.bigNum;
    if (cellNum === number) return true;
  }

  return false;
};

export const updateErrors = (board: CellT[]): CellT[] => board.map((cell) => {
  if (!cellHasError(board, cell.id)) return { ...cell, error: false };
  return { ...cell, error: true };
});

export const updateBoard = (
  state: CellT[],
  cellId: string,
  number: string,
  mode: Mode | 'delete' | 'restart',
  removePencils?: boolean,
  markErrors?: boolean,
): CellT[] => {
  let targetCell = state.find((el) => el.id === cellId);
  let restrictedCells: string[];

  if (targetCell?.locked) return state;
  if (!isValidNumber(number)) return state;

  let filteredBoard = state.filter((el) => el.id !== cellId);

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
          cornerPencil: [...targetCell!.cornerPencil, number].sort(),
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
          centerPencil: [...targetCell!.centerPencil, number].sort(),
        };
      }
      return [...filteredBoard, targetCell];

    case 'normal':
      restrictedCells = findRestrictedCells([cellId]);
      if (removePencils) {
        filteredBoard = filteredBoard.map((cell) => {
          if (cell.locked || cell.bigNum || !restrictedCells.includes(cell.id)) return cell;
          const newCenter = cell.centerPencil.filter((num) => num !== number);
          const newCorner = cell.cornerPencil.filter((num) => num !== number);
          return { ...cell, cornerPencil: newCorner, centerPencil: newCenter };
        });
      }

      targetCell = { ...targetCell!, bigNum: number, cornerPencil: [] };
      if (markErrors) filteredBoard = updateErrors([...filteredBoard, targetCell]);
      else return [...filteredBoard, targetCell];

      return filteredBoard;

    case 'color':
      targetCell = { ...targetCell!, color: number };
      return [...filteredBoard, targetCell];

    case 'delete':
      if (targetCell?.locked) return state;
      targetCell = {
        ...targetCell!, bigNum: '', cornerPencil: [], centerPencil: [], error: false,
      };
      if (markErrors) filteredBoard = updateErrors(filteredBoard);
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

export const formatTimer = (secs: number): string => {
  let remainingSecs = secs;

  const h = Math.floor(remainingSecs / 3600);
  remainingSecs %= 3600;
  const m = Math.floor(remainingSecs / 60);
  remainingSecs %= 60;

  let formattedString = remainingSecs < 10 ? `0${remainingSecs}` : remainingSecs.toString();
  formattedString = m < 10 ? `0${m}:${formattedString}` : `${m.toString()}:${formattedString}`;
  formattedString = `${h}:${formattedString}`;

  return formattedString;
};

export const mapStepsToHistory = (steps: TStep[], board: CellT[], history: BoardT[] = [], historyLength: number): BoardT[] | false => {
  const {
    type, affectedCells, affectedNumbers, fins, sourceCells, sashimi, set,
  } = steps[0];
  if (!steps.length) return history;
  let newBoard = [...board];
  let newHistory = [...history];
  let newSteps = [...steps];
  let somethingChanged = false;

  switch (type) {
    // Full house
    case 'fh':
      newBoard = newBoard.map((cell) => {
        if (!affectedCells.includes(cell.id)) return { ...cell, color: '1', bigNum: affectedCells[0] };
        return { ...cell, color: '4' };
      });
      newHistory = [
        ...newHistory,
        {
          id: historyLength,
          board: newBoard,
          title: 'Full House',
          description: `In ${set!} there is only ${affectedNumbers[0]} left to place`,
        },
      ];
      newSteps = newSteps.filter((_el, i) => !i);
      return mapStepsToHistory(newSteps, newBoard, newHistory, historyLength + 1);

    // Hidden single
    case 'hs':
      newBoard = newBoard.map((cell) => {
        if (!affectedCells.includes(cell.id)) return { ...cell, color: '1', bigNum: affectedCells[0] };
        return { ...cell, color: '4' };
      });
      newHistory = [
        ...newHistory,
        {
          id: historyLength,
          board: newBoard,
          title: 'Hidden Single',
          description: `Cell: ${affectedCells[0]} is the only place where ${affectedNumbers[0]} can be place in ${set!}`,
        },
      ];
      newSteps = newSteps.filter((_el, i) => !i);
      return mapStepsToHistory(newSteps, newBoard, newHistory, historyLength + 1);

    // Naked Single
    case 'ns':
      newBoard = newBoard.map((cell) => {
        if (!affectedCells.includes(cell.id)) return { ...cell, color: '1', bigNum: affectedCells[0] };
        return { ...cell, color: '4' };
      });
      newHistory = [
        ...newHistory,
        {
          id: historyLength,
          board: newBoard,
          title: 'Naked Single',
          description: `Cell: ${affectedCells[0]} is very restricted, all candidates but ${affectedNumbers[0]} are eliminated`,
        },
      ];
      newSteps = newSteps.filter((_el, i) => !i);
      return mapStepsToHistory(newSteps, newBoard, newHistory, historyLength + 1);

    // Locked Candidates (Pointing)
    case 'lcp':
      newBoard = newBoard.map((cell) => {
        if (!affectedCells.includes(cell.id)) return { ...cell, color: '1' };
        if (cell.cornerPencil.includes(affectedNumbers[0])) return { ...cell, color: '1' };
        somethingChanged = true;
        return { ...cell, color: '4', cornerPencil: [...cell.cornerPencil, affectedNumbers[0]] };
      });
      if (somethingChanged) {
        newHistory = [
          ...newHistory,
          {
            id: historyLength,
            board: newBoard,
            title: 'Locked candidates (Pointing)',
            description: `In ${set!}.
          ${affectedNumbers[0]} can only be placed into either 1 row or column.
          ${affectedNumbers[0]} can therefore not appear anywhere else in the row or column`,
          },
        ];
      }
      newSteps = newSteps.filter((_el, i) => !i);
      return mapStepsToHistory(newSteps, newBoard, newHistory, historyLength + 1);

    // Locked Candidates (Claiming)
    case 'lcc':
      newBoard = newBoard.map((cell) => {
        if (!affectedCells.includes(cell.id)) return { ...cell, color: '1' };
        if (cell.cornerPencil.includes(affectedNumbers[0])) return { ...cell, color: '1' };
        somethingChanged = true;
        return { ...cell, color: '4', cornerPencil: [...cell.cornerPencil, affectedNumbers[0]] };
      });
      if (somethingChanged) {
        newHistory = [
          ...newHistory,
          {
            id: historyLength,
            board: newBoard,
            title: 'Locked candidates (Claiming)',
            description: `In ${set!}, the number ${affectedNumbers[0]} are locked into the same box.
              All other candidates for that can box therefore be eliminated`,
          },
        ];
      }
      newSteps = newSteps.filter((_el, i) => !i);
      return mapStepsToHistory(newSteps, newBoard, newHistory, historyLength + 1);

    // Hidden pair
    case 'hp':
      newBoard = newBoard.map((cell) => {
        if (!affectedCells.includes(cell.id)) return { ...cell, color: '1' };
        if (cell.centerPencil.sort().join('') === affectedNumbers.sort().join('')) {
          return { ...cell, color: '1' };
        }
        somethingChanged = true;
        return { ...cell, color: '4', centerPencil: affectedNumbers };
      });
      if (somethingChanged) {
        newHistory = [
          ...newHistory,
          {
            id: historyLength,
            board: newBoard,
            title: 'Hidden Pair',
            description: `In ${set!} the numbers: ${affectedNumbers[0]} and ${affectedNumbers[1]},
            are locked into cells: ${affectedCells[0]} and ${affectedCells[1]}.
            No other candidates can therefore be placed into these cells`,
          },
        ];
      }
      newSteps = newSteps.filter((_el, i) => !i);
      return mapStepsToHistory(newSteps, newBoard, newHistory, historyLength + 1);

    // Naked pair
    case 'np':
      newBoard = newBoard.map((cell) => {
        if (!affectedCells.includes(cell.id) && !sourceCells?.includes(cell.id)) return { ...cell, color: '1' };
        if (cell.centerPencil.sort().join('') === affectedNumbers.sort().join('')) {
          return { ...cell, color: '1' };
        }
        somethingChanged = true;
        return { ...cell, color: '4', centerPencil: affectedNumbers };
      });
      if (somethingChanged) {
        newHistory = [
          ...newHistory,
          {
            id: historyLength,
            board: newBoard,
            title: 'Naked Pair',
            description: `In ${set!} the cells: ${affectedCells[0]} and ${affectedCells[1]},
            are locked to the same 2 candidates: ${affectedNumbers[0]} and ${affectedNumbers[1]}.
            These 2 numbers can therefore not appear in any other cell in ${set!}.`,
          },
        ];
      }
      newSteps = newSteps.filter((_el, i) => !i);
      return mapStepsToHistory(newSteps, newBoard, newHistory, historyLength + 1);

    // Hidden triple
    case 'ht':
      newBoard = newBoard.map((cell) => {
        if (!affectedCells.includes(cell.id)) return { ...cell, color: '1' };
        if (cell.centerPencil.sort().join('') === affectedNumbers.sort().join('')) {
          return { ...cell, color: '1' };
        }
        somethingChanged = true;
        return { ...cell, color: '4', centerPencil: affectedNumbers };
      });
      if (somethingChanged) {
        newHistory = [
          ...newHistory,
          {
            id: historyLength,
            board: newBoard,
            title: 'Hidden Triple',
            description: `In ${set!} the numbers ${affectedNumbers[0]}, ${affectedNumbers[1]} and ${affectedNumbers[2]},
            are locked into the same 3 cells: ${affectedCells[0]}, ${affectedCells[1]} and ${affectedCells[2]}.
            These 3 cells can therefore nott contain any other candidates`,
          },
        ];
      }

      newSteps = newSteps.filter((_el, i) => !i);
      return mapStepsToHistory(newSteps, newBoard, newHistory, historyLength + 1);

    // Naked triple
    case 'nt':
      newBoard = newBoard.map((cell) => {
        if (!affectedCells.includes(cell.id) && !sourceCells?.includes(cell.id)) return { ...cell, color: '1' };
        if (cell.centerPencil.sort().join('') === affectedNumbers.sort().join('')) {
          return { ...cell, color: '1' };
        }
        somethingChanged = true;
        return { ...cell, color: '4', centerPencil: affectedNumbers };
      });
      if (somethingChanged) {
        newHistory = [
          ...newHistory,
          {
            id: historyLength,
            board: newBoard,
            title: 'Naked Triple',
            description: `In ${set!} the cells ${sourceCells![0]}, ${sourceCells![1]} and ${sourceCells![2]},
            are locked to the same 3 candidates: ${affectedNumbers[0]}, ${affectedNumbers[1]} and ${affectedNumbers[2]}.
            No other cells in ${set!} can therefore contain these 3 numbers`,
          },
        ];
      }

      newSteps = newSteps.filter((_el, i) => !i);
      return mapStepsToHistory(newSteps, newBoard, newHistory, historyLength + 1);

    // X-Wing
    case 'xw':
      newBoard = newBoard.map((cell) => {
        if (!affectedCells.includes(cell.id) && !sourceCells?.includes(cell.id)) return { ...cell, color: '1' };

        if (affectedCells.includes(cell.id)) {
          if (cell.cornerPencil.includes(affectedNumbers[0])) {
            somethingChanged = true;
            return { ...cell, color: '2', cornerPencil: cell.cornerPencil.filter((el) => el !== affectedNumbers[0]) };
          }
        }
        if (sourceCells?.includes(cell.id)) {
          if (!cell.cornerPencil.includes(affectedNumbers[0])) {
            somethingChanged = true;
            return { ...cell, color: '4', cornerPencil: [...cell.cornerPencil, affectedNumbers[0]] };
          }
          return { ...cell, color: '4' };
        }

        return { ...cell, color: '1' };
      });

      if (somethingChanged) {
        newHistory = [
          ...newHistory,
          {
            id: historyLength,
            board: newBoard,
            title: 'X-Wing',
            description: `In ${set!} the number ${affectedNumbers[0]} is locked into the same 2 rows/columns.
            We can therefore eliminate the number ${affectedNumbers[0]} from any cells seen by the X-Wing`,
          },
        ];
      }

      newSteps = newSteps.filter((_el, i) => !i);
      return mapStepsToHistory(newSteps, newBoard, newHistory, historyLength + 1);

    // Skyscraper
    case 'ssc':
      newBoard = newBoard.map((cell) => {
        if (!affectedCells.includes(cell.id) && !sourceCells?.includes(cell.id) && !fins?.includes(cell.id)) {
          return { ...cell, color: '1' };
        }

        if (affectedCells.includes(cell.id)) {
          if (cell.cornerPencil.includes(affectedNumbers[0])) {
            somethingChanged = true;
            return { ...cell, color: '2', cornerPencil: cell.cornerPencil.filter((el) => el !== affectedNumbers[0]) };
          }
        } else if (sourceCells?.includes(cell.id)) {
          if (!cell.cornerPencil.includes(affectedNumbers[0])) {
            somethingChanged = true;
            return { ...cell, color: '4', cornerPencil: [...cell.cornerPencil, affectedNumbers[0]] };
          }
          return { ...cell, color: '4' };
        } else if (fins?.includes(cell.id)) {
          if (!cell.cornerPencil.includes(affectedNumbers[0])) {
            somethingChanged = true;
            return { ...cell, color: '5', cornerPencil: [...cell.cornerPencil, affectedNumbers[0]] };
          }
          return { ...cell, color: '5' };
        }

        return { ...cell, color: '1' };
      });

      if (somethingChanged) {
        newHistory = [
          ...newHistory,
          {
            id: historyLength,
            board: newBoard,
            title: 'Skyscraper / Sashimi X-Wing',
            description: `In ${set!} the number ${affectedNumbers[0]} is locked into the same 2 rows/columns.
            We can therefore eliminate the number ${affectedNumbers[0]} from any cells seen by the X-Wing`,
          },
        ];
      }

      newSteps = newSteps.filter((_el, i) => !i);
      return mapStepsToHistory(newSteps, newBoard, newHistory, historyLength + 1);

    // Finned X-Wing
    case 'fxw':
      newBoard = newBoard.map((cell) => {
        if (!sourceCells?.includes(cell.id) && !affectedCells.includes(cell.id) && !fins?.includes(cell.id)) {
          return { ...cell, color: '1' };
        }

        if (sourceCells?.includes(cell.id)) {
          if (!cell.cornerPencil.includes(affectedNumbers[0])) {
            return { ...cell, color: '4', cornerPencil: [...cell.cornerPencil, affectedNumbers[0]] };
          }
          return { ...cell, color: '4' };
        }

        if (fins?.includes(cell.id)) {
          if (!cell.cornerPencil.includes(affectedNumbers[0])) {
            return { ...cell, color: '5', cornerPencil: [...cell.cornerPencil, affectedNumbers[0]] };
          }
          return { ...cell, color: '5' };
        }

        if (affectedCells.includes(cell.id)) {
          if (cell.cornerPencil.includes(affectedNumbers[0])) {
            return { ...cell, color: '2', cornerPencil: cell.cornerPencil.filter((num) => num !== affectedNumbers[0]) };
          }
          return { ...cell, color: '2' };
        }

        return { ...cell, color: '1' };
      });

      if (somethingChanged) {
        newHistory = [
          ...newHistory,
          {
            id: historyLength,
            board: newBoard,
            title: 'Finned X-Wing',
            description: `this is a finned X-Wing on number: ${affectedNumbers[0]}.
            green cells are the base of the X-Wing and blue cells are fins.
            any cell that sees the X-Wing and the fin can have ${affectedNumbers[0]} eliminated from them.`,
          },
        ];
      }

      newSteps = newSteps.filter((_el, i) => !i);
      return mapStepsToHistory(newSteps, newBoard, newHistory, historyLength + 1);

    // Empty Rectangle
    case 'er':
      newBoard = newBoard.map((cell) => {
        if (!sourceCells?.includes(cell.id) && !fins?.includes(cell.id) && !affectedCells.includes(cell.id)) {
          return { ...cell, color: '1' };
        }

        if (sourceCells?.includes(cell.id)) {
          if (!cell.cornerPencil.includes(affectedNumbers[0])) {
            return { ...cell, color: '4', cornerPencil: [...cell.cornerPencil, affectedNumbers[0]] };
          }
          return { ...cell, color: '4' };
        }

        if (fins?.includes(cell.id)) {
          if (!cell.cornerPencil.includes(affectedNumbers[0])) {
            return { ...cell, color: '5', cornerPencil: [...cell.cornerPencil, affectedNumbers[0]] };
          }
          return { ...cell, color: '5' };
        }

        if (affectedCells.includes(cell.id)) {
          return {
            ...cell,
            color: '2',
            cornerPencil: cell.cornerPencil.filter((num) => num !== affectedNumbers[0]),
            centerPencil: cell.centerPencil.filter((num) => num !== affectedNumbers[0]),
          };
        }

        return { ...cell, color: '1' };
      });

      newSteps = newSteps.filter((_el, i) => !i);
      return mapStepsToHistory(newSteps, newBoard, newHistory, historyLength + 1);

    default:
      return false;
  }
};
