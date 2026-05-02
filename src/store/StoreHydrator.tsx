import { useEffect } from "react";
import { useAuthStore } from "./authStore";
import { useSubjectStore } from "./subjectStore";

export default function StoreHydrator() {
    const user = useAuthStore((state) => state.user);
    const hasHydratedAuth = useAuthStore((state) => state._hasHydrated);
    const fetchSubjects = useSubjectStore((state) => state.fetchSubjects);
    const clearSubjects = useSubjectStore((state) => state.clearSubjects);
    const subjects = useSubjectStore((state) => state.subjects);
    const hasHydratedSubjects = useSubjectStore((state) => state._hasHydrated);

    useEffect(() => {
        // Fetch subjects if we have a user and haven't fetched them yet in this session
        // or if they are empty.
        if (hasHydratedAuth && hasHydratedSubjects) {
            if (user && subjects.length === 0) {
                fetchSubjects();
            } else if (!user) {
                clearSubjects();
            }
        }
    }, [hasHydratedAuth, hasHydratedSubjects, user, subjects.length, fetchSubjects, clearSubjects]);

    return null;
}
