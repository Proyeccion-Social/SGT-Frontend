import HandWrittenArrow from './icons/HandWrittenArrow.svg';
import HandWrittenLine from './icons/HandWrittenLine.svg';
import "../styles/badge.css";


type Props = {
  name: string;
};

export const RoleBadge = ({ name }: Props) => {
  const firstName = name.split(' ')[0];

  return (
    <div className="badge-container">
      <span className="highlight-name">
        {firstName}
      </span>
    </div>
  );
};
