# Plan de Implementación Frontend — Email Action Flows

**Proyecto:** Atlas — Astro + React  
**Relacionado con:** Plan: Email action flows in NestJS (Plan 2)  
**Objetivo:** Implementar las vistas accionables desde correos sin duplicar pantallas ni relajar seguridad, alineado con la arquitectura BFF existente.

---

## Contexto y reglas base

El frontend sigue el **patrón BFF**: los componentes React nunca llaman al NestJS directamente. Toda petición pasa por rutas de Astro (`/api/...`) que leen la cookie HttpOnly `access_token` y reenvían al backend con el header `Authorization: Bearer`.

Las reglas del Plan 2 que el frontend debe respetar:

1. Los links de correo llevan **contexto** (`sessionId`, `requestId`), no autoridad. El backend decide si la acción es válida.
2. Solo `confirm-email` y `reset-password` usan token público. El resto requiere JWT activo.
3. No duplicar pantallas — se crean dialogs dedicados para las acciones de correo, reutilizando componentes existentes cuando sea posible.
4. Si el usuario no está logueado al llegar desde un correo, se redirige al login guardando la URL de retorno.

---

## Flujos a implementar

| Acción | Query params del link | Dialog |
|---|---|---|
| Confirmar/rechazar sesión | `?action=confirm-session&sessionId=123` | `ConfirmSessionDialog` (nuevo) |
| Aceptar/rechazar modificación | `?action=review-modification&requestId=456` | `ReviewModificationDialog` (nuevo) |
| Calificar sesión | `?action=evaluate&sessionId=789` | `EvaluationDialog` (wrapper sobre `MultiStepDialog` existente) |
| Reagendar sesión | `?action=reschedule&sessionId=321` | `RescheduleDialog` (nuevo) |
| Restablecer contraseña | `/auth/reset-password?token=abc` | Página separada en auth |

---

## Qué se reutiliza vs qué se crea

| Componente / Archivo | Acción | Motivo |
|---|---|---|
| `MultiStepDialog` | **Reutilizar tal cual** | Ya tiene toda la lógica de evaluación, los steps, las estrellas y los BFF routes |
| `SessionDialogManager` | **No se toca** | Maneja el flujo desde el historial, no desde correos |
| `/api/history/evaluation-questions` | **Reutilizar** | Ya existe y funciona |
| `/api/history/evaluation-status` | **Reutilizar** | Ya existe y funciona |
| `/api/history/send-evaluation` | **Reutilizar** | Ya existe y funciona |
| `EmailActionController` | Crear nuevo | Orquestador del flujo de correos |
| `ConfirmSessionDialog` | Crear nuevo | Lógica específica del flujo |
| `ReviewModificationDialog` | Crear nuevo | Lógica específica del flujo |
| `EvaluationDialog` | Crear nuevo (wrapper ~20 líneas) | Solo agrega el banner de recordatorio y monta `MultiStepDialog` |
| `RescheduleDialog` | Crear nuevo | Lógica específica del flujo |
| `DialogShell` | Crear nuevo | Base visual compartida entre los dialogs nuevos |

---

## Estructura de archivos

```
src/
├── middleware.ts                           (MODIFICAR — agregar redirect con retorno)
├── pages/
│   ├── dashboard.astro                     (MODIFICAR — montar EmailActionController)
│   ├── auth/
│   │   └── reset-password.astro            (CREAR — página pública, fuera del dashboard)
│   └── api/
│       ├── sessions/
│       │   ├── [sessionId].ts              (CREAR — GET datos de sesión por ID)
│       │   ├── confirm-session.ts          (CREAR — POST confirmar sesión)
│       │   └── reject-session.ts           (CREAR — POST rechazar sesión)
│       └── modification-requests/
│           ├── [requestId].ts              (CREAR — GET datos de propuesta)
│           ├── accept.ts                   (CREAR — POST aceptar modificación)
│           └── reject.ts                   (CREAR — POST rechazar modificación)
│       (evaluations/submit NO se crea — ya existe en /api/history/send-evaluation)
└── features/
    └── sessions/
        └── components/
            ├── EmailActionController.tsx    (CREAR — orquestador de dialogs de correo)
            ├── ConfirmSessionDialog.tsx     (CREAR)
            ├── ReviewModificationDialog.tsx (CREAR)
            ├── EvaluationDialog.tsx         (CREAR — wrapper delgado sobre MultiStepDialog)
            ├── RescheduleDialog.tsx         (CREAR)
            └── shared/
                └── DialogShell.tsx          (CREAR — base reutilizable para todos los dialogs)
```

