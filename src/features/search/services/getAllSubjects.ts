const API_URL = import.meta.env.API_URL;

// GET /api/v1/subjects — requiere JWT
// Obtiene TODAS las materias resolviendo la paginación del backend
// automáticamente sin modificar ningún archivo del backend.
export async function getAllSubjects(accessToken: string) {
    const headers = { Authorization: `Bearer ${accessToken}` };
    const LIMIT = 50; // máximo que acepta el backend (@Max(50) en PaginationDto)

    // ── 1. Primera página: obtener datos + metadatos de paginación ──────────
    const firstRes = await fetch(`${API_URL}/subjects?page=1&limit=${LIMIT}`, { headers });

    if (!firstRes.ok) {
        const errorBody = await firstRes.json().catch(() => ({ message: "Error al obtener las materias" }));
        throw { status: firstRes.status, ...errorBody };
    }

    const firstPage = await firstRes.json();
    const { totalPages } = firstPage.meta ?? { totalPages: 1 };

    // ── 2. Si hay más páginas, traerlas en paralelo ──────────────────────────
    if (totalPages > 1) {
        const extraPages = await Promise.all(
            Array.from({ length: totalPages - 1 }, (_, i) =>
                fetch(`${API_URL}/subjects?page=${i + 2}&limit=${LIMIT}`, { headers })
                    .then((r) => r.json())
                    .then((p) => p.data ?? []),
            ),
        );

        return {
            ...firstPage,
            data: [...(firstPage.data ?? []), ...extraPages.flat()],
        };
    }

    return firstPage;
}
