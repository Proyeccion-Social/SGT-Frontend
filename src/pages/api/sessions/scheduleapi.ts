import type { APIRoute } from 'astro';
import { createSession, getTutorInfo } from '@features/sessions/services/sessionService';

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const url = new URL(request.url);
    const tutorId = url.searchParams.get("tutorId");

    if (!tutorId) {
      return new Response(
        JSON.stringify({ message: "tutorId requerido" }),
        { status: 400 }
      );
    }

    const token = cookies.get("access_token")?.value;

    if (!token) {
      return new Response(
        JSON.stringify({ message: "No autenticado" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const tutor = await getTutorInfo(tutorId, token);

    return new Response(JSON.stringify(tutor), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {

    return new Response(
      JSON.stringify({
        message: error.message || "Error interno del servidor",
      }),
      { status: 500 }
    );
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const data = await request.json();

    // Validación básica (opcional pero recomendada)
    if (!data) {
      return new Response(
        JSON.stringify({ message: 'Datos de sesión requeridos' }),
        { status: 400 }
      );
    }

    // Validar que availabilityId sea un número válido
    if (data.availabilityId == null || isNaN(Number(data.availabilityId))) {
      return new Response(
        JSON.stringify({ message: 'availabilityId inválido o ausente' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = cookies.get('access_token')?.value;

    if (!token) {
      return new Response(
        JSON.stringify({ message: 'No autenticado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const session = await createSession(data, token);

    return new Response(JSON.stringify(session), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    const status = error?.status ?? 500;
    return new Response(
      JSON.stringify({
        message: error.message || 'Error interno del servidor',
      }),
      { status, headers: { 'Content-Type': 'application/json' } }
    );
  }
};