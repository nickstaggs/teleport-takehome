import {
  FormEvent,
  useState,
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useEffect,
} from 'react';
import { FileData } from './types';

interface ClientContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  handleLogin: (
    f?: (args: string[]) => void,
    args?: string[]
  ) => (username: string, password: string, e: FormEvent) => Promise<void>;
  handleLogoff: () => Promise<void>;
  getFiles: (dirs: string[]) => Promise<FileData[] | null>;
}

const ClientContext = createContext<ClientContextType | null>(null);

export function ClientProvider({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to fetch files to check if we have a valid session
        const response = await fetch('/api/files/');
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        // Auth check failed - suppress console error in production
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    void checkAuth();
  }, []);

  const getFiles = useCallback(async (dirs: string[]): Promise<FileData[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const path = dirs.filter(d => d !== '').join('/');
      const url = `/api/files/${path}`;
      const response = await fetch(url);

      if (response.status === 401) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return [];
      }

      if (!response.ok) {
        if (response.status === 404) {
          setIsLoading(false);
          return null;
        }
        throw new Error(`Failed to fetch files: ${response.statusText}`);
      }

      const data = await response.json() as { contents?: FileData[] };
      setIsLoading(false);

      // Return the contents array, or empty array if at root
      return data.contents || [];
    } catch (err) {
      // Error fetching files - suppress console error in production
      setError(err instanceof Error ? err.message : 'Failed to fetch files');
      setIsLoading(false);
      return null;
    }
  }, []);


  const handleLogin = useCallback(
    (f: (args: string[]) => void = () => {}, args: string[] = []) => {
      return async (username: string, password: string, e: FormEvent) => {
        setIsLoading(true);
        setError(null);
        e.preventDefault();

        try {
          const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
          });

          if (!response.ok) {
            if (response.status === 401) {
              throw new Error('Invalid username or password');
            }
            throw new Error('Login failed');
          }

          setIsAuthenticated(true);
          f(args);
        } catch (err) {
          // Login failed - suppress console error in production
          setError(err instanceof Error ? err.message : 'Login failed');
          setIsAuthenticated(false);
        } finally {
          setIsLoading(false);
        }
      };
    },
    []
  );

  const handleLogoff = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      setIsAuthenticated(false);
    } catch (err) {
      // Logout failed - suppress console error in production
      setError(err instanceof Error ? err.message : 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <ClientContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        error,
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
