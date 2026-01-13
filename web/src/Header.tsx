import styled from 'styled-components';
import { useClient } from './utils/ClientContext';

const HeaderWrapper = styled.div<{ $isAuthenticated: boolean }>`
  display: grid;
  grid-template-rows: ${({ $isAuthenticated }) =>
    $isAuthenticated ? '1fr 4fr' : 'auto'};

  button {
    background: none !important;
    border: none;
    padding: 0 !important;
    color: blue;
    text-decoration: underline;
    cursor: pointer;
    justify-self: end;
    width: fit-content;
  }

  h1 {
    justify-self: center;
    align-self: center;
  }
`;

export function Header() {
  const { handleLogoff, isAuthenticated } = useClient();
  const handleLogoutClick = () => {
    void handleLogoff();
  };
  return (
    <HeaderWrapper id="header" $isAuthenticated={isAuthenticated}>
      {isAuthenticated && <button onClick={handleLogoutClick}>Logout</button>}
      <h1>File Browser</h1>
    </HeaderWrapper>
  );
}
