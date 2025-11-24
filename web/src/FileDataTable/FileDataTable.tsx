import { FileDataRow } from './FileDataRow/FileDataRow';
import { SortButton } from './SortButton/SortButton';
import { FileData, SortState } from '../utils/types';
import styled from 'styled-components';

const TableWrapper = styled.div`
  max-height: 85%;
  overflow-y: scroll;

  table {
    border-collapse: separate;
    border-spacing: 0;
    width: 100%;
    table-layout: fixed;
  }

  th {
    padding-top: 4px;
    padding-bottom: 4px;
    border-top: 1px solid #e5e5e5;
    border-bottom: 1px solid #e5e5e5;
  }

  td {
    padding-top: 4px;
    padding-bottom: 4px;
    border-bottom: 1px solid #e5e5e5;
  }

  .left-align {
    text-align: left;
  }

  .right-align {
    text-align: right;
  }

  thead {
    position: sticky;
    top: 0;
    background: white;
  }

  .sort-button {
    cursor: pointer;
    background: transparent;
    border: none;
    font-family: inherit;
    padding-left: 2px;
    padding-right: 2px;
    font-size: 1rem;
  }
`;

export function FileDataTable(props: FileDataTableProps) {
  return (
    <TableWrapper>
      <table>
        <thead>
          <tr>
            <th className="left-align">
              <SortButton
                title={'Type'}
                sortField={'type'}
                sortState={props.sortState}
                clickHandler={props.handleSortChange}
              />
            </th>
            <th className="left-align">
              <SortButton
                title={'Name'}
                sortField={'name'}
                sortState={props.sortState}
                clickHandler={props.handleSortChange}
              />
            </th>
            <th className="right-align">
              <SortButton
                title={'Size'}
                sortField={'size'}
                sortState={props.sortState}
                clickHandler={props.handleSortChange}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {props.fileData.map((d, i) => (
            <FileDataRow key={i} fileData={d} />
          ))}
        </tbody>
      </table>
    </TableWrapper>
  );
}

type FileDataTableProps = {
  fileData: FileData[];
  sortState: SortState;
  handleSortChange: (sortField: keyof FileData) => void;
};
