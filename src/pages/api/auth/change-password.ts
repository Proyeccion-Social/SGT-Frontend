import type { APIRoute } from "astro";
import { changePassword } from "@/features/auth/services/authService";
import { getErrorMessage } from "@/utils/errorMessages";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        const accessToken = cookies.get("access_token")?.value;

        if (!accessToken) {
            return new Response(JSON.stringify({ message: "Acceso no autorizado" }), {
                status: 401,
            });
        }

        const data = await request.json();

        await changePassword(data, accessToken);

        return new Response(JSON.stringify({ message: "Contraseña actualizada correctamente" }), {
            status: 200,
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ message: getErrorMessage(error.message) ?? "Error al cambiar la contraseña" }), {
            status: 500,
        });
    }
};
