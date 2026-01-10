import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ToolBar } from './ToolBar';
import { MemoryRouter } from 'react-router';

describe('ToolBar', () => {
  const handleChange = vi.fn();

  const renderToolBar = (
    search: string,
    filePathArr: string[],
    isValidPath: boolean
  ) => {
    render(
      <MemoryRouter>
        <ToolBar
          search={search}
          handleSearchChange={handleChange}
          filePathArr={filePathArr}
          isValidPath={isValidPath}
        />
      </MemoryRouter>
    );
  };

  it('should render with placeholder when there is no search text', () => {
    renderToolBar('', [], true);

    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
  });

  it('should render render with search text when there is search text', () => {
    renderToolBar('file.pdf', [], true);

    expect(screen.getByDisplayValue('file.pdf')).toBeInTheDocument();
  });

  it('should call click handle search change when something is typed into search bar', () => {
    renderToolBar('', [], true);

    let input = screen.getByPlaceholderText('Search');

    fireEvent.change(input, { target: { value: 'h' } });
    expect(handleChange).toBeCalledTimes(1);
  });
});
