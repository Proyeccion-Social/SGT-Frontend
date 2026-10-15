export const getFrontendUrl = (requestedUrl?: unknown): string => {
  if (typeof requestedUrl === 'string' && requestedUrl) return requestedUrl;

  if (typeof window !== 'undefined') return window.location.origin;

  const vercelUrl = import.meta.env.VERCEL_URL;
  return vercelUrl ? `https://${vercelUrl}` : 'http://localhost:3000';
};