import {
  faArrowDown,
  faArrowsUpDown,
  faArrowUp,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FileData, SortState } from 'src/utils/types';

export function SortButton(props: SortButtonProps) {
  const getIcon = () => {
    if (props.sortField === props.sortState.sortField) {
      if (props.sortState.sortDir === 'asc') {
        return (
          <FontAwesomeIcon
            size="xs"
            icon={faArrowUp}
            data-testid="arrowUpIcon"
          />
        );
      } else {
        return (
          <FontAwesomeIcon
            size="xs"
            icon={faArrowDown}
            data-testid="arrowDownIcon"
          />
        );
      }
    } else {
      return (
        <FontAwesomeIcon
          size="xs"
          icon={faArrowsUpDown}
          data-testid="arrowsUpDownIcon"
        />
      );
    }
  };

  return (
    <button
      onClick={() => props.clickHandler(props.sortField)}
      className="sort-button"
    >
      {props.title}
      {getIcon()}
    </button>
  );
}

type SortButtonProps = {
  title: string;
  sortField: keyof FileData;
  sortState: SortState;
  clickHandler: (sortField: keyof FileData) => void;
};
