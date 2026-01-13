import { sortAndFilterFileData } from './utils/utils';
import { FileDataTable } from './FileDataTable/FileDataTable';
import { ToolBar } from './ToolBar/ToolBar';
import { useSortAndFilterState } from './utils/useSortAndFilterState';
import { FileData } from './utils/types';
import { Login } from './Login/Login';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useClient } from './utils/ClientContext';

export function App() {
  const { sortState, search, handleSearchChange, handleSortChange } =
    useSortAndFilterState();
  const { getFiles, isLoading, isAuthenticated } = useClient();
  const [contents, setContents] = useState<FileData[] | null>([]);
  const [filePathArr, setFilePathArr] = useState<string[]>([]);
  const params = useParams();

  useEffect(() => {
    let filePath = params['*'];
    const dirs = filePath?.split('/').filter(d => d !== '') ?? [];
    setFilePathArr(dirs);

    // Fetch files if authenticated
    if (isAuthenticated) {
      void getFiles(dirs).then(files => {
        setContents(files);
      });
    }
  }, [params, getFiles, isAuthenticated]);

  return (
    <div id="app">
      {!isLoading ? (
        isAuthenticated ? (
          <>
            <ToolBar
              search={search}
              handleSearchChange={handleSearchChange}
              filePathArr={filePathArr}
              isValidPath={contents !== null}
            />
            {contents !== null ? (
              <FileDataTable
                fileData={sortAndFilterFileData(contents, sortState, search)}
                sortState={sortState}
                handleSortChange={handleSortChange}
              />
            ) : (
              <div>That file path was invalid.</div>
            )}
          </>
        ) : (
          <Login />
        )
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
