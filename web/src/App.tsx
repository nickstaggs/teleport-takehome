import mockData from './MockData.json';
import { ChangeEvent, useState } from 'react';
import { FileData, SortState } from './utils/types';
import { sortFileData } from './utils/utils';
import { FileDataTable } from './FileDataTable/FileDataTable';
import { ToolBar } from './ToolBar/ToolBar';

export function App() {
  const allContents: FileData[] = mockData.contents;
  const [contents, setContents] = useState<FileData[]>(mockData.contents);
  const [search, setSearch] = useState('');
  const [sortState, setSortState] = useState<SortState>({
    sortField: '',
    sortDir: '',
  });

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);

    if (val !== '') {
      setContents(
        sortFileData(
          allContents.filter(o => o.name.includes(val)),
          sortState
        )
      );
    } else {
      setContents(sortFileData(allContents, sortState));
    }
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

    setContents(sortFileData(contents, newSortState));
  };

  return (
    <>
      <ToolBar search={search} handleSearchChange={handleSearchChange} />
      <FileDataTable
        fileData={contents}
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
