import HandWrittenArrow from './icons/HandWrittenArrow.svg';
import HandWrittenLine from './icons/HandWrittenLine.svg';
import "../styles/badge.css";

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

  const roleName = roleNames[role.toLowerCase()] ?? '';
  const firstName = name.split(' ')[0];

  return (
    <div className="badge-container">
      <div className="floating-tag">
        {(roleName === 'Admin' || roleName === 'Tutor') && (
          <>
            <span className="tag-text">Estás en modo <b>{roleName}</b></span>
            <img src={HandWrittenArrow.src} alt="Arrow" className="hand-drawn-arrow" />
          </>
        )}
        {roleName === 'Estudiante' && (
          <img src={HandWrittenLine.src} alt="Line" className="hand-drawn-line" />
        )}
      </div>

      <span className="highlight-name">
        {firstName}
      </span>
    </div>
  );
};
