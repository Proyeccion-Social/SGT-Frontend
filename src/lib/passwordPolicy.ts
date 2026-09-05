/**
 * Política de contraseñas — espejo del backend (auth/constants/password-policy.constants.ts).
 *
 * Requisitos:
 *  - Mínimo 8 caracteres
 *  - Al menos una letra minúscula
 *  - Al menos una letra mayúscula
 *  - Al menos un dígito
 *  - Al menos un carácter especial del conjunto permitido
 *
 * Caracteres especiales permitidos:
 *  @ $ ! % * ? & # . , ; : - _ + = ( ) [ ] { } / \ | ^ ~ ` ' " < >
 */
export const PASSWORD_SPECIAL_CHARS_REGEX =
    /[@$!%*?&#.,;:\-_+=()[\]{}/\\|^~`'"<>]/;

export const PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#.,;:\-_+=()[\]{}/\\|^~`'"<>])[A-Za-z\d@$!%*?&#.,;:\-_+=()[\]{}/\\|^~`'"<>]{8,}$/;

export const PASSWORD_POLICY_MESSAGE =
    "La contraseña debe tener al menos 8 caracteres e incluir mayúsculas, minúsculas, números y caracteres especiales";

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;

/** Calcula la fortaleza de la contraseña: 0 = vacía, 1 = débil, 2 = media, 3 = fuerte */
export function getPasswordStrength(pw: string): 0 | 1 | 2 | 3 {
    if (pw.length === 0) return 0;
    let score = 0;
    if (pw.length >= MIN_PASSWORD_LENGTH) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/\d/.test(pw) && PASSWORD_SPECIAL_CHARS_REGEX.test(pw)) score++;
    return score as 0 | 1 | 2 | 3;
}
