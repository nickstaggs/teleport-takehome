import { sortAndFilterFileData } from './utils/utils';
import { FileDataTable } from './FileDataTable/FileDataTable';
import { ToolBar } from './ToolBar/ToolBar';
import { useSortAndFilterState } from './utils/useSortAndFilterState';
import { FileData } from './utils/types';
import { Login } from './Login/Login';
import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'react-router';

export function App(props: AppProps) {
  const {sortState, search, handleSearchChange, handleSortChange} = useSortAndFilterState()
  const [contents, setContents] = useState<FileData[] | null>([])
  const [filePathArr, setFilePathArr] = useState<string[]>([])
  const params = useParams();

  useEffect(() => {
    let filePath = params['*'];
    const dirs = filePath?.split('/') ?? []
    setFilePathArr(dirs)
    setContents(props.getFiles(dirs))
  },[params])

  return (
    <div id='app'>
      {!props.isLoading ?
        props.isAuthenticated ?
          <>
            <ToolBar search={search} handleSearchChange={handleSearchChange} filePathArr={filePathArr} isValidPath={contents !== null} />
            {contents !== null ?
            <FileDataTable
              fileData={sortAndFilterFileData(contents as FileData[], sortState, search)}
              sortState={sortState}
              handleSortChange={handleSortChange}
            /> : <div>That file path was invalid.</div>
            }
          </>
        :
          <Login handleLogin={props.handleLogin(props.getFiles, filePathArr)}/>
         :
        <div>Loading...</div>
      }
    </div>
  );
}

export type AppProps = {
  isAuthenticated: boolean;
  isLoading: boolean;
  handleLogin: (f: Function, args: any) => (_: string, __: string, e: FormEvent) => void;
  getFiles: (pathArr: string[]) => FileData[] | null;
}
