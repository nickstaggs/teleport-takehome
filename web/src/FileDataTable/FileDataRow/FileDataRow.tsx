import { faFile, faFolder } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FileData } from 'src/utils/types';

export function FileDataRow(props: FileDataRowProps) {
  const getIcon = (fileType: string) => {
    if (fileType === 'file') {
      return <FontAwesomeIcon icon={faFile} />;
    } else if (fileType === 'directory') {
      return <FontAwesomeIcon icon={faFolder} />;
    }
  };

  const getFileSizeText = (fileType: string, fileSize: number) => {
    if (fileType === 'directory') {
      return '';
    } else {
      const k = fileSize > 0 ? Math.floor(Math.log10(fileSize) / 3) : 0;
      const rank = k > 0 ? 'kmgtp'[k - 1] + 'b' : ' b';
      const count =
        k > 0 ? (fileSize / Math.pow(1000, k)).toFixed(1) : fileSize;
      return `${count} ${rank}`;
    }
  };

  return (
    <tr>
      <td className="left-align">{getIcon(props.fileData.type)}</td>
      <td className="left-align">{props.fileData.name}</td>
      <td className="right-align">
        {getFileSizeText(props.fileData.type, props.fileData.size)}
      </td>
    </tr>
  );
}

type FileDataRowProps = {
  fileData: FileData;
};
