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
        return <FontAwesomeIcon size="xs" icon={faArrowUp} />;
      } else {
        return <FontAwesomeIcon size="xs" icon={faArrowDown} />;
      }
    } else {
      return <FontAwesomeIcon size="xs" icon={faArrowsUpDown} />;
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