---

## Fase 1 — Middleware: protección y redirect con retorno

**Archivo:** `src/middleware.ts`

El middleware ya existe. Se ajusta para que cuando un usuario no logueado llegue desde un link de correo, guarde la URL completa (incluyendo los query params) y lo mande al login.

```ts
// src/middleware.ts
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(({ url, cookies, redirect }) => {
  const token = cookies.get('access_token')?.value;
  const isProtected = url.pathname.startsWith('/dashboard');

  if (isProtected && !token) {
    // Guarda la URL completa: /dashboard?action=confirm-session&sessionId=123
    const returnUrl = encodeURIComponent(url.pathname + url.search);
    return redirect(`/login?redirect=${returnUrl}`);
  }
});
```

**En la página de login**, después de autenticar exitosamente, agregar:

```ts
const params = new URLSearchParams(window.location.search);
const redirectTo = params.get('redirect');
window.location.href = redirectTo ? decodeURIComponent(redirectTo) : '/dashboard';
```

---

## Fase 2 — Dashboard: montar el EmailActionController

**Archivo:** `src/pages/dashboard.astro`

Solo se agrega el nuevo componente junto a los existentes. No se toca nada más.

```astro
---
// src/pages/dashboard.astro
---
<Layout>
  <DashboardSessionManager client:load role={role} />
  <EmailActionController client:load />  <!-- NUEVO -->
</Layout>
```

---

## Fase 3 — EmailActionController

**Archivo:** `src/features/sessions/components/EmailActionController.tsx`

Es el corazón del flujo. Lee los query params al montar, llama al BFF para obtener los datos del recurso y renderiza el dialog correspondiente.

