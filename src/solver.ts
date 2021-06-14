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

const checkPairs = (set: [string, string[]][], board: CellT[]): CellT[] | false => {
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
        const restrictedCells = findRestrictedCells(cells);
        let somethingChanged = false;
        const newBoard = board.map((cell) => {
          // if the pair contains pencilmarks for other numbers -> remove them
          if (cells.includes(cell.id) && cell.cornerPencil.length > 2) {
            somethingChanged = true;
            return { ...cell, cornerPencil: cell.cornerPencil.filter((num) => nums.includes(num)) };
          }
          if (cell.bigNum || !restrictedCells.includes(cell.id)) return cell;
          if (!cell.cornerPencil.includes(set[a][0]) || !cell.cornerPencil.includes(set[b][0])) return cell;
          somethingChanged = true;

          return {
            ...cell,
            cornerPencil: cell.cornerPencil.filter((num) => (
              num !== set[a][0]
              && num !== set[b][0]
            )),
          };
        });

        if (somethingChanged) return newBoard;
      }
    }
  }

  return false;
};

const checkTriples = (set: [string, string[]][], board: CellT[]): CellT[] | false => {
  if (!set.length) return false;
  let nums: string[] = [];
  let cells: string[] = [];

  for (let a = 0; a < set.length; a += 1) {
    for (let b = a + 1; b < set.length; b += 1) {
      for (let c = b + 1; c < set.length; c += 1) {
        // The numbers we are looking for
        nums = [set[a][0], set[b][0], set[c][0]];
        // All the cells theese number can go into in this set
        cells = [...set[a][1], ...set[b][1], ...set[c][1]].sort().filter((el, pos, arr) => pos === 0 || el !== arr[pos - 1]);

        // if they can only go into 3 cells it is a triple
        if (cells.length === 3) {
          const restrictedCells = findRestrictedCells(cells);
          let somethingChanged = false;
          const newBoard = board.map((cell) => {
            // if the triple contains pencilmarks for other numbers -> remove them
            if (cells.includes(cell.id) && cell.cornerPencil.length > 3) {
              somethingChanged = true;
              return { ...cell, cornerPencil: cell.cornerPencil.filter((num) => nums.includes(num)) };
            }
            if (cell.bigNum || !restrictedCells.includes(cell.id)) return cell;
            if (
              !cell.cornerPencil.includes(set[a][0])
              || !cell.cornerPencil.includes(set[b][0])
              || !cell.cornerPencil.includes(set[c][0])
            ) return cell;
            somethingChanged = true;

            return {
              ...cell,
              cornerPencil: cell.cornerPencil.filter((num) => (
                num !== set[a][0]
                && num !== set[b][0]
                && num !== set[c][0]
              )),
            };
          });

          if (somethingChanged) return newBoard;
        }
      }
    }
  }

  return false;
};

const checkQuads = (set: [string, string[]][], board: CellT[]): CellT[] | false => {
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
            const restrictedCells = findRestrictedCells(cells);
            let somethingChanged = false;
            const newBoard = board.map((cell) => {
              // if the quad contains pencilmarks for other numbers -> remove them
              if (cells.includes(cell.id) && cell.cornerPencil.length > 4) {
                somethingChanged = true;
                return { ...cell, cornerPencil: cell.cornerPencil.filter((num) => nums.includes(num)) };
              }
              if (cell.bigNum || !restrictedCells.includes(cell.id)) return cell;
              if (
                !cell.cornerPencil.includes(set[a][0])
                || !cell.cornerPencil.includes(set[b][0])
                || !cell.cornerPencil.includes(set[c][0])
                || !cell.cornerPencil.includes(set[d][0])
              ) return cell;
              somethingChanged = true;

              return {
                ...cell,
                cornerPencil: cell.cornerPencil.filter((num) => (
                  num !== set[a][0]
                  && num !== set[b][0]
                  && num !== set[c][0]
                  && num !== set[d][0]
                )),
              };
            });

            if (somethingChanged) return newBoard;
          }
        }
      }
    }
  }

  return false;
};

