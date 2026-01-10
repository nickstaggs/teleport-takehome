import {
  FormEvent,
  useState,
  createContext,
  useContext,
  ReactNode,
  useCallback,
} from 'react';
import { FileData } from './types';
import mockData from '../MockData.json';

interface ClientContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleLogin: (
    f?: (args: any) => void,
    args?: any
  ) => (_: string, __: string, e: FormEvent) => void;
  handleLogoff: () => void;
  getFiles: (dirs: string[]) => FileData[] | null;
}

const ClientContext = createContext<ClientContextType | null>(null);

export function ClientProvider({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getFiles = useCallback((dirs: string[]) => {
    setIsLoading(true);
    if (localStorage.getItem('loggedIn') !== 'true') {
      setIsAuthenticated(false);
      setIsLoading(false);
      return [];
    } else {
      setIsAuthenticated(true);
    }
    const files = mockData.contents as (FileData & { contents: FileData[] })[];

    const recurseThroughDirs = (
      contents: (FileData & { contents: FileData[] })[],
      dirs: string[]
    ): FileData[] | null => {
      if (dirs.length === 0) {
        return contents;
      }

      const dir = contents.find(
        c => c.name === dirs[0] && c.type === 'directory'
      );

      if (dir === undefined) {
        return null;
      }

      return recurseThroughDirs(
        dir.contents as (FileData & { contents: FileData[] })[],
        dirs.slice(1)
      );
    };

    setIsLoading(false);

    return recurseThroughDirs(files, dirs);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLogin = useCallback(
    (f: (args: any) => void = () => {}, args: any) => {
      return (_: string, __: string, e: FormEvent) => {
        setIsLoading(true);
        e.preventDefault();
        localStorage.setItem('loggedIn', 'true');
        setIsAuthenticated(true);
        f(args);
        setIsLoading(false);
      };
    },
    []
  );

  const handleLogoff = useCallback(() => {
    setIsLoading(true);
    localStorage.removeItem('loggedIn');
    setIsAuthenticated(false);
    setIsLoading(false);
  }, []);

  return (
    <ClientContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        handleLogin,
        handleLogoff,
        getFiles,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
}

export function useClient() {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
}
