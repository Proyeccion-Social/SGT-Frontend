import type { APIRoute } from 'astro';
import { createSession } from '../../../features/sessions/services/sessionService';
import { getTutorInfo } from "../../../features/availability/services/tutorServices" // ajusta la ruta si es necesario

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
    const authHeader = token? `Bearer ${token}` : undefined;

    const tutor = await getTutorInfo(tutorId, authHeader);

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
    const token = cookies.get('access_token')?.value;
    const authHeader = token ? `Bearer ${token}` : undefined;

    const session = await createSession(data, authHeader);

    return new Response(JSON.stringify(session), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {

    return new Response(
      JSON.stringify({
        message: error.message || 'Error interno del servidor',
      }),
      { status: 500 }
    );
  }
};