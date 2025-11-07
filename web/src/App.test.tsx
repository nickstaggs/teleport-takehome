import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App';

test('should render App component', () => {
  render(<App />);

  expect(screen.getByText('Teleport Fullstack Interview')).toBeInTheDocument();
});
