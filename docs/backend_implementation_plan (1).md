# Instrucciones para el Backend: Generación de Links (Módulo Notificaciones)

El objetivo es que los correos electrónicos construyan enlaces estáticos (o dinámicos simples) que envíen al usuario directamente a las pantallas del frontend (`emailScreens`). 

**Qué debes modificar:**
Ve al servicio donde despachas los correos (probablemente `notifications.service.ts` o el servicio de Mailer). Debes inyectar la URL base del frontend y concatenarle los siguientes paths según el tipo de correo:

## A. Enlaces Públicos (Requieren el Token que ya generas)
Usa estos enlaces para los flujos que tradicionalmente usan un token temporal en la BD.
1. **Confirmar Correo:** `{{FRONTEND_URL}}/confirm-email?token={{TOKEN}}`
2. **Restablecer Contraseña:** `{{FRONTEND_URL}}/reset-password?token={{TOKEN}}`

## B. Enlaces de Acción de Sesión (emailScreens - Protegidos)
Estos enlaces dirigen al usuario al Dashboard. Al entrar, el frontend (`EmailActionController`) abrirá automáticamente la pantalla flotante correspondiente a la acción. **No uses tokens aquí**, usa los IDs de las entidades de la base de datos.

1. **Aceptar/Rechazar una Solicitud de Sesión**
   - **Ruta:** `{{FRONTEND_URL}}/dashboard?action=confirm-session&sessionId={{SESSION_ID}}`
   - *Variables:* `SESSION_ID` es el ID UUID de la sesión pendiente.

2. **Revisar una Propuesta de Modificación**
   - **Ruta:** `{{FRONTEND_URL}}/dashboard?action=review-modification&requestId={{REQUEST_ID}}`
   - *Variables:* `REQUEST_ID` es el ID de la solicitud de modificación (tabla `session_modification_requests`).

3. **Reprogramar Sesión (Solicitar Modificación)**
   - **Ruta:** `{{FRONTEND_URL}}/dashboard?action=reschedule&sessionId={{SESSION_ID}}`
   - *Variables:* `SESSION_ID` de la sesión que se va a modificar.

4. **Evaluar Sesión Finalizada**
   - **Ruta:** `{{FRONTEND_URL}}/dashboard?action=evaluate&sessionId={{SESSION_ID}}`
   - *Variables:* `SESSION_ID` de la sesión finalizada.

---

### Instrucción para las plantillas (.hbs / .ejs):
Asegúrate de que en el HTML del correo, el href del botón apunte exactamente a estas variables construidas. Ejemplo: `<a href="{{ actionUrl }}">Calificar Tutoría</a>`.

---

## C. Requerimiento Adicional: Autologin en Confirmación de Correo
Para permitir que el usuario inicie sesión automáticamente tras confirmar su correo en el frontend, el endpoint de confirmación debe devolver las credenciales JWT.

El endpoint `POST /api/v1/auth/confirm-email` debe devolver el siguiente formato cuando es exitoso (HTTP 200/201):
```json
{
  "message": "Email verified successfully. You are now logged in.",
  "accessToken": "string (JWT, expira en 1h)",
  "refreshToken": "string (JWT, expira en 30d)",
  "user": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "role": "string",
    "emailVerified": true
  }
}
```
