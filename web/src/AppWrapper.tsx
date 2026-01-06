import { Navigate, useRoutes, BrowserRouter } from "react-router";
import { App, AppProps } from "./App";
import { useClient } from "./utils/useClient";
import { Header } from "./Header";

const AppRoutes = (props: AppProps) => {
        const app = <App isAuthenticated={props.isAuthenticated} handleLogin={props.handleLogin} getFiles={props.getFiles} isLoading={props.isLoading} />;
        const notFound = <div>404</div>
        const routes = [
            { path: '/', element: <Navigate to={'/files'}/> },
            { path: '/files', element: app },
            { path: '/files/*', element: app },
            { path: '/*', element: notFound },
        ];
        return useRoutes(routes);
    };

export function AppWrapper() {
    const {isAuthenticated, isLoading, handleLogin, handleLogoff, getFiles} = useClient();

    return(
        <>
            <Header handleLogout={handleLogoff} isAuthenticated={isAuthenticated} />
            <BrowserRouter>
                <AppRoutes isAuthenticated={isAuthenticated} handleLogin={handleLogin} getFiles={getFiles} isLoading={isLoading} />
            </BrowserRouter>
            <style>
                {`
                    body {
                        margin: 0;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
                        sans-serif;
                        -webkit-font-smoothing: antialiased;
                        -moz-osx-font-smoothing: grayscale;
                    }

                    #container {
                        display: grid;
                        grid-template-columns: 1fr 3fr 1fr;
                        grid-template-rows: 1fr 5fr 1fr;
                        grid-template-areas:
                        ". head ."
                        ". app ."
                        ". . .";
                        height: 100vh;
                    }

                    #app {
                        grid-area: app;
                        width: 100%;
                    }

                    #header {
                        grid-area: head;
                        width: 100%;
                    }
                `}
            </style>
        </>
    )
}