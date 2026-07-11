# Fix: Calendario semanal del tutor aparecía en blanco

## Causa del error

`CalendarSlots.astro` se renderiza en el servidor (SSR). Al hacerlo, llamaba a `getTutorSlots(tutorId)` **sin incluir el token de autenticación**, lo que provocaba una respuesta `401 Unauthorized` del backend. El catch silencioso dejaba `Slots = []` y el calendario se mostraba vacío.

## Archivos modificados

### `src/layouts/availability/CalendarSlots.astro`
```diff
  const tutorId = getUserIdFromCookie(Astro.cookies);
+ const token = Astro.cookies.get("access_token")?.value;

  if (tutorId) {
    try {
-     Slots = await getTutorSlots(tutorId);
+     Slots = await getTutorSlots(tutorId, undefined, token);
    } catch (e: any) {}
  }
```

### `src/features/availability/services/availabilityService.ts`
```diff
  export async function getTutorSlots(
      tutorId: string,
      query?: GetAvailabilityQueryDto,
+     token?: string
  ): Promise<Slot[]> {
+     const headers: HeadersInit = { 'Content-Type': 'application/json' };
+     if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(url, {
          method: 'GET',
-         headers: { 'Content-Type': 'application/json' },
+         headers,
      });
```
