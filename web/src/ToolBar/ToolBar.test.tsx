/*eslint-disable testing-library/no-node-access*/
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ToolBar } from './ToolBar';

describe('ToolBar', () => {
  const handleChange = vi.fn();

  it('should render with placeholder when there is no search text', () => {
    render(<ToolBar search={''} handleSearchChange={handleChange} />);

    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();

    let icon = document.querySelector('svg');
    expect(icon?.attributes.getNamedItem('data-icon')?.value).toBe(
      'magnifying-glass'
    );
  });

  it('should render render with search text when there is search text', () => {
    render(<ToolBar search={'file.pdf'} handleSearchChange={handleChange} />);

    let input = document.querySelector('input');
    expect(input?.value).toBe('file.pdf');

    let icon = document.querySelector('svg');
    expect(icon?.attributes.getNamedItem('data-icon')?.value).toBe(
      'magnifying-glass'
    );
  });

  it('should call click handle search change when something is typed into search bar', () => {
    render(<ToolBar search={''} handleSearchChange={handleChange} />);

    let input = screen.getByPlaceholderText('Search');

    fireEvent.change(input, { target: { value: 'h' } });
    expect(handleChange).toBeCalledTimes(1);
  });
});
