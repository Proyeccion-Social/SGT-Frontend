import type { APIRoute } from 'astro';
import { createSession } from '../../../features/sessions/services/sessionService'; // ajusta la ruta si es necesario

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    // Validación básica (opcional pero recomendada)
    if (!data) {
      return new Response(
        JSON.stringify({ message: 'Datos de sesión requeridos' }),
        { status: 400 }
      );
    }
    const authHeader = request.headers.get('authorization') || undefined;
    console.log("TOKEN RECIBIDO EN BFF:", authHeader);

    const session = await createSession(data, authHeader);

    return new Response(JSON.stringify(session), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error en BFF createSession:', error);

    return new Response(
      JSON.stringify({
        message: error.message || 'Error interno del servidor',
      }),
      { status: 500 }
    );
  }
};