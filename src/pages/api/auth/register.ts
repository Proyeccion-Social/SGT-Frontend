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
<<<<<<< HEAD
	} catch (error: any) {
		return new Response(
			JSON.stringify({ message: getErrorMessage(error.message) }),
=======
	} catch (error: any) {  
		return new Response(
			JSON.stringify({ message: error.message }),
>>>>>>> parent of d3b9c89 (fix: drawe ya solo se abre en confirm email)
			{ status: 400 }
		);
	}
};
