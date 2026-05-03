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

  if (protectedRoutes.some(route => url.pathname.startsWith(route))) {
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
        return context.redirect('/?session=expired');
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
          return context.redirect('/?session=expired');
        }

        const data = await res.json();

        context.cookies.set('access_token', data.accessToken, {
          httpOnly: true,
          path: '/',
          maxAge: 60 * 15, // 15 minutos, consistente con el inicio de sesión
          sameSite: 'strict',
        });
      } catch {
        context.cookies.delete('access_token', { path: '/' });
        context.cookies.delete('refresh_token', { path: '/' });
        return context.redirect('/?session=expired');
      }
    }
  }

  return next();
});