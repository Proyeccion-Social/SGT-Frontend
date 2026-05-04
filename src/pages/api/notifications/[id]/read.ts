import type { APIRoute } from 'astro';
import { markNotificationAsRead } from '@features/dashboards/services/notificationsService';

export const PATCH: APIRoute = async ({ params, cookies }) => {
  try {
    const token = cookies.get('access_token')?.value;

    if (!token) {
      return new Response(
        JSON.stringify({ message: 'No autenticado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { id } = params;

    if (!id) {
      return new Response(
        JSON.stringify({ message: 'ID de notificación requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await markNotificationAsRead(token, id);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ message: error.message ?? 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
