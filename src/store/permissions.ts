export const ROLE_PERMISSIONS: Record<string, string[]> = {
    Admin: [
        'sessions:create', 'sessions:view', 'sessions:delete',
        'tutors:view', 'tutors:manage',
        'users:manage', 'subjects:view'
    ],
    Tutor: [
        'sessions:create', 'sessions:view',
        'tutors:view', 'subjects:view'
    ],
    Student: [
        'sessions:view',
        'tutors:view', 'subjects:view'
    ],
};