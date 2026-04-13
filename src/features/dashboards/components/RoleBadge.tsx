import HandWrittenArrow from './icons/HandWrittenArrow.svg';
import HandWrittenLine from './icons/HandWrittenLine.svg';
import "../../../styles/badge.css";

import { UserRole } from '@/constants/roles';

type Props = {
  name: string;
  role: UserRole;
};

export const RoleBadge = ({ name, role }: Props) => {
  const roleNames: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'Admin',
    [UserRole.TUTOR]: 'Tutor',
    [UserRole.STUDENT]: 'Estudiante',
  };

  const roleName = roleNames[role] ?? '';

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
