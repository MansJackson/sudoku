export const isValidNumber = (input: string): boolean => (
  Number.isInteger(Number(input)) && Number(input) > 0
);

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

export const convertShiftNumber = (input: string): string | false => {
  switch (input) {
    case '!': return '1';
    case '"': return '2';
    case '#': return '3';
    case '¤': return '4';
    case '%': return '5';
    case '&': return '6';
    case '/': return '7';
    case '(': return '8';
    case ')': return '9';
    default: return false;
  }
};

export const convertNumLockShift = (input: string): string | false => {
  switch (input) {
    case 'End': return '1';
    case 'ArrowDown': return '2';
    case 'PageDown': return '3';
    case 'ArrowLeft': return '4';
    case 'Clear': return '5';
    case 'ArrowRight': return '6';
    case 'Home': return '7';
    case 'ArrowUp': return '8';
    case 'PageUp': return '9';
    default: return false;
  }
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
