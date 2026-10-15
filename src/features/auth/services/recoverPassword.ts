const API_URL = import.meta.env.API_URL;

export const recoverPassword = async (
    email: string,
    frontendUrl?: string,
): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/auth/password/recover`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(frontendUrl ? { 'x-frontend-url': frontendUrl } : {}),
            },
            body: JSON.stringify({ email }),
        });
        if (!response.ok) {
            throw new Error('Failed to recover password');
        }
    } catch (error) {
        throw error;
    }
}