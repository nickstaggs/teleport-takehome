import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ChangeEvent } from 'react';
import styled from 'styled-components';

const ToolBarWrapper = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;

  #nameFilter {
    border: none;
    text-align: left;
    margin-top: 0.25rem;
    margin-bottom: 0.25rem;
    margin-left: 0.5rem;
    font-family: inherit;
  }

  #nameFilterContainer {
    text-align: right;
    margin-bottom: 0.25rem;
    border: 1px solid #e5e5e5;
    border-radius: 40px;
    display: grid;
    grid-template-columns: 8fr 1fr;
  }

  #nameFilterIcon {
    margin-right: 0.5rem;
    text-align: right;
    vertical-align: top;
    justify-self: end;
    align-self: center;
  }

  input:focus-visible {
    outline: none;
  }
`;

export function ToolBar(props: ToolBarProps) {
  return (
    <ToolBarWrapper>
      <div>{/* Placeholder for breadcrumbs */}</div>
      <div id="nameFilterContainer">
        <input
          id="nameFilter"
          placeholder="Search"
          value={props.search}
          onChange={e => props.handleSearchChange(e)}
          type="text"
        />
        <FontAwesomeIcon
          id="nameFilterIcon"
          size="xs"
          icon={faMagnifyingGlass}
          data-testid="magnifyingGlassIcon"
        />
      </div>
    </ToolBarWrapper>
  );
}

type ToolBarProps = {
  search: string;
  handleSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
};