```tsx
import { useEffect, useState } from 'react';
import { ConfirmSessionDialog }      from './ConfirmSessionDialog';
import { ReviewModificationDialog }  from './ReviewModificationDialog';
import { EvaluationDialog }          from './EvaluationDialog';
import { RescheduleDialog }          from './RescheduleDialog';

type Action = 'confirm-session' | 'review-modification' | 'evaluate' | 'reschedule';
export type DialogStatus = 'loading' | 'ok' | 'error' | 'forbidden' | 'expired';

// Cada acción sabe qué param leer y a qué BFF llamar
const ACTION_CONFIG: Record<Action, {
  getResourceId: (p: URLSearchParams) => string | null;
  endpoint:      (id: string) => string;
}> = {
  'confirm-session': {
    getResourceId: (p) => p.get('sessionId'),
    endpoint:      (id) => `/api/sessions/${id}`,
  },
  'review-modification': {
    getResourceId: (p) => p.get('requestId'),
    endpoint:      (id) => `/api/modification-requests/${id}`,
  },
  'evaluate': {
    getResourceId: (p) => p.get('sessionId'),
    endpoint:      (id) => `/api/sessions/${id}`,
  },
  'reschedule': {
    getResourceId: (p) => p.get('sessionId'),
    endpoint:      (id) => `/api/sessions/${id}`,
  },
};

const DIALOG_MAP: Record<Action, React.ComponentType<any>> = {
  'confirm-session':     ConfirmSessionDialog,
  'review-modification': ReviewModificationDialog,
  'evaluate':            EvaluationDialog,
  'reschedule':          RescheduleDialog,
};

export function EmailActionController() {
  const [action,     setAction]     = useState<Action | null>(null);
  const [resourceId, setResourceId] = useState<string | null>(null);
  const [data,       setData]       = useState<any>(null);
  const [status,     setStatus]     = useState<DialogStatus>('loading');

  useEffect(() => {
    const params    = new URLSearchParams(window.location.search);
    const rawAction = params.get('action') as Action | null;

    if (!rawAction || !ACTION_CONFIG[rawAction]) return; // No es un link de correo

    const config = ACTION_CONFIG[rawAction];
    const id     = config.getResourceId(params);

    if (!id) return;

    setAction(rawAction);
    setResourceId(id);

    fetch(config.endpoint(id), { credentials: 'include' })
      .then(async (r) => {
        if (r.status === 401) {
          // No logueado — redirige al login guardando la URL completa
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.href)}`;
          return;
        }
        if (r.status === 403) { setStatus('forbidden'); return; }
        if (r.status === 410) { setStatus('expired');   return; }
        if (!r.ok)            { setStatus('error');     return; }

        const json = await r.json();
        setData(json);
        setStatus('ok');
      })
      .catch(() => setStatus('error'));
  }, []);

  // Limpia los query params de la URL al cerrar sin recargar la página
  const handleClose = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('action');
    url.searchParams.delete('sessionId');
    url.searchParams.delete('requestId');
    window.history.replaceState({}, '', url.toString());
    setAction(null);
    setData(null);
    setStatus('loading');
  };

  if (!action) return null;

  const Dialog = DIALOG_MAP[action];
  return <Dialog data={data} status={status} resourceId={resourceId} onClose={handleClose} />;
}
```

---

## Fase 4 — DialogShell (base compartida)

**Archivo:** `src/features/sessions/components/shared/DialogShell.tsx`

Todos los dialogs nuevos usan este shell. Reutiliza las mismas clases CSS de los modales existentes (`modal-overlay`, `modal-card`, `modal-card__close`) para mantener consistencia visual sin duplicar estilos.

```tsx
interface Props {
  children: React.ReactNode;
  onClose:  () => void;
}

export function DialogShell({ children, onClose }: Props) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <button className="modal-card__close" onClick={onClose} aria-label="Cerrar">✕</button>
        {children}
      </div>
    </div>
  );
}
```

---

## Fase 5 — Los 4 dialogs

### ConfirmSessionDialog

**Tarea relacionada:** Tarea 2 — Vista de confirmar/rechazar solicitud de sesión  
**Archivo:** `src/features/sessions/components/ConfirmSessionDialog.tsx`

Muestra los datos completos de la sesión solicitada. Si el tutor rechaza, aparece un campo de motivo obligatorio antes de confirmar el rechazo.

**Estados que maneja:**

| Estado | Qué muestra |
|---|---|
| `loading` | Spinner / skeleton |
| `ok` | Datos de la sesión + botones Confirmar / Rechazar |
| `expired` | Mensaje informativo: la solicitud expiró |
| `forbidden` | Mensaje de error de permisos |
| `confirmed` | Mensaje de éxito |
| `rejected` | Mensaje de rechazo confirmado |

**Llamadas al BFF:**
- El `EmailActionController` ya cargó los datos via `GET /api/sessions/[sessionId]`
- `POST /api/sessions/confirm-session` — body: `{ sessionId }`
- `POST /api/sessions/reject-session` — body: `{ sessionId, reason }`

```tsx
import { useState } from 'react';
import { DialogShell } from './shared/DialogShell';

interface Props {
  data:       any;
  status:     string;
  resourceId: string | null;
  onClose:    () => void;
}

