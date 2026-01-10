import { ChangeEvent } from 'react';
import styled from 'styled-components';
import { FilterInput } from './FilterInput/FilterInput';
import { Breadcrumbs } from './Breadcrumbs/Breadcrumbs';

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
      <Breadcrumbs
        filePathArr={props.filePathArr}
        isValidPath={props.isValidPath}
      />
      <FilterInput
        search={props.search}
        handleSearchChange={props.handleSearchChange}
      />
    </ToolBarWrapper>
  );
}

type ToolBarProps = {
  search: string;
  handleSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
  filePathArr: string[];
  isValidPath: boolean;
};
