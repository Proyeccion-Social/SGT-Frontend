import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const token = context.cookies.get('access_token')?.value;
  const url = new URL(context.request.url);
  const protectedRoutes = ['/dashboard'];

  // Si va a "/" y tiene token válido, redirigir al dashboard directamente
  if (url.pathname === '/' && !url.searchParams.has('session') && token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      if (!isExpired) {
        return context.redirect('/dashboard');
      }
    } catch {
      // Token inválido, dejar que cargue la landing
    }
  }

  if (protectedRoutes.some(route => url.pathname.startsWith(route))) {
    if (!token) {
      return context.redirect('/?session=expired');
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();

      if (isExpired) {
        // Intenta renovar con el refresh token
        const refreshToken = context.cookies.get('refresh_token')?.value;

        if (!refreshToken) {
          context.cookies.delete('access_token', { path: '/' });
          return context.redirect('/');
        }

        const API_URL = import.meta.env.API_URL;
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (!res.ok) {
          context.cookies.delete('access_token', { path: '/' });
          context.cookies.delete('refresh_token', { path: '/' });
          return context.redirect('/');
        }

        const data = await res.json();

        // Renueva la cookie con el nuevo token
        context.cookies.set('access_token', data.accessToken, {
          httpOnly: true,
          path: '/',
          maxAge: 60 * 60, // 1 hora
          sameSite: 'strict',
        });
      }
    } catch {
        context.cookies.delete('access_token', { path: '/' });
        context.cookies.delete('refresh_token', { path: '/' });
        return context.redirect('/?session=expired');
    }
  }

  return next();
});
