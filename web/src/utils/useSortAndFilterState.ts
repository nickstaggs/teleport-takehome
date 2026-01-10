import { useState, useEffect, ChangeEvent } from 'react';
import { useSearchParams } from 'react-router';
import { SortState, FileData, SortDirection } from './types';

export function useSortAndFilterState() {
  const [sortState, setSortState] = useState<SortState>({
    sortField: '',
    sortDir: '',
  });
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const defaultSortState: SortState = {
      sortField: 'name',
      sortDir: 'asc',
    };

    const querySortField = searchParams.get('sort');
    const querySortDir = searchParams.get('dir');
    const queryFilter = searchParams.get('filter');

    setSearch(queryFilter ?? '');

    if (querySortDir === null && querySortField === null) {
      setSortState(defaultSortState);
    } else if (querySortDir !== null && querySortField !== null) {
      if (
        ['asc', 'desc'].includes(querySortDir) &&
        ['name', 'type', 'size'].includes(querySortField)
      ) {
        setSortState({
          sortField: querySortField as keyof FileData,
          sortDir: querySortDir as SortDirection,
        });
      }
    }
    // else its bad input and leave the sort state as nothing
  }, [searchParams]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    setSearchParams({
      sort: sortState.sortField,
      dir: sortState.sortDir,
      filter: val,
    });
  };

  const handleSortChange = (sortField: keyof FileData) => {
    let newSortState: SortState;
    if (sortState.sortField !== sortField) {
      newSortState = { sortField: sortField, sortDir: 'asc' };
    } else {
      if (sortState.sortDir === 'asc') {
        newSortState = { sortField: sortField, sortDir: 'desc' };
      } else {
        newSortState = { sortField: '', sortDir: '' };
      }
    }
    setSortState(newSortState);
    setSearchParams({
      sort: newSortState.sortField,
      dir: newSortState.sortDir,
      filter: search,
    });
  };

  return { sortState, search, handleSearchChange, handleSortChange };
}
