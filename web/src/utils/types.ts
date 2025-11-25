export type FileData = {
  name: string;
  type: 'file' | 'directory';
  size: number;
};

export type SortState = {
  sortField: '' | keyof FileData;
  sortDir: '' | 'asc' | 'desc';
};