export function ConfirmSessionDialog({ data, status, resourceId, onClose }: Props) {
  const [rejectReason, setRejectReason] = useState('');
  const [showReject,   setShowReject]   = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [result,       setResult]       = useState<'confirmed' | 'rejected' | null>(null);

  if (status === 'loading')   return <DialogShell onClose={onClose}><p>Cargando sesión…</p></DialogShell>;
  if (status === 'forbidden') return <DialogShell onClose={onClose}><p>No tienes permiso para ver esta solicitud.</p></DialogShell>;
  if (status === 'expired')   return <DialogShell onClose={onClose}><p>Esta solicitud ya expiró.</p></DialogShell>;
  if (status === 'error')     return <DialogShell onClose={onClose}><p>Error al cargar la solicitud.</p></DialogShell>;
  if (result === 'confirmed') return <DialogShell onClose={onClose}><p>✅ Sesión confirmada exitosamente.</p></DialogShell>;
  if (result === 'rejected')  return <DialogShell onClose={onClose}><p>Sesión rechazada.</p></DialogShell>;

  const handleConfirm = async () => {
    setSubmitting(true);
    const res = await fetch('/api/sessions/confirm-session', {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      body:        JSON.stringify({ sessionId: resourceId }),
      credentials: 'include',
    });
    setSubmitting(false);
    if (res.ok) setResult('confirmed');
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setSubmitting(true);
    const res = await fetch('/api/sessions/reject-session', {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      body:        JSON.stringify({ sessionId: resourceId, reason: rejectReason }),
      credentials: 'include',
    });
    setSubmitting(false);
    if (res.ok) setResult('rejected');
  };

  return (
    <DialogShell onClose={onClose}>
      <h2>Solicitud de sesión</h2>
      <div className="session-info">
        <p><strong>Estudiante:</strong>  {data.student?.name}</p>
        <p><strong>Materia:</strong>     {data.subject?.name}</p>
        <p><strong>Título:</strong>      {data.title}</p>
        <p><strong>Fecha:</strong>       {data.scheduledDate}</p>
        <p><strong>Horario:</strong>     {data.startTime} – {data.endTime}</p>
        <p><strong>Modalidad:</strong>   {data.modality}</p>
        <p><strong>Descripción:</strong> {data.description}</p>
        {data.expiresAt && (
          <p className="expiration">Expira: {new Date(data.expiresAt).toLocaleString()}</p>
        )}
      </div>

      {showReject && (
        <textarea
          placeholder="Motivo del rechazo (obligatorio)"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={3}
        />
      )}

      <div className="dialog-footer">
        {!showReject ? (
          <>
            <button onClick={() => setShowReject(true)} disabled={submitting}>Rechazar</button>
            <button onClick={handleConfirm} disabled={submitting}>
              {submitting ? 'Confirmando…' : 'Confirmar'}
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setShowReject(false)} disabled={submitting}>Volver</button>
            <button onClick={handleReject} disabled={submitting || !rejectReason.trim()}>
              {submitting ? 'Rechazando…' : 'Confirmar rechazo'}
            </button>
          </>
        )}
      </div>
    </DialogShell>
  );
}
```

---

### ReviewModificationDialog

**Tarea relacionada:** Tarea 1 — Vista de aceptar/rechazar propuesta de modificación  
**Archivo:** `src/features/sessions/components/ReviewModificationDialog.tsx`

Muestra los datos actuales de la sesión **y** los cambios propuestos visualmente diferenciados. Muestra la fecha de expiración de la propuesta.

**Estados que maneja:**

| Estado | Qué muestra |
|---|---|
| `loading` | Spinner / skeleton |
| `ok` | Datos actuales + cambios propuestos + botones |
| `expired` | Mensaje informativo: la propuesta expiró |
| `forbidden` | Mensaje de error de permisos |
| `accepted` | Mensaje de éxito |
| `rejected` | Mensaje de rechazo confirmado |

**Llamadas al BFF:**
- El `EmailActionController` ya cargó los datos via `GET /api/modification-requests/[requestId]`
- `POST /api/modification-requests/accept` — body: `{ requestId }`
- `POST /api/modification-requests/reject` — body: `{ requestId }`

**Nota importante (Plan 2, punto 4-6):** El backend devuelve la request específica por `requestId`, no "la primera pendiente". El frontend pasa el `requestId` en todas las llamadas de acción.

```tsx
import { useState } from 'react';
import { DialogShell } from './shared/DialogShell';

