export type FileData = {
  name: string;
  type: string;
  size: number;
};

export type SortState = {
  sortField: '' | keyof FileData;
  sortDir: '' | 'asc' | 'desc';
};
