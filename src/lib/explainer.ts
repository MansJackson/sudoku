import { TStep, CellT, BoardT } from './types';

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
