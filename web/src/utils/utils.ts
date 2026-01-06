import { FileData, SortState } from 'src/utils/types';

const sortFileData = (fileData: FileData[], sortState: SortState) => {
  let newContents = [...fileData];
  if (sortState.sortField === 'size') {
    newContents.sort((a, b) => {
      let result = a.size - b.size;
      result = result === 0 ? a.name.localeCompare(b.name) : result;
      return sortState.sortDir === 'asc' ? result : -result;
    });
  } else if (sortState.sortField === 'name') {
    newContents.sort((a, b) => {
      const result = a.name.localeCompare(b.name);
      return sortState.sortDir === 'asc' ? result : -result;
    });
  } else if (sortState.sortField === 'type') {
    newContents.sort((a, b) => {
      let result = a.type === b.type ? 0 : a.type === 'directory' ? 1 : -1;
      result = result === 0 ? a.name.localeCompare(b.name) : result;
      return sortState.sortDir === 'asc' ? result : -result;
    });
  }

  return newContents;
};

export const sortAndFilterFileData = (
  fileData: FileData[],
  sortState: SortState,
  filterVal: string
) => {
  if (filterVal !== '') {
    const filterValLower = filterVal.toLowerCase()
    return sortFileData(
      fileData.filter(o =>
        o.name.toLowerCase().includes(filterValLower)
      ),
      sortState
    );
  } else {
    return sortFileData(fileData, sortState);
  }
};
