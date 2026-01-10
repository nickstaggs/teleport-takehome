import { FormEvent, useState } from 'react';
import styled from 'styled-components';

const LoginWrapper = styled.div`
  margin-top: 1em;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
  border-radius: 5px;
  border: 1px solid #c9c9c9;
  border-collapse: collapse;

  h2 {
    text-align: center;
  }

  form {
    margin: auto;
    text-align: left;
    width: fit-content;
  }

  form * {
    margin: 0.25rem 1rem 1rem 1rem;
  }
`;

export function Login(props: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <LoginWrapper>
      <h2>Login</h2>
      <form onSubmit={e => props.handleLogin(username, password, e)}>
        <label htmlFor="username">username</label>
        <br />
        <input
          name="username"
          autoComplete="on"
          id="username"
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <br />
        <label htmlFor="password">password</label>
        <br />
        <input
          name="password"
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <br />
        <button>Submit</button>
      </form>
    </LoginWrapper>
  );
}

type LoginProps = {
  handleLogin: (username: string, password: string, e: FormEvent) => void;
};
