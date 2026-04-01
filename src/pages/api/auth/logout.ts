import type { APIRoute } from "astro";
import { logout } from "@/features/auth/services/authService";
import { jwtDecode } from "jwt-decode";

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        const data = await request.json();
        const { id } = data;
        const refreshToken = cookies.get("refresh_token")?.value;
        const accessToken = cookies.get("access_token")?.value;

        //Validar si la sesión se encuentra activa (las cookies existen)
        if (!refreshToken || !accessToken) {
            throw new Error("Acceso no autorizado");
        }

        try {
            // Verificar formato y expiración del JWT (la firma se valida en el backend)
            const decodedToken = jwtDecode<{exp: number}>(accessToken);
            if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
                cookies.delete("access_token", { path: "/" });
                cookies.delete("refresh_token", { path: "/" });
                return new Response(JSON.stringify({ message: "Token inválido o expirado" }), {
                    status: 200,
                });
            }
        } catch (error) {
            // Token JWT inválido/malformado
            cookies.delete("access_token", { path: "/" });
            cookies.delete("refresh_token", { path: "/" });
            return new Response(JSON.stringify({ message: "Sesión cerrada correctamente" }), {
                status: 200,
            });
        }

        const result = await logout({ id, refreshToken }, accessToken);

        cookies.delete("access_token", { path: "/" });
        cookies.delete("refresh_token", { path: "/" });

        return new Response(JSON.stringify({ message: "Sesión cerrada correctamente" }), {
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ message: "Error interno del servidor" }), {
            status: 500,
        });
    }
}