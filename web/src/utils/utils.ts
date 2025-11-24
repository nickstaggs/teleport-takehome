import { FileData, SortState } from 'src/utils/types';

export const sortFileData = (fileData: FileData[], sortState: SortState) => {
  let newContents = [...fileData];
  if (sortState.sortField === 'size') {
    if (sortState.sortDir === 'asc') {
      newContents.sort(
        (a, b) =>
          a[sortState.sortField as keyof { size: number }] -
          b[sortState.sortField as keyof { size: number }]
      );
    } else {
      newContents.sort(
        (a, b) =>
          b[sortState.sortField as keyof { size: number }] -
          a[sortState.sortField as keyof { size: number }]
      );
    }
  } else if (sortState.sortField === 'name' || sortState.sortField === 'type') {
    if (sortState.sortDir === 'asc') {
      newContents.sort((a, b) =>
        a[sortState.sortField as keyof { name: string; type: string }]
          .toLowerCase()
          .localeCompare(
            b[
              sortState.sortField as keyof { name: string; type: string }
            ].toLocaleLowerCase()
          )
      );
    } else {
      newContents.sort((a, b) =>
        b[sortState.sortField as keyof { name: string; type: string }]
          .toLowerCase()
          .localeCompare(
            a[
              sortState.sortField as keyof { name: string; type: string }
            ].toLocaleLowerCase()
          )
      );
    }
  }

  return newContents;
};
