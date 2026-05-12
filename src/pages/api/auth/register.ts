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
<<<<<<< HEAD
<<<<<<< HEAD
	} catch (error: any) {
		return new Response(
			JSON.stringify({ message: getErrorMessage(error.message) }),
=======
	} catch (error: any) {  
		return new Response(
			JSON.stringify({ message: error.message }),
>>>>>>> parent of d3b9c89 (fix: drawe ya solo se abre en confirm email)
=======
	} catch (error: any) {  
		return new Response(
			JSON.stringify({ message: error.message }),
>>>>>>> parent of 98ad86a (feat: mensajes de error personalizados según el tipo de fallo del backend)
			{ status: 400 }
		);
	}
};
