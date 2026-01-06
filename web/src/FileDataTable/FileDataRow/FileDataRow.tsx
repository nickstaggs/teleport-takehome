import { faFile, faFolder } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router';
import { FileData } from 'src/utils/types';

export function FileDataRow(props: FileDataRowProps) {
  // passing undefined for locales will make it choose the runtime's default locale
  const formatter = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  const getIcon = (fileType: string) => {
    if (fileType === 'file') {
      return <FontAwesomeIcon icon={faFile} data-testid="fileIcon" />;
    } else if (fileType === 'directory') {
      return <FontAwesomeIcon icon={faFolder} data-testid="folderIcon" />;
    }
  };

  const getFileSizeText = (fileType: string, fileSize: number) => {
    if (fileType === 'directory') {
      return '';
    } else {
      const k = Math.min(
        fileSize > 0 ? Math.floor(Math.log10(fileSize) / 3) : 0,
        5
      );
      const rank = k > 0 ? 'KMGTP'[k - 1] + 'B' : ' B';
      const count =
        k > 0
          ? formatter.format(fileSize / Math.pow(1000, k))
          : fileSize.toString();

      return `${count} ${rank}`;
    }
  };

  return (
    <tr>
      <td className="left-align">{getIcon(props.fileData.type)}</td>
      <td className="left-align" title={props.fileData.name}>
        {props.fileData.type === 'directory' ? <Link to={props.fileData.name}>{props.fileData.name}</Link> : props.fileData.name}
      </td>
      <td className="right-align">
        {getFileSizeText(props.fileData.type, props.fileData.size)}
      </td>
    </tr>
  );
}

type FileDataRowProps = {
  fileData: FileData;
};
