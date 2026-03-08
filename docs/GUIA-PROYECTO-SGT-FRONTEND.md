# Guía del proyecto: SGT-Frontend (Astro)

> Objetivo: explicarte **qué es cada carpeta/archivo**, **cómo se conecta todo** y **para qué sirve**, asumiendo que estás aprendiendo desde cero.

---

## 1) ¿Qué es este proyecto?

Este repo es el **frontend** del “Sistema de Agendamiento de Tutorías”. Está hecho con **Astro** (un framework para sitios/apps web) y usa **React** solo para algunas piezas (por ejemplo, el toaster de notificaciones).

La idea principal es:

- **Páginas** (rutas) viven en `src/pages/`.
- **Layouts** (plantillas comunes) viven en `src/layouts/`.
- **Features** (módulos por funcionalidad) viven en `src/features/`.
- La conexión con el backend se hace con un patrón tipo **BFF**: el frontend llama a `/api/...` (rutas internas de Astro) y esas rutas internas llaman al backend real usando una variable `API_URL`.

---

## 2) Cómo se corre (modo dev/build)

En `package.json` están los scripts:

- `npm run dev` → levanta el servidor local de Astro.
- `npm run build` → genera el build.
- `npm run preview` → previsualiza el build.

> Nota: el proyecto usa `pnpm-lock.yaml`, así que probablemente el equipo usa **pnpm**; pero con npm también suele funcionar si las dependencias están bien.

---

## 3) Estructura general del repo

### Archivos raíz

- `astro.config.mjs`: configuración de Astro. Aquí se integra React.
- `tsconfig.json`: configuración de TypeScript. Define alias como `@/`, `@features/`, etc.
- `README.md`: info mínima del repo.
- `docs/`: documentación interna del proyecto.

### Carpetas principales

- `public/`: assets servidos tal cual (favicon, etc.).
- `src/`: el código principal.

---

## 4) `src/` explicado (carpeta por carpeta)

### 4.1) `src/pages/` — Rutas (URLs)

En Astro, cada archivo dentro de `src/pages` crea una ruta.

Ejemplos en este proyecto:

- `src/pages/index.astro` → ruta `/` (Home / Landing)
- `src/pages/dashboard.astro` → ruta `/dashboard`
- `src/pages/auth/login.astro` → ruta `/auth/login`
- `src/pages/auth/register.astro` → ruta `/auth/register`

#### 4.1.1) `src/pages/api/` — API interna (BFF)

Astro permite crear endpoints server-side dentro del frontend. En este repo están en:

- `src/pages/api/auth/login.ts`
- `src/pages/api/auth/register.ts`
- `src/pages/api/auth/recover-password.ts`
- `src/pages/api/auth/validate-email.ts`
- `src/pages/api/auth/logout.ts` (actualmente está vacío / sin implementación)

Estas rutas se consumen desde el navegador con `fetch("/api/auth/...")`.

**¿Por qué existe esto?**

Porque así puedes:

- Guardar tokens en cookies **httpOnly** (más seguro que localStorage).
- Evitar exponer directamente la URL del backend y/o lidiar con CORS.
- Centralizar manejo de errores y formato de respuestas.

---

### 4.2) `src/layouts/` — Plantillas de página

Un layout es un “cascarón” reutilizable.

- `src/layouts/Layout.astro`:
  - Define el HTML base (`<!doctype html>`, `<head>`, meta viewport, `<title>`).
  - Importa `src/styles/global.css`.

También hay layouts específicos:

- `src/layouts/auth/AuthDialogLayout.astro`:
  - Es un layout para mostrar un `<dialog>` (modal) centrado.
  - Incluye el componente React `ToasterReact` para notificaciones.

- `src/layouts/auth/AuthDialogsContainer.astro`:
  - Contenedor + backdrop compartido para que varios diálogos (login/forgot) compartan la capa oscura con blur.

- `src/layouts/dashboards/*.astro`:
  - `AdminDashboard.astro`, `StudentDashboard.astro`, `TutorDashboard.astro`.
  - Hoy usan datos “mock” (falsos) y sirven para maquetar UI.

> Importante: actualmente `src/pages/auth/register.astro` importa `@/layouts/AuthLayout.astro`, pero ese archivo no existe. Probablemente es un nombre viejo o faltante.

---

### 4.3) `src/features/` — Funcionalidades agrupadas (feature-based)

Aquí el proyecto está organizado por dominios:

#### Landing (`src/features/landing/`)

- `components/`: piezas de la página principal (`Nav`, `Header`, `Cards`, `Footer`, etc.).
- `assets/`: íconos e imágenes de la landing.
- `utils/`: constantes usadas por la landing.

El home (`src/pages/index.astro`) arma la landing importando:

- `PrincipalContent.astro` (que a su vez monta `Nav`, `Header`, etc.).

#### Auth (`src/features/auth/`)

