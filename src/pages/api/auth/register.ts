import type { APIRoute } from "astro";
import { register } from "@/features/auth/services/authService";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
	try {
		const data = await request.json();
		const result = await register(data);

		return new Response(
			JSON.stringify({ user: result.user }),
			{
				status: 200,
				headers: { "Content-Type": "application/json" }
			}
		);
	} catch (error: any) {
		console.error("[BFF /api/auth/register] Error del backend:", error.message);
		return new Response(
			JSON.stringify({ message: error.message }),
			{ status: 400, headers: { "Content-Type": "application/json" } }
		);
	}
};
