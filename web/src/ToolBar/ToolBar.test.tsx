import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ToolBar } from './ToolBar';

describe('ToolBar', () => {
  const handleChange = vi.fn();

  it('should render with placeholder when there is no search text', () => {
    render(<ToolBar search={''} handleSearchChange={handleChange} />);

    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    expect(screen.getByTestId('magnifyingGlassIcon')).toBeInTheDocument();
  });

  it('should render render with search text when there is search text', () => {
    render(<ToolBar search={'file.pdf'} handleSearchChange={handleChange} />);

    expect(screen.getByDisplayValue('file.pdf')).toBeInTheDocument();
    expect(screen.getByTestId('magnifyingGlassIcon')).toBeInTheDocument();
  });

  it('should call click handle search change when something is typed into search bar', () => {
    render(<ToolBar search={''} handleSearchChange={handleChange} />);

    let input = screen.getByPlaceholderText('Search');

    fireEvent.change(input, { target: { value: 'h' } });
    expect(handleChange).toBeCalledTimes(1);
  });
});