interface Props {
  data:       any;
  status:     string;
  resourceId: string | null;
  onClose:    () => void;
}

export function ReviewModificationDialog({ data, status, resourceId, onClose }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [result,     setResult]     = useState<'accepted' | 'rejected' | null>(null);

  if (status === 'loading')   return <DialogShell onClose={onClose}><p>Cargando propuesta…</p></DialogShell>;
  if (status === 'expired')   return <DialogShell onClose={onClose}><p>Esta propuesta ya expiró.</p></DialogShell>;
  if (status === 'forbidden') return <DialogShell onClose={onClose}><p>No tienes permiso.</p></DialogShell>;
  if (status === 'error')     return <DialogShell onClose={onClose}><p>Error al cargar la propuesta.</p></DialogShell>;
  if (result === 'accepted')  return <DialogShell onClose={onClose}><p>✅ Modificación aceptada.</p></DialogShell>;
  if (result === 'rejected')  return <DialogShell onClose={onClose}><p>Modificación rechazada.</p></DialogShell>;

  const handleAction = async (action: 'accept' | 'reject') => {
    setSubmitting(true);
    const res = await fetch(`/api/modification-requests/${action}`, {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      body:        JSON.stringify({ requestId: resourceId }),
      credentials: 'include',
    });
    setSubmitting(false);
    if (res.ok) setResult(action === 'accept' ? 'accepted' : 'rejected');
  };

  return (
    <DialogShell onClose={onClose}>
      <h2>Propuesta de modificación</h2>

      {/* Datos actuales de la sesión */}
      <section>
        <h3>Sesión actual</h3>
        <p><strong>Fecha:</strong>     {data.session?.scheduledDate}</p>
        <p><strong>Modalidad:</strong> {data.session?.modality}</p>
        <p><strong>Horario:</strong>   {data.session?.startTime} – {data.session?.endTime}</p>
      </section>

      {/* Cambios propuestos — visualmente diferenciados */}
      <section className="proposed-changes">
        <h3>Cambios propuestos</h3>
        {data.newModality      && <p><strong>Nueva modalidad:</strong> {data.newModality}</p>}
        {data.newDurationHours && <p><strong>Nueva duración:</strong>  {data.newDurationHours}h</p>}
        {data.expiresAt && (
          <p className="expiration">Expira: {new Date(data.expiresAt).toLocaleString()}</p>
        )}
      </section>

      <div className="dialog-footer">
        <button onClick={() => handleAction('reject')} disabled={submitting}>Rechazar</button>
        <button onClick={() => handleAction('accept')} disabled={submitting}>
          {submitting ? 'Procesando…' : 'Aceptar'}
        </button>
      </div>
    </DialogShell>
  );
}
```

---

### EvaluationDialog

**Tarea relacionada:** Tarea 4 — Vista de calificación post-sesión  
**Archivo:** `src/features/sessions/components/EvaluationDialog.tsx`

Este es el caso donde **se reutiliza `MultiStepDialog` existente**. El componente ya tiene toda la lógica implementada: los steps, las estrellas, la verificación de si ya fue calificada y el envío al BFF. Este wrapper solo agrega el banner de recordatorio.

**BFF routes que ya existen y se reutilizan — no se crea ninguno nuevo:**
- `GET /api/history/evaluation-questions`
- `GET /api/history/evaluation-status?sessionId=&studentId=`
- `POST /api/history/send-evaluation`

```tsx
import { DialogShell } from './shared/DialogShell';
import MultiStepDialog from '@/features/history/components/MultiStepRating';

