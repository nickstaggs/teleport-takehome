import styled from 'styled-components';
import { useClient } from './utils/ClientContext';

const HeaderWrapper = styled.div`
  display: grid;
  grid-template-rows: 1fr 4fr;

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
  }
`;

export function Header() {
  const { handleLogoff, isAuthenticated } = useClient();
  const handleLogoutClick = () => {
    void handleLogoff();
  };
  return (
    <HeaderWrapper id="header">
      {isAuthenticated && (
        <button onClick={handleLogoutClick}>Logout</button>
      )}
      <h1>File Browser</h1>
    </HeaderWrapper>
  );
}
