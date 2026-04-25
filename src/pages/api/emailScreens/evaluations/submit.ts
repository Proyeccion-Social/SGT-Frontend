// src/pages/api/emailScreens/evaluations/submit.ts
// BFF: reads HttpOnly cookie, calls submitEvaluation

import type { APIRoute } from 'astro';

const API_URL = import.meta.env.PUBLIC_API_URL;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('access_token')?.value;
    if (!token) {
      return new Response(
        JSON.stringify({ message: 'No autenticado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { sessionId, ratings, modalityAdequate, topicCovered, comment } = body;

    if (!sessionId || !ratings) {
      return new Response(
        JSON.stringify({ message: 'sessionId y ratings son requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const res = await fetch(`${API_URL}/scheduling/sessions/${sessionId}/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ratings, modalityAdequate, topicCovered, comment }),
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      throw new Error(errorBody?.message ?? `HTTP ${res.status}`);
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[BFF] Error en submit evaluation:', error);
    return new Response(
      JSON.stringify({ message: error.message ?? 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
