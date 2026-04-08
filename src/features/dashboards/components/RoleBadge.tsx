import HandWrittenArrow from './icons/HandWrittenArrow.svg';
import HandWrittenLine from './icons/HandWrittenLine.svg';
import "../../../styles/badge.css";


type Props = {
  name: string;
  role: string;
};

export const RoleBadge = ({ name, role }: Props) => {
  const roleNames: Record<string, string> = {
    admin: 'Admin',
    tutor: 'Tutor',
    student: 'Estudiante',
  };

  const roleName = roleNames[role.toLowerCase()] ?? '';

  return (
    <div className="badge-container">
      <div className="floating-tag">
        {(roleName === 'Admin' || roleName === 'Tutor') && (
          <>
            <span className="tag-text">Estás en modo <b>{roleName}</b></span>
            <img src={HandWrittenArrow.src} alt="Arrow" className="hand-drawn-arrow" />
          </>
        )}
      </div>

      <span className="highlight-name">
        {name}
        {roleName === 'Estudiante' && (
          <img src={HandWrittenLine.src} alt="Line" className="hand-drawn-line" />
        )}
      </span>
    </div>
  );
};
