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
  console.log(cellId);

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
    case '€': return '4';
    case '%': return '5';
    case '&': return '6';
    case '/': return '7';
    case '(': return '8';
    case ')': return '9';
    default: return false;
  }
};
