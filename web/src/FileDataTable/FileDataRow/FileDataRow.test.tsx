/*eslint-disable testing-library/no-node-access*/
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

    let fileSvg = document.querySelector('svg');
    expect(fileSvg?.attributes.getNamedItem('data-icon')?.value).toBe('file');
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

    expect(screen.queryByText('0 b')).not.toBeInTheDocument();
    expect(screen.getByText('etc')).toBeInTheDocument();

    let folderSvg = document.querySelector('svg');
    expect(folderSvg?.attributes.getNamedItem('data-icon')?.value).toBe(
      'folder'
    );
  });
});