const checkXWing = (board: CellT[], sets: [string, string[]][], finned: boolean): CellT[] | false => {
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
                fins = cells.filter((el) => !restrictedRows.includes(el[1]));
                restrictedCells = findRestrictedCells(fins).filter((el) => restrictedRows.includes(el[1]));
              }
              // Sashimi/skyscraper
              if (rowDuplicates.length === 1) {
                fins = cells.filter((el) => el[1] !== rowDuplicates[0][1]);
                restrictedCells = findRestrictedCells(fins);
              }
              if (restrictedCells) {
                let somethingChanged = false;
                const newBoard = board.map((cell) => {
                  if (cell.bigNum || !restrictedCells.includes(cell.id) || cells.includes(cell.id)) return cell;
                  if (!cell.cornerPencil.includes(String(n))) return cell;
                  somethingChanged = true;
                  return { ...cell, cornerPencil: cell.cornerPencil.filter((num) => num !== String(n)) };
                });
                if (somethingChanged) {
                  console.log(`x_wing in columns on number: ${n}, Cells are:`, cells);
                  return newBoard;
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
                fins = cells.filter((el) => !restrictedCols.includes(el[0]));
                restrictedCells = findRestrictedCells(fins).filter((el) => restrictedCols.includes(el[0]));
              }
              // Sashimi
              if (colDuplicates.length === 1) {
                fins = cells.filter((el) => el[0] !== colDuplicates[0][0]);
                restrictedCells = findRestrictedCells(fins);
              }
              if (restrictedCells) {
                let somethingChanged = false;
                const newBoard = board.map((cell) => {
                  if (cell.bigNum || !restrictedCells.includes(cell.id) || cells.includes(cell.id)) return cell;
                  if (!cell.cornerPencil.includes(String(n))) return cell;
                  somethingChanged = true;
                  return { ...cell, cornerPencil: cell.cornerPencil.filter((num) => num !== String(n)) };
                });
                if (somethingChanged) {
                  console.log(`X-Wing in rows on number: ${n}, Cells are:`, cells);
                  return newBoard;
                }
              }
            }
            // Not looking for finned X-Wings
          } else {
            let somethingChanged = false;

            if (uniqCols.length === 2) {
              const newBoard = board.map((cell) => {
                if (cell.bigNum || targetCells.includes(cell.id)) return cell;
                if (!uniqCols.includes(cell.id[0])) return cell;
                if (!cell.cornerPencil.includes(String(n))) return cell;
                somethingChanged = true;
                return { ...cell, cornerPencil: cell.cornerPencil.filter((num) => num !== String(n)) };
              });
              if (somethingChanged) return newBoard;
            }

            if (uniqRows.length === 2) {
              const newBoard = board.map((cell) => {
                if (cell.bigNum || targetCells.includes(cell.id)) return cell;
                if (!uniqRows.includes(cell.id[1])) return cell;
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
  }

  return false;
};

const checkSwordFish = (board: CellT[], sets: [string, string[]][], finned: boolean): CellT[] | false => {
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
                  fins = cells.filter((el) => el[1] !== rowDuplicates[0][1] && el[1] !== rowDuplicates[1][1]);
                  rowDuplicatesCols = cells.filter((el) => !fins.includes(el)).map((el) => el[0]);
                  for (let i = 0; i < fins.length; i += 1) {
                    if (!rowDuplicatesCols.includes(fins[i][0])) validSashimi = false;
                  }
                  if (validSashimi) restrictedCells = findRestrictedCells(fins);
                }
                if (restrictedCells) {
                  let somethingChanged = false;
                  const newBoard = board.map((cell) => {
                    if (cell.bigNum || !restrictedCells.includes(cell.id) || cells.includes(cell.id)) return cell;
                    if (!cell.cornerPencil.includes(String(n))) return cell;
                    somethingChanged = true;
                    return { ...cell, cornerPencil: cell.cornerPencil.filter((num) => num !== String(n)) };
                  });
                  if (somethingChanged) {
                    console.log(`sword fish in columns on number: ${n}, Cells are:`, cells);
                    return newBoard;
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
                  fins = cells.filter((el) => el[0] !== colDuplicates[0][0] && el[0] !== colDuplicates[1][0]);
                  colDuplicatesRows = cells.filter((el) => !fins.includes(el)).map((el) => el[1]);
                  for (let i = 0; i < fins.length; i += 1) {
                    if (!colDuplicatesRows.includes(fins[i][1])) validSashimi = false;
                  }
                  if (validSashimi) restrictedCells = findRestrictedCells(fins);
                }
                if (restrictedCells) {
                  let somethingChanged = false;
                  const newBoard = board.map((cell) => {
                    if (cell.bigNum || !restrictedCells.includes(cell.id) || cells.includes(cell.id)) return cell;
                    if (!cell.cornerPencil.includes(String(n))) return cell;
                    somethingChanged = true;
                    return { ...cell, cornerPencil: cell.cornerPencil.filter((num) => num !== String(n)) };
                  });
                  if (somethingChanged) {
                    console.log(`sword fish in rows on number: ${n}, Cells are:`, cells);
                    return newBoard;
                  }
                }
              }
              // Not looking for finned SwordFishs
            } else {
              let somethingChanged = false;
              if (uniqCols.length === 3) {
                const newBoard = board.map((cell) => {
                  if (cell.bigNum || targetCells.includes(cell.id)) return cell;
                  if (!uniqCols.includes(cell.id[0])) return cell;
                  if (!cell.cornerPencil.includes(String(n))) return cell;
                  somethingChanged = true;
                  return { ...cell, cornerPencil: cell.cornerPencil.filter((num) => num !== String(n)) };
                });
                if (somethingChanged) return newBoard;
              }

              if (uniqRows.length === 3) {
                const newBoard = board.map((cell) => {
                  if (cell.bigNum || targetCells.includes(cell.id)) return cell;
                  if (!uniqRows.includes(cell.id[1])) return cell;
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
    }
  }

  return false;
};

const checkJellyFish = (board: CellT[], sets: [string, string[]][], finned: boolean): CellT[] | false => {
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
                    const newBoard = board.map((cell) => {
                      if (cell.bigNum || !restrictedCells.includes(cell.id) || cells.includes(cell.id)) return cell;
                      if (!cell.cornerPencil.includes(String(n))) return cell;
                      somethingChanged = true;
                      return { ...cell, cornerPencil: cell.cornerPencil.filter((num) => num !== String(n)) };
                    });
                    if (somethingChanged) {
                      console.log(`jelly fish in columns on number: ${n}, Cells are:`, cells);
                      return newBoard;
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
                    const newBoard = board.map((cell) => {
                      if (cell.bigNum || !restrictedCells.includes(cell.id) || cells.includes(cell.id)) return cell;
                      if (!cell.cornerPencil.includes(String(n))) return cell;
                      somethingChanged = true;
                      return { ...cell, cornerPencil: cell.cornerPencil.filter((num) => num !== String(n)) };
                    });
                    if (somethingChanged) {
                      console.log(`jelly fish in rows on number: ${n}, Cells are:`, cells);
                      return newBoard;
                    }
                  }
                }
                // Not looking for finned SwordFishs
              } else {
                let somethingChanged = false;

                if (uniqCols.length === 4) {
                  const newBoard = board.map((cell) => {
                    if (cell.bigNum || targetCells.includes(cell.id)) return cell;
                    if (!uniqCols.includes(cell.id[0])) return cell;
                    if (!cell.cornerPencil.includes(String(n))) return cell;
                    somethingChanged = true;
                    return { ...cell, cornerPencil: cell.cornerPencil.filter((num) => num !== String(n)) };
                  });
                  if (somethingChanged) return newBoard;
                }

                if (uniqRows.length === 4) {
                  const newBoard = board.map((cell) => {
                    if (cell.bigNum || targetCells.includes(cell.id)) return cell;
                    if (!uniqRows.includes(cell.id[1])) return cell;
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
      }
    }
  }

  return false;
};

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

// Fill all possibilities
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

// Locked Candidates (Pointing)
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

// Locked Candidates (Claiming)
export const checkLockedCandidatesClaiming = (board: CellT[]): CellT[] | false => {
  const filledBoard = fillPossibleNums(board);
  const { boxes, rows, columns } = getRowsBoxesColumns(filledBoard);

  // Loop through each row and column
  for (let x = 0; x < 9; x += 1) {
    // Loop through each number from 1-9
    for (let i = 1; i <= 9; i += 1) {
      let rowOccurrences = 0;
      let rowCellIds: string[] = [];
      let columnOccurrences = 0;
      let columnCellIds: string[] = [];

      // Loop through each cell in row and column
      for (let y = 0; y < 9; y += 1) {
        // If the cell in this row can contain 'i'
        if (!rows[x][y].bigNum && rows[x][y].cornerPencil.includes(i.toString())) {
          rowOccurrences += 1;
          rowCellIds = [...rowCellIds, rows[x][y].id];
        }
        // If the cell in this column can contain 'i'
        if (!columns[x][y].bigNum && columns[x][y].cornerPencil.includes(i.toString())) {
          columnOccurrences += 1;
          columnCellIds = [...columnCellIds, columns[x][y].id];
        }
      }

      // If occurrences is 2 or 3 in row
      if (rowOccurrences === 2 || rowOccurrences === 3) {
        // find the box index for each cell in rowCellIds
        const boxIndexes = rowCellIds.map((cellId) => boxes.findIndex((box) => box.find((cell) => cell.id === cellId)));
        let isSameBox = true;
        let somethingChanged = false;
        let c = 1;

        // Check if all boxIndexes are the same
        while (isSameBox && c < boxIndexes.length) {
          if (boxIndexes[c] !== boxIndexes[c - 1]) isSameBox = false;
          c += 1;
        }

        // If all booxIndexes are the same
        if (isSameBox) {
          const affectedCells = findRestrictedCells(rowCellIds);
          const newBoard = board.map((cell) => {
            if (!affectedCells.includes(cell.id)) return cell;
            if (!cell.cornerPencil.includes(i.toString())) return cell;
            somethingChanged = true;
            return { ...cell, cornerPencil: cell.cornerPencil.filter((num) => num !== i.toString()) };
          });
          if (somethingChanged) return newBoard;
        }
      }

      // If occurrences is 2 or 3 in column
      if (columnOccurrences === 2 || columnOccurrences === 3) {
        // find the box index for each cell in rowCellIds
        const boxIndexes = columnCellIds.map((cellId) => boxes.findIndex((box) => box.find((cell) => cell.id === cellId)));
        let isSameBox = true;
        let somethingChanged = false;
        let c = 1;

        // Check if all boxIndexes are the same
        while (isSameBox && c < boxIndexes.length) {
          if (boxIndexes[c] !== boxIndexes[c - 1]) isSameBox = false;
          c += 1;
        }

        // If all booxIndexes are the same
        if (isSameBox) {
          const affectedCells = findRestrictedCells(columnCellIds);
          const newBoard = board.map((cell) => {
            if (!affectedCells.includes(cell.id)) return cell;
            if (!cell.cornerPencil.includes(i.toString())) return cell;
            somethingChanged = true;
            return { ...cell, cornerPencil: cell.cornerPencil.filter((num) => num !== i.toString()) };
          });
          if (somethingChanged) return newBoard;
        }
      }
    }
  }

  return false;
};

// Subsets "Look into recursion"
export const checkSubsets = (board: CellT[], amount: number): CellT[] | false => {
  const filledBoard = fillPossibleNums(board);

  // Loop through each box row and column
  for (let x = 0; x < 9; x += 1) {
    const [boxEnum, rowEnum, columnEnum] = enumSets(filledBoard, x);

    // convert enumerated objects to arrays and filter out results with to many hits
    let asArray = Object.entries(boxEnum);
    const filteredBoxEnum = asArray.filter((el) => el[1].length <= amount);
    asArray = Object.entries(rowEnum);
    const filteredRowEnum = asArray.filter((el) => el[1].length <= amount);
    asArray = Object.entries(columnEnum);
    const filteredColumnEnum = asArray.filter((el) => el[1].length <= amount);
    const filteredEnums = [filteredBoxEnum, filteredRowEnum, filteredColumnEnum];

    let result: CellT[] | false;
    // If we are looking for pairs
    for (let c = 0; c < filteredEnums.length; c += 1) {
      switch (amount) {
        case 2:
          result = checkPairs(filteredEnums[c], board);
          if (result) return result;
          break;
        case 3:
          result = checkTriples(filteredEnums[c], board);
          if (result) return result;
          break;
        case 4:
          result = checkQuads(filteredEnums[c], board);
          if (result) return result;
          break;
        default:
          return false;
      }
    }
  }

  return false;
};

// Fishes "look into recursion"
export const checkFishes = (board: CellT[], amount: number, finned: boolean): CellT[] | false => {
  // const filledBoard = fillPossibleNums(board);
  let filteredRows: [string, string[]][] = [];
  let filteredColumns: [string, string[]][] = [];

  // Loop through each row and column
  for (let x = 0; x < 9; x += 1) {
    const [boxEnum, rowEnum, columnEnum] = enumSets(board, x);
    const fAmount = finned ? amount + 2 : amount;

    // convert enumerated objects to arrays and filter out results with to many hits
    let asArray = Object.entries(rowEnum);
    const filteredRowEnum = asArray.filter((el) => el[1].length <= fAmount);
    asArray = Object.entries(columnEnum);
    const filteredColumnEnum = asArray.filter((el) => el[1].length <= fAmount);

    if (filteredRowEnum.length && filteredRowEnum[0][1].length <= fAmount) filteredRows = [...filteredRows, ...filteredRowEnum];
    if (filteredColumnEnum.length && filteredColumnEnum[0][1].length <= fAmount) filteredColumns = [...filteredColumns, ...filteredColumnEnum];
  }

  let result: CellT[] | false;
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
