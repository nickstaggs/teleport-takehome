import { describe, expect, it } from 'vitest';
import { sortAndFilterFileData } from './utils';
import { FileData } from './types';

describe('sortAndFilterFileData', () => {
  it('should handle an empty folder', () => {
    const arr = sortAndFilterFileData(
      [],
      { sortDir: 'asc', sortField: 'name' },
      ''
    );
    expect(arr.length).toBe(0);
  });

  describe('sorting only', () => {
    it('should sort name asc correctly (basic)', () => {
      const fileData: FileData[] = [
        { name: 'b', size: 99, type: 'file' },
        { name: 'c', size: 99, type: 'file' },
        { name: 'a', size: 99, type: 'file' },
      ];

      const arr = sortAndFilterFileData(
        fileData,
        { sortDir: 'asc', sortField: 'name' },
        ''
      );

      expect(arr.length).toBe(3);
      expect(arr[0].name).toBe('a');
      expect(arr[1].name).toBe('b');
      expect(arr[2].name).toBe('c');
    });

    it('should sort name desc correctly (basic)', () => {
      const fileData: FileData[] = [
        { name: 'b', size: 99, type: 'file' },
        { name: 'c', size: 99, type: 'file' },
        { name: 'a', size: 99, type: 'file' },
      ];

      const arr = sortAndFilterFileData(
        fileData,
        { sortDir: 'desc', sortField: 'name' },
        ''
      );

      expect(arr.length).toBe(3);
      expect(arr[0].name).toBe('c');
      expect(arr[1].name).toBe('b');
      expect(arr[2].name).toBe('a');
    });

    it('should sort type asc correctly (basic)', () => {
      const fileData: FileData[] = [
        { name: 'b', size: 0, type: 'directory' },
        { name: 'c', size: 0, type: 'file' },
        { name: 'a', size: 99, type: 'file' },
      ];

      const arr = sortAndFilterFileData(
        fileData,
        { sortDir: 'asc', sortField: 'type' },
        ''
      );

      // tiebreaker is file name
      expect(arr.length).toBe(3);
      expect(arr[0].name).toBe('a');
      expect(arr[1].name).toBe('c');
      expect(arr[2].name).toBe('b');
    });

    it('should sort type desc correctly (basic)', () => {
      const fileData: FileData[] = [
        { name: 'b', size: 0, type: 'directory' },
        { name: 'c', size: 0, type: 'file' },
        { name: 'a', size: 99, type: 'file' },
      ];

      const arr = sortAndFilterFileData(
        fileData,
        { sortDir: 'desc', sortField: 'type' },
        ''
      );

      // tiebreaker is file name
      expect(arr.length).toBe(3);
      expect(arr[0].name).toBe('b');
      expect(arr[1].name).toBe('c');
      expect(arr[2].name).toBe('a');
    });

    it('should sort size asc correctly (basic)', () => {
      const fileData: FileData[] = [
        { name: 'b', size: 9991, type: 'file' },
        { name: 'c', size: 9991, type: 'file' },
        { name: 'a', size: 9992, type: 'file' },
      ];

      const arr = sortAndFilterFileData(
        fileData,
        { sortDir: 'asc', sortField: 'size' },
        ''
      );

      // tiebreaker is file name
      expect(arr.length).toBe(3);
      expect(arr[0].name).toBe('b');
      expect(arr[1].name).toBe('c');
      expect(arr[2].name).toBe('a');
    });

    it('should sort size desc correctly (basic)', () => {
      const fileData: FileData[] = [
        { name: 'b', size: 9991, type: 'file' },
        { name: 'c', size: 9991, type: 'file' },
        { name: 'a', size: 9992, type: 'file' },
      ];

      const arr = sortAndFilterFileData(
        fileData,
        { sortDir: 'desc', sortField: 'size' },
        ''
      );

      // tiebreaker is file name
      expect(arr.length).toBe(3);
      expect(arr[0].name).toBe('a');
      expect(arr[1].name).toBe('c');
      expect(arr[2].name).toBe('b');
    });

    it('should sort correctly with multiple capitalizations in name', () => {
      const fileData: FileData[] = [
        { name: 'AA', size: 99, type: 'file' },
        { name: 'aa', size: 99, type: 'file' },
        { name: 'aA', size: 99, type: 'file' },
      ];

      const arr = sortAndFilterFileData(
        fileData,
        { sortDir: 'asc', sortField: 'name' },
        ''
      );

      expect(arr.length).toBe(3);
      expect(arr[0].name).toBe('aa');
      expect(arr[1].name).toBe('aA');
      expect(arr[2].name).toBe('AA');
    });
  });

  describe('filtering only', () => {
    it(`should filter out all but 1 based on file name search text 'a'`, () => {
      const fileData: FileData[] = [
        { name: 'b', size: 9991, type: 'file' },
        { name: 'c', size: 0, type: 'directory' },
        { name: 'a', size: 9992, type: 'file' },
      ];

      const arr = sortAndFilterFileData(
        fileData,
        { sortDir: '', sortField: '' },
        'a'
      );

      expect(arr.length).toBe(1);
      expect(arr[0].name).toBe('a');
    });

    it('should filter in a case sensitive way', () => {
      const fileData: FileData[] = [
        { name: 'b', size: 9991, type: 'file' },
        { name: 'A', size: 0, type: 'directory' },
        { name: 'a', size: 9992, type: 'file' },
      ];

      const arr = sortAndFilterFileData(
        fileData,
        { sortDir: '', sortField: '' },
        'a'
      );

      expect(arr.length).toBe(1);
      expect(arr[0].name).toBe('a');
    });
  });

  describe('sorting and filtering', () => {
    it('should filter and sort by name asc', () => {
      const fileData: FileData[] = [
        { name: 'ab', size: 0, type: 'directory' },
        { name: 'c', size: 0, type: 'directory' },
        { name: 'aa', size: 9992, type: 'file' },
      ];

      const arr = sortAndFilterFileData(
        fileData,
        { sortDir: 'asc', sortField: 'name' },
        'a'
      );

      expect(arr.length).toBe(2);
      expect(arr[0].name).toBe('aa');
      expect(arr[1].name).toBe('ab');
    });

    it('should filter and sort by name desc', () => {
      const fileData: FileData[] = [
        { name: 'ab', size: 0, type: 'directory' },
        { name: 'c', size: 0, type: 'directory' },
        { name: 'aa', size: 9992, type: 'file' },
      ];

      const arr = sortAndFilterFileData(
        fileData,
        { sortDir: 'desc', sortField: 'name' },
        'a'
      );

      expect(arr.length).toBe(2);
      expect(arr[0].name).toBe('ab');
      expect(arr[1].name).toBe('aa');
    });

    it('should filter and sort by type asc', () => {
      const fileData: FileData[] = [
        { name: 'ab', size: 0, type: 'directory' },
        { name: 'c', size: 0, type: 'directory' },
        { name: 'aa', size: 9992, type: 'file' },
      ];

      const arr = sortAndFilterFileData(
        fileData,
        { sortDir: 'asc', sortField: 'type' },
        'a'
      );

      expect(arr.length).toBe(2);
      expect(arr[0].name).toBe('aa');
      expect(arr[1].name).toBe('ab');
    });

    it('should filter and sort by type desc', () => {
      const fileData: FileData[] = [
        { name: 'ab', size: 0, type: 'directory' },
        { name: 'c', size: 0, type: 'directory' },
        { name: 'aa', size: 9992, type: 'file' },
      ];

      const arr = sortAndFilterFileData(
        fileData,
        { sortDir: 'desc', sortField: 'type' },
        'a'
      );

      expect(arr.length).toBe(2);
      expect(arr[0].name).toBe('ab');
      expect(arr[1].name).toBe('aa');
    });

    it('should filter and sort by size asc', () => {
      const fileData: FileData[] = [
        { name: 'ab', size: 0, type: 'directory' },
        { name: 'c', size: 0, type: 'directory' },
        { name: 'aa', size: 9992, type: 'file' },
      ];

      const arr = sortAndFilterFileData(
        fileData,
        { sortDir: 'asc', sortField: 'size' },
        'a'
      );

      expect(arr.length).toBe(2);
      expect(arr[0].name).toBe('ab');
      expect(arr[1].name).toBe('aa');
    });

    it('should filter and sort by size desc', () => {
      const fileData: FileData[] = [
        { name: 'ab', size: 0, type: 'directory' },
        { name: 'c', size: 0, type: 'directory' },
        { name: 'aa', size: 9992, type: 'file' },
      ];

      const arr = sortAndFilterFileData(
        fileData,
        { sortDir: 'desc', sortField: 'size' },
        'a'
      );

      expect(arr.length).toBe(2);
      expect(arr[0].name).toBe('aa');
      expect(arr[1].name).toBe('ab');
    });
  });
});