interface Props {
  data:       any;
  status:     string;
  resourceId: string | null;
  onClose:    () => void;
}

export function EvaluationDialog({ data, status, onClose }: Props) {
  if (status === 'loading')   return <DialogShell onClose={onClose}><p>Cargando sesión…</p></DialogShell>;
  if (status === 'forbidden') return <DialogShell onClose={onClose}><p>No tienes permiso.</p></DialogShell>;
  if (status === 'error')     return <DialogShell onClose={onClose}><p>Error al cargar la sesión.</p></DialogShell>;

  return (
    <div>
      {/* Banner de recordatorio — solo aparece si el correo era un recordatorio */}
      {data?.isReminder && (
        <div className="reminder-banner">
          ⏰ Recordatorio: aún no has calificado esta sesión
        </div>
      )}

      {/* MultiStepDialog ya maneja: estado "ya calificado", steps, estrellas y envío */}
      <MultiStepDialog
        session={data}
        userId={data?.student?.id}
        onClose={onClose}
      />
    </div>
  );
}
```

---

### RescheduleDialog

**Tarea relacionada:** Tarea 3 — Vista de reagendar sesión  
**Archivo:** `src/features/sessions/components/RescheduleDialog.tsx`

No es un formulario de acción. Muestra el resumen de la sesión cancelada/rechazada como contexto y redirige al buscador de tutores pre-filtrado por la materia.

**Llamadas al BFF:**
- El `EmailActionController` ya cargó los datos via `GET /api/sessions/[sessionId]`
- No hace POST — solo redirige al buscador con la materia pre-filtrada

```tsx
import { DialogShell } from './shared/DialogShell';

interface Props {
  data:    any;
  status:  string;
  onClose: () => void;
}

