import { Link } from 'react-router';
import styled from 'styled-components';

const BreadcrumbsWrapper = styled.div`
  align-self: center;
`;

export function Breadcrumbs(props: BreadcrumbsProps) {
  return (
    <BreadcrumbsWrapper>
      <span>
        <Link to={'/files'}>Home</Link>
      </span>
      {props.isValidPath &&
        props.filePathArr.map((p, i, arr) => {
          if (i < arr.length - 1) {
            return (
              <span key={`${p}${i}`}>
                {` / `}
                <Link to={`/files/${arr.slice(0, i + 1).join('/')}`}>{p}</Link>
              </span>
            );
          } else {
            return <span key={`${p}${i}`}>{` / ${p}`}</span>;
          }
        })}
    </BreadcrumbsWrapper>
  );
}

type BreadcrumbsProps = {
  filePathArr: string[];
  isValidPath: boolean;
};
