import type { APIRoute } from 'astro';
import { getTutorDashboard } from '@/features/dashboards/services/dashboardService';

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const token = cookies.get('access_token')?.value;

    if (!token) {
      return new Response(
        JSON.stringify({ message: 'No autenticado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await getTutorDashboard(token);

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
