import type { APIRoute } from "astro";
import { register } from "@/features/auth/services/authService";
import { getErrorMessage } from "@/utils/errorMessages";

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
		return new Response(
			JSON.stringify({ message: getErrorMessage(error.message) }),
			{ status: 400 }
		);
	}
};