export function RescheduleDialog({ data, status, onClose }: Props) {
  if (status === 'loading') return <DialogShell onClose={onClose}><p>Cargando…</p></DialogShell>;
  if (status === 'error')   return <DialogShell onClose={onClose}><p>Error al cargar la sesión.</p></DialogShell>;

  const handleReschedule = () => {
    // Pre-filtra el buscador por la materia de la sesión cancelada
    window.location.href = `/search?subject=${data?.subject?.id}`;
  };

  return (
    <DialogShell onClose={onClose}>
      <h2>Tu sesión fue cancelada</h2>

      {/* Resumen de la sesión cancelada como contexto */}
      <div className="cancelled-summary">
        <p><strong>Sesión:</strong>  {data?.title}</p>
        <p><strong>Materia:</strong> {data?.subject?.name}</p>
        <p><strong>Fecha:</strong>   {data?.scheduledDate}</p>
      </div>

      <p>¿Quieres buscar un nuevo tutor para la misma materia?</p>

      <div className="dialog-footer">
        <button onClick={onClose}>Ahora no</button>
        <button onClick={handleReschedule}>Buscar tutor</button>
      </div>
    </DialogShell>
  );
}
```

---

## Fase 6 — BFF routes nuevas (Astro API)

Todas siguen el mismo patrón de las rutas existentes: leen la cookie y reenvían al NestJS con Bearer.

### `GET /api/sessions/[sessionId].ts`

```ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, cookies }) => {
  const token = cookies.get('access_token')?.value;
  if (!token) return new Response(JSON.stringify({ message: 'No autenticado' }), { status: 401 });

  const res = await fetch(
    `${import.meta.env.API_URL}/sessions/${params.sessionId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status:  res.status,
    headers: { 'Content-Type': 'application/json' },
  });
};
```

### `POST /api/sessions/confirm-session.ts`

```ts
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies }) => {
  const token = cookies.get('access_token')?.value;
  if (!token) return new Response(JSON.stringify({ message: 'No autenticado' }), { status: 401 });

  const { sessionId } = await request.json();

  const res = await fetch(
    `${import.meta.env.API_URL}/sessions/${sessionId}/confirm`,
    {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    }
  );

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status:  res.status,
    headers: { 'Content-Type': 'application/json' },
  });
};
```

### `POST /api/sessions/reject-session.ts`

```ts
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies }) => {
  const token = cookies.get('access_token')?.value;
  if (!token) return new Response(JSON.stringify({ message: 'No autenticado' }), { status: 401 });

  const { sessionId, reason } = await request.json();

  const res = await fetch(
    `${import.meta.env.API_URL}/sessions/${sessionId}/reject`,
    {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ reason }),
    }
  );

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status:  res.status,
    headers: { 'Content-Type': 'application/json' },
  });
};
```

### `GET /api/modification-requests/[requestId].ts`

```ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, cookies }) => {
  const token = cookies.get('access_token')?.value;
  if (!token) return new Response(JSON.stringify({ message: 'No autenticado' }), { status: 401 });

  const res = await fetch(
    `${import.meta.env.API_URL}/sessions/modification-requests/${params.requestId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status:  res.status,
    headers: { 'Content-Type': 'application/json' },
  });
};
```

### `POST /api/modification-requests/accept.ts`

```ts
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies }) => {
  const token = cookies.get('access_token')?.value;
  if (!token) return new Response(JSON.stringify({ message: 'No autenticado' }), { status: 401 });

  const { requestId } = await request.json();

  const res = await fetch(
    `${import.meta.env.API_URL}/sessions/modification-requests/${requestId}/accept`,
    {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    }
  );

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status:  res.status,
    headers: { 'Content-Type': 'application/json' },
  });
};
```

### `POST /api/modification-requests/reject.ts`

```ts
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies }) => {
  const token = cookies.get('access_token')?.value;
  if (!token) return new Response(JSON.stringify({ message: 'No autenticado' }), { status: 401 });

  const { requestId } = await request.json();

  const res = await fetch(
    `${import.meta.env.API_URL}/sessions/modification-requests/${requestId}/reject`,
    {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    }
  );

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status:  res.status,
    headers: { 'Content-Type': 'application/json' },
  });
};
```

---

## Fase 7 — Reset de contraseña (página separada)

**Tarea relacionada:** Tarea 5 — Vista de restablecer contraseña  
**Ruta:** `/auth/reset-password?token=abc`  
**Archivo:** `src/pages/auth/reset-password.astro`

Es la **única vista que no va al dashboard** y no requiere JWT. El token del correo es la credencial temporal. El middleware **no debe proteger esta ruta**.

El componente React de esta página:

1. Lee el `token` del query param al montar
2. Muestra formulario con dos campos: nueva contraseña y confirmar contraseña
3. Valida: mínimo 8 caracteres, mayúsculas, minúsculas, números y caracteres especiales
4. Si el token expiró (backend responde con error), muestra mensaje con opción de solicitar uno nuevo
5. Al completar exitosamente, redirige a `/login` con mensaje de éxito

**BFF route:** Confirmar con el backend si ya existe `POST /api/auth/reset-password`. Si no existe como BFF, crearlo siguiendo el mismo patrón pero sin requerir cookie (el token del correo va en el body).

---

## Fase 8 — Contratos esperados del backend

Para que el frontend funcione, el backend debe cumplir estos contratos. **Coordinar con el equipo de backend antes de implementar.**

### `GET /sessions/:sessionId`

```json
{
  "id": "123",
  "title": "Cálculo diferencial",
  "description": "...",
  "scheduledDate": "2026-05-10",
  "startTime": "10:00",
  "endTime": "11:00",
  "modality": "VIRT",
  "status": "PENDING_TUTOR_CONFIRMATION",
  "subject":    { "id": "1",  "name": "Cálculo" },
  "student":    { "id": "55", "name": "Ana García" },
  "tutor":      { "id": "22", "name": "Carlos López" },
  "expiresAt":  "2026-05-11T10:00:00Z",
  "isReminder": false
}
```

### `GET /sessions/modification-requests/:requestId`

```json
{
  "id": "456",
  "status":     "PENDING",
  "expiresAt":  "2026-05-11T10:00:00Z",
  "proposedBy": "tutor",
  "session": {
    "id":            "123",
    "scheduledDate": "2026-05-10",
    "startTime":     "10:00",
    "endTime":       "11:00",
    "modality":      "VIRT"
  },
  "newModality":       "PRES",
  "newDurationHours":  2,
  "newAvailabilityId": null
}
```

### Códigos HTTP que el frontend maneja

| Situación | Código | Estado en el dialog |
|---|---|---|
| No autenticado | 401 | Redirige a `/login?redirect=...` |
| No es el dueño | 403 | Estado `forbidden` |
| Recurso expirado | 410 | Estado `expired` |
| Recurso no encontrado | 404 | Estado `error` |
| Error genérico | 500 | Estado `error` |

---

## Resumen completo — qué se toca y qué no

| Archivo | Acción |
|---|---|
| `middleware.ts` | Modificar — agregar `?redirect=` con URL completa |
| `dashboard.astro` | Modificar — agregar `<EmailActionController client:load />` |
| Login handler | Modificar — leer `?redirect=` y redirigir tras login exitoso |
| `EmailActionController.tsx` | Crear nuevo |
| `ConfirmSessionDialog.tsx` | Crear nuevo |
| `ReviewModificationDialog.tsx` | Crear nuevo |
| `EvaluationDialog.tsx` | Crear nuevo (wrapper ~20 líneas sobre `MultiStepDialog`) |
| `RescheduleDialog.tsx` | Crear nuevo |
| `DialogShell.tsx` | Crear nuevo |
| `reset-password.astro` | Crear nuevo |
| `GET /api/sessions/[sessionId].ts` | Crear nuevo BFF |
| `POST /api/sessions/confirm-session.ts` | Crear nuevo BFF |
| `POST /api/sessions/reject-session.ts` | Crear nuevo BFF |
| `GET /api/modification-requests/[requestId].ts` | Crear nuevo BFF |
| `POST /api/modification-requests/accept.ts` | Crear nuevo BFF |
| `POST /api/modification-requests/reject.ts` | Crear nuevo BFF |
| `MultiStepDialog.tsx` | **No se toca** |
| `SessionDialogManager.tsx` | **No se toca** |
| `DashboardSessionManager.tsx` | **No se toca** |
| `SessionDetailModal.tsx` | **No se toca** |
| `/api/history/evaluation-questions` | **No se toca** |
| `/api/history/evaluation-status` | **No se toca** |
| `/api/history/send-evaluation` | **No se toca** |
| Todos los servicios y hooks existentes | **No se toca** |

---

## Checklist de verificación

- [ ] Al llegar desde un correo sin sesión activa, redirige al login y vuelve al dialog correcto después
- [ ] Cada dialog muestra estado `loading` mientras carga los datos
- [ ] Cada dialog muestra estado informativo si el recurso expiró — no un error genérico
- [ ] `ConfirmSessionDialog` requiere motivo obligatorio al rechazar
- [ ] `ReviewModificationDialog` usa el `requestId` específico en todas sus llamadas — no la primera request pendiente
- [ ] `EvaluationDialog` muestra banner si `data.isReminder === true`
- [ ] `EvaluationDialog` delega toda la lógica a `MultiStepDialog` sin duplicarla
- [ ] `RescheduleDialog` pre-filtra el buscador por `subject.id` de la sesión cancelada
- [ ] `reset-password.astro` NO está protegida por el middleware
- [ ] Todas las BFF routes nuevas leen la cookie y reenvían con Bearer — igual que las existentes
- [ ] Al cerrar cualquier dialog, los query params se limpian de la URL sin recargar la página
- [ ] El `sessionId` o `requestId` en la URL es solo contexto — el backend valida ownership con JWT
