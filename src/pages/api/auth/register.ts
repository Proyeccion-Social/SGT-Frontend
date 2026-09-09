import type { APIRoute } from "astro";
import { register } from "@/features/auth/services/authService";
import { getFrontendUrl } from "@/lib/frontendUrl";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
	try {
		const { frontendUrl, ...data } = await request.json();
		const result = await register({ ...data, frontendUrl: getFrontendUrl(frontendUrl) });

		return new Response(
			JSON.stringify({ user: result.user }),	
			{
				status: 200,
				headers: { "Content-Type": "application/json" }
			}
		);
	} catch (error: any) {  
		return new Response(
			JSON.stringify({ message: error.message }),
			{ status: 400 }
		);
	}
};