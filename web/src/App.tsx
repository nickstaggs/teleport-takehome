import mockData from './MockData.json';
import { ChangeEvent, useState } from 'react';
import { FileData, SortState } from './utils/types';
import { sortAndFilterFileData } from './utils/utils';
import { FileDataTable } from './FileDataTable/FileDataTable';
import { ToolBar } from './ToolBar/ToolBar';

export function App() {
  const [contents] = useState<FileData[]>(mockData.contents as FileData[]);
  const [search, setSearch] = useState('');
  const [sortState, setSortState] = useState<SortState>({
    sortField: 'name',
    sortDir: 'asc',
  });

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
  };

  const handleSortChange = (sortField: keyof FileData) => {
    let newSortState: SortState;
    if (sortState.sortField !== sortField) {
      newSortState = { sortField: sortField, sortDir: 'asc' };
      setSortState(newSortState);
    } else {
      if (sortState.sortDir === 'asc') {
        newSortState = { sortField: sortField, sortDir: 'desc' };
        setSortState(newSortState);
      } else {
        newSortState = { sortField: '', sortDir: '' };
        setSortState(newSortState);
      }
    }
  };

  return (
    <>
      <ToolBar search={search} handleSearchChange={handleSearchChange} />
      <FileDataTable
        fileData={sortAndFilterFileData(contents, sortState, search)}
        sortState={sortState}
        handleSortChange={handleSortChange}
      />
      <style>
        {`
          body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
              'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
              sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;

            display: grid;
            grid-template-columns: 1fr 3fr 1fr;
            grid-template-rows: 1fr 5fr 1fr;
            grid-template-areas:
            ". . ."
            ". a ."
            ". . .";
            height: 100vh;
          }

          #app {
            grid-area: a;
            width: 100%;
          }
        `}
      </style>
    </>
  );
}
