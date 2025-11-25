import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { SortButton } from './SortButton';

describe('SortButton', () => {
  const handleClick = vi.fn();

  it('should render with up down arrows when sort field is not set', () => {
    render(
      <SortButton
        title={'Test'}
        sortField={'name'}
        sortState={{
          sortField: '',
          sortDir: '',
        }}
        clickHandler={handleClick}
      />
    );

    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByTestId('arrowsUpDownIcon')).toBeInTheDocument();
  });

  it('should render render with up down arrows when sort field is not equal to sort state sort field', () => {
    render(
      <SortButton
        title={'Test'}
        sortField={'size'}
        sortState={{
          sortField: 'name',
          sortDir: 'asc',
        }}
        clickHandler={handleClick}
      />
    );

    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByTestId('arrowsUpDownIcon')).toBeInTheDocument();
  });

  it('should render render with up arrow when sort field is equal to sort state sort field and direction is asc', () => {
    render(
      <SortButton
        title={'Name'}
        sortField={'name'}
        sortState={{
          sortField: 'name',
          sortDir: 'asc',
        }}
        clickHandler={handleClick}
      />
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByTestId('arrowUpIcon')).toBeInTheDocument();
  });

  it('should render render with up arrow when sort field is equal to sort state sort field and direction is desc', () => {
    render(
      <SortButton
        title={'Name'}
        sortField={'name'}
        sortState={{
          sortField: 'name',
          sortDir: 'desc',
        }}
        clickHandler={handleClick}
      />
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByTestId('arrowDownIcon')).toBeInTheDocument();
  });

  it('should call click handler when clicked', () => {
    render(
      <SortButton
        title={'Name'}
        sortField={'name'}
        sortState={{
          sortField: 'name',
          sortDir: 'desc',
        }}
        clickHandler={handleClick}
      />
    );

    expect(screen.getByText('Name')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Name'));
    expect(handleClick).toBeCalledTimes(1);
  });
});
