# Plan: Vista de restablecer contraseña (Tarea 5)

**Ruta del link del correo:** `/reset-password?token=4f8c...` (64 hex)  
**Endpoint backend:** `POST /api/v1/auth/password/reset?token=TOKEN`  
**Requiere JWT:** No — es pública  
**Relacionada con:** `password-reset.hbs` (#7)

---

## Contexto

El usuario recibe un correo con un link para restablecer su contraseña. Al hacer clic llega a `/reset-password?token=abc123` — una página pública fuera del dashboard que no requiere sesión activa. El token es un hex de 64 caracteres generado por el backend, expira en 1 hora y es de un solo uso.

---

## Diferencia con ChangePasswordForm (ya existe)

| | `ChangePasswordForm` | `ResetPasswordForm` |
|---|---|---|
| Quién lo usa | Usuario logueado primera vez | Usuario que olvidó contraseña |
| Requiere JWT | ✅ Sí | ❌ No |
| Requiere contraseña actual | ✅ Sí | ❌ No |
| Credencial | Cookie `access_token` | Token en query param del correo |
| Endpoint | `POST /auth/password/change` | `POST /api/v1/auth/password/reset?token=` |
| Ruta frontend | `/change-password` | `/reset-password` |

---

## Estructura de archivos

```
src/
├── pages/
│   ├── reset-password.astro                     (CREAR — página pública en raíz de pages)
│   └── api/
│       └── emailScreens/
│           └── reset-password.ts                (CREAR — BFF route)
├── middleware/
│   └── index.ts                                 (MODIFICAR — agregar /reset-password a rutas públicas)
└── features/
    └── emailScreens/
        └── components/
            └── ResetPasswordForm.tsx             (CREAR — formulario React)
```

---

## Fase 1 — Middleware: excluir la ruta

`/reset-password` debe ser pública. Agregar al listado de rutas no protegidas en `src/middleware/index.ts` junto a `/`, `/confirm-email`, etc.:

```ts
const PUBLIC_ROUTES = ['/', '/confirm-email', '/reset-password'];
const isPublic = PUBLIC_ROUTES.some(r => url.pathname.startsWith(r));
if (isPublic) return next();
```

---

## Fase 2 — Página `reset-password.astro`

Misma estructura visual que `/change-password`:
- Dos columnas: `leftSideContainer` + `rightSideContainer`
- Mismos estilos de layout (`containerChangePassword`, gradiente morado a la derecha, misma imagen `icon.svg`)
- Monta `ResetPasswordForm` con `client:load`
- No requiere ningún guard de autenticación

```astro
---
import { Image } from "astro:assets";
import icon from "../assets/imgs/icon.svg";
import ResetPasswordForm from "@/features/emailScreens/components/ResetPasswordForm";
---

<div class='containerChangePassword'>
  <section class='leftSideContainer'>
    <ResetPasswordForm client:load />
  </section>
  <section class='rightSideContainer'>
    <Image src={icon} alt='Atlas' class='iconAtlas' />
  </section>
</div>

<!-- Mismos estilos de layout que change-password.astro sin modificarlos -->
```

---

## Fase 3 — ResetPasswordForm.tsx

**Archivo:** `src/features/emailScreens/components/ResetPasswordForm.tsx`

Basado visualmente en `ChangePasswordForm.tsx`. Reutiliza exactamente:
- `getStrength`, `STRENGTH_LABELS`, `STRENGTH_CLASS` — copiar desde `ChangePasswordForm.tsx`
- `EyeIcon` — copiar desde `ChangePasswordForm.tsx`
- Clases CSS existentes: `password-input`, `password-input--error`, `password-input--success`, `password-strength-bar--*`, `change-password-form`, `change-password-header`, `change-password-fields`, `change-password-submit`
- Importar `ChangePasswordForm.css` — sin crear CSS nuevo

Diferencias respecto a `ChangePasswordForm`:
- Sin campo de contraseña actual
- Sin `useAuthStore` ni `requiresPasswordChange`
- Lee `token` del query param al montar

### Estados del componente

| Estado | Qué muestra |
|---|---|
| Sin token en URL | Mensaje: "El enlace no es válido" + botón ir a `/` |
| Formulario normal | Dos campos + medidor de fortaleza |
| Submitting | Botón deshabilitado con `sileo` loading |
| Token expirado / inválido | Mensaje: "El enlace expiró o ya fue usado. Solicita uno nuevo desde el login" + botón ir a `/` |
| Éxito | Mensaje de éxito + redirect a `/` después de 2 segundos |

### Lógica del token

```ts
const [token, setToken] = useState<string | null>(null);

useEffect(() => {
  const t = new URLSearchParams(window.location.search).get('token');
  setToken(t); // null si no existe en la URL
}, []);
```

Si `token === null` después del efecto → mostrar estado de error sin renderizar el formulario.

### Validaciones (client-side — deben coincidir con las reglas del backend)

- Mínimo 8 caracteres
- Al menos una mayúscula `/[A-Z]/`
- Al menos una minúscula `/[a-z]/`
- Al menos un número `/\d/`
- Al menos un carácter especial `/[@$!%*?&]/`
- Las contraseñas deben coincidir

### canSubmit

```ts
const canSubmit =
  !!token &&
  lengthOk &&
  strength === 3 &&
  matchOk &&
  !submitting;
```

### Submit

```ts
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!canSubmit) return;
  setSubmitting(true);

  try {
    await sileo.promise(
      fetch('/api/emailScreens/reset-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          token,
          password,
          confirmPassword: confirm,
        }),
      }).then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.message ?? 'Error al restablecer la contraseña');
        }
        return res;
      }),
      {
        loading: { title: 'Restableciendo contraseña...', fill: '#8751ff' },
        success: { title: 'Contraseña restablecida',      fill: '#58d68d' },
        error:   { title: 'Error al restablecer',         fill: '#f35761' },
      }
    );

    // Éxito: redirigir a / después de 2 segundos
    setTimeout(() => navigate('/'), 2000);

  } catch (error: any) {
    // Si el error es de token inválido/expirado, mostrar estado informativo
    if (error.message?.toLowerCase().includes('invalid or expired token')) {
      setTokenExpired(true);
    }
    setSubmitting(false);
  }
};
```

### Render del formulario

```tsx
// Sin token
if (!token) return (
  <div className="change-password-form">
    <p>El enlace no es válido.</p>
    <button onClick={() => navigate('/')}>Ir al login</button>
  </div>
);

// Token expirado tras submit
if (tokenExpired) return (
  <div className="change-password-form">
    <p>El enlace expiró o ya fue usado. Solicita uno nuevo desde el login.</p>
    <button onClick={() => navigate('/')}>Ir al login</button>
  </div>
);

// Formulario normal
return (
  <form className="change-password-form" onSubmit={handleSubmit}>
    <div className="change-password-header">
      <h1 className="change-password-title">
        Restablece tu <span>contraseña</span>
      </h1>
      <p className="change-password-subtitle">
        Ingresa tu nueva contraseña
      </p>
    </div>

    <div className="change-password-fields">
      {/* Nueva contraseña */}
      {/* Confirmar contraseña */}
      {/* Medidor de fortaleza — igual que ChangePasswordForm */}
    </div>

    <button
      type="submit"
      className="change-password-submit"
      disabled={!canSubmit}
    >
      Restablecer contraseña
    </button>
  </form>
);
```

---

## Fase 4 — BFF route `reset-password.ts`

**Archivo:** `src/pages/api/emailScreens/reset-password.ts`

No requiere cookie ni JWT. El token va como query param al backend, el body lleva `password` y `confirmPassword`.

```ts
import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const { token, password, confirmPassword } = await request.json();

  if (!token) {
    return new Response(
      JSON.stringify({ message: 'Token requerido' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const res = await fetch(
    `${import.meta.env.API_URL}/auth/password/reset?token=${token}`,
    {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ password, confirmPassword }),
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

## Casos que cubre el formulario

| Caso | Comportamiento |
|---|---|
| URL sin `?token=` | Error "Enlace no válido" — no renderiza el formulario |
| Token expirado (`Invalid or expired token`) | Estado informativo con botón para volver al login |
| Contraseñas no coinciden | Error inline, botón deshabilitado |
| Contraseña débil (fortaleza < 3) | Medidor de fortaleza, botón deshabilitado |
| 200 OK | Mensaje de éxito + redirect a `/` en 2 segundos |
| Error genérico del servidor | Mensaje de error via `sileo` |

---

## Reglas

- No modificar `ChangePasswordForm.tsx` ni su BFF route existente
- No crear CSS nuevo — reutilizar `ChangePasswordForm.css` importándolo directamente
- El BFF no requiere cookie — solo reenvía token y body al backend
- En éxito redirige a `/` (donde está el login) no a `/dashboard`
- La página no debe estar protegida por el middleware

---

## Checklist de verificación

- [ ] `/reset-password` no está bloqueada por el middleware
- [ ] Sin token en URL → estado de error inmediato sin mostrar el formulario
- [ ] Token expirado → estado informativo, no error genérico
- [ ] Validaciones client-side coinciden con las reglas del backend
- [ ] BFF no requiere cookie — solo reenvía token y body
- [ ] En éxito redirige a `/` después de 2 segundos
- [ ] Mismos estilos visuales que `ChangePasswordForm` sin CSS nuevo
- [ ] `pnpm build` sin errores