- `components/`: formularios y modales (login, registro, recuperar contraseña).
- `services/`: funciones que llaman al backend real (usando `API_URL`).
- `types.ts`: tipos TS del feature.

En auth se usa bastante `sileo` para mostrar estados:

- loading
- success
- error

#### Dashboards (`src/features/dashboards/`)

- `components/`: sidebar, cards, badges.
- `icons/`: íconos usados en el dashboard.

La página `src/pages/dashboard.astro` decide qué dashboard mostrar (admin/student/tutor) con una variable `userRole` (mock).

---

### 4.4) `src/styles/` — Estilos globales + tokens

- `src/styles/global.css`:
  - Reset CSS
  - Fonts
  - Importa estilos de `sileo` (`@import "sileo/styles.css"`)

- `src/styles/variables.css`:
  - Variables CSS de diseño: colores, tamaños, tipografías, breakpoints.
  - Breakpoints estándar: 640 / 768 / 1024 / 1280 / 1536.

> Recomendación: cuando crees UI nueva, usa estas variables para mantener consistencia.

---

### 4.5) `src/assets/` — Fuentes y recursos

Aquí viven fuentes como:

- `Open Sauce Two`
- `Instrument Serif`
- `Cabinet Grotesk Variable`

Se usan desde CSS (en `global.css`).

---

## 5) Conexión con backend (explicada paso a paso)

### 5.1) Variable de entorno `API_URL`

Los services del feature auth usan:

- `const API_URL = import.meta.env.API_URL;`

Eso significa que necesitas definir `API_URL` en tu entorno (por ejemplo en un `.env`).

> Si `API_URL` no está definido, los `fetch` al backend van a fallar.

---

### 5.2) Flujo de login actual

**Paso A — UI (browser):**

1) El usuario escribe email.
2) El formulario hace `fetch("api/auth/validate-email")`.
3) Si el email existe, se muestra el campo de contraseña.

**Paso B — Login (browser → BFF):**

4) Con email+password, el UI hace `fetch("api/auth/login")`.

**Paso C — Server (BFF → backend real):**

5) `src/pages/api/auth/login.ts` llama `login(email,password)` en `src/features/auth/services/authService.ts`.
6) Ese service hace `fetch(`${API_URL}/auth/login`)` al backend real.

**Paso D — Cookies:**

7) Si el backend responde OK, el BFF guarda cookies:

- `access_token` (15 min)
- `refresh_token` (7 días, restringida a path `/api`)

Estas cookies son `httpOnly`, así que JS del navegador **no puede leerlas**, pero sí se envían automáticamente en requests al mismo dominio.

---

### 5.3) Registro

- UI llama `POST /api/auth/register`.
- BFF (Astro endpoint) llama el service `register()` → backend real `POST ${API_URL}/auth/register`.

En el UI se muestra un toast y se sugiere abrir Outlook.

---

### 5.4) Recuperar contraseña

- UI llama `POST /api/auth/recover-password`.
- BFF llama `recoverPassword()` → backend real `POST ${API_URL}/auth/password/recover`.

---

## 6) Cómo se conectan las piezas (mapa mental)

Piensa así:

1) **Página** (`src/pages/...`) arma la pantalla y trae layouts/feature-components.
2) **Layout** (`src/layouts/...`) envuelve con estructura base (HTML o dialog).
3) **Componente de feature** (`src/features/...`) implementa UI y lógica del lado cliente.
4) **BFF endpoint** (`src/pages/api/...`) corre del lado server y habla con el backend real.
5) **Service** (`src/features/*/services/*.ts`) es el cliente del backend real (`API_URL`).

---

## 7) Cosas que te van a ayudar como principiante

### 7.1) Dónde tocar cuando agregues un feature nuevo

Depende de qué sea:

- Nueva página → agregar archivo en `src/pages/<ruta>.astro`.
- Nuevo módulo reutilizable → `src/features/<feature>/components/...`.
- Llamada al backend → crear:
  - `src/pages/api/<feature>/<endpoint>.ts` (BFF)
  - `src/features/<feature>/services/<algo>.ts` (fetch al backend real)

### 7.2) Consistencia visual

- Reusar tokens de `src/styles/variables.css`.
- Respetar breakpoints estándar (ver `docs/RESPONSIVE.md`).

---

## 8) Checklist rápido para depurar

- ¿Corre `npm run dev` sin errores?
- ¿Existe `API_URL` configurado?
- ¿El endpoint del backend responde (ej. `${API_URL}/auth/login`)?
- Si un modal no abre: revisa atributos `data-open-login`, `data-open-registry` y scripts del dialog.
- Si una ruta 404: revisa si existe el archivo en `src/pages`.

---

## 9) Próximo paso

Cuando me digas tu nuevo feature (qué pantalla es, si usa backend, y roles), lo implementamos siguiendo el patrón BFF y la organización `src/features/<nuevo>/...`.
