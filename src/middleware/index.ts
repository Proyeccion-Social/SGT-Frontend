import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);

  // Allow static assets to load without authentication
  if (
    url.pathname.startsWith('/_astro/') ||
    url.pathname.startsWith('/favicon') ||
    url.pathname.startsWith('/images')
  ) {
    return next();
  }

  const token = context.cookies.get('access_token')?.value;
  const protectedRoutes = ['/dashboard', '/change-password', '/search', '/availability'];

  // ── Home con token válido → redirigir a dashboard ──
  if (url.pathname === '/' && !url.searchParams.has('session') && token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      if (!isExpired) {
        return context.redirect('/dashboard');
      }
    } catch {
    }
  }

  // ── Rutas protegidas ──
  if (protectedRoutes.some(route => url.pathname.startsWith(route))) {
    // Construir redirect param con path + search originales
    const originalPath = url.pathname + url.search;
    const redirectParam = encodeURIComponent(originalPath);

    let needsRefresh = false;

    if (!token) {
      needsRefresh = true;
    } else {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
          needsRefresh = true;
        }
      } catch {
        needsRefresh = true;
      }
    }

    if (needsRefresh) {
      const refreshToken = context.cookies.get('refresh_token')?.value;

      if (!refreshToken) {
        context.cookies.delete('access_token', { path: '/' });
        return context.redirect(`/?session=expired&redirect=${redirectParam}`);
      }

      try {
        const API_URL = import.meta.env.API_URL;
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (!res.ok) {
          context.cookies.delete('access_token', { path: '/' });
          context.cookies.delete('refresh_token', { path: '/' });
          return context.redirect(`/?session=expired&redirect=${redirectParam}`);
        }

        const data = await res.json();

        context.cookies.set('access_token', data.accessToken, {
          httpOnly: true,
          secure: import.meta.env.PROD,
          sameSite: 'strict',
          path: '/',
          maxAge: 60 * 60,
        });

        context.cookies.set('refresh_token', data.refreshToken, {
          httpOnly: true,
          secure: import.meta.env.PROD,
          sameSite: 'strict',
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
        });
      } catch (err) {
        console.error('[middleware] Error al renovar el token:', err);
        context.cookies.delete('access_token', { path: '/' });
        context.cookies.delete('refresh_token', { path: '/' });
        return context.redirect(`/?session=expired&redirect=${redirectParam}`);
      }
    }
  }

  return next();
});