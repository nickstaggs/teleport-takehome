import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FileDataRow } from './FileDataRow';

describe('FileDataRow', () => {
  it('should render with correct information for file', () => {
    render(
      <FileDataRow
        fileData={{
          name: 'main.go',
          type: 'file',
          size: 24557,
        }}
      />
    );

    expect(screen.getByText('24.6 kb')).toBeInTheDocument();
    expect(screen.getByText('main.go')).toBeInTheDocument();
    expect(screen.getByTestId('fileIcon')).toBeInTheDocument();
  });

  it('should render correct information for directory', () => {
    render(
      <FileDataRow
        fileData={{
          name: 'etc',
          type: 'directory',
          size: 0,
        }}
      />
    );

    expect(screen.queryByText('0')).not.toBeInTheDocument();
    expect(screen.getByText('etc')).toBeInTheDocument();
    expect(screen.getByTestId('folderIcon')).toBeInTheDocument();
  });

  it('should output 100.0 gb for the file size text for the file size 99999999999', () => {
    render(
      <FileDataRow
        fileData={{
          name: 'bigfile.pdf',
          type: 'file',
          size: 99999999999,
        }}
      />
    );

    expect(screen.getByText('100.0 gb')).toBeInTheDocument();
  });

  it('should output 999 b for the file size text for the file size 999', () => {
    render(
      <FileDataRow
        fileData={{
          name: 'small.pdf',
          type: 'file',
          size: 999,
        }}
      />
    );

    expect(screen.getByText('999 b')).toBeInTheDocument();
  });

  it('should output 2.3 kb for the file size text for the file size 2340', () => {
    render(
      <FileDataRow
        fileData={{
          name: 'small.pdf',
          type: 'file',
          size: 2340,
        }}
      />
    );

    expect(screen.getByText('2.3 kb')).toBeInTheDocument();
  });

  it('should output 2.4 kb for the file size text for the file size 2350', () => {
    render(
      <FileDataRow
        fileData={{
          name: 'small.pdf',
          type: 'file',
          size: 2350,
        }}
      />
    );

    expect(screen.getByText('2.4 kb')).toBeInTheDocument();
  });
});
