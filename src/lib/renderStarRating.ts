export type StarState = 'full' | 'half' | 'empty';

/**
 * Normaliza y calcula el estado visual de cada una de las 5 estrellas
 * basándose en la calificación promedio dada.
 *
 * Reglas:
 * - Solamente una calificación >= 4.95 otorga la 5ª estrella completa ('full'),
 *   protegiendo la distinción del 5.0 perfecto.
 * - Para valores entre [4.25, 4.95), la 5ª estrella se muestra a la mitad ('half').
 * - Rango general:
 *   * [i - 0.25, i]: estrella i completa ('full') (excepto i=5 que requiere 4.95)
 *   * [i - 0.75, i - 0.25): media estrella ('half')
 *   * < i - 0.75: estrella vacía ('empty')
 */
export function getStarStates(rating: number): StarState[] {
  const states: StarState[] = [];
  const clamped = Math.max(0, Math.min(5, Number(rating) || 0));

  for (let i = 1; i <= 5; i++) {
    const fullThreshold = i === 5 ? 4.95 : i - 0.25;
    const halfThreshold = i - 0.75;

    if (clamped >= fullThreshold) {
      states.push('full');
    } else if (clamped >= halfThreshold) {
      states.push('half');
    } else {
      states.push('empty');
    }
  }

  return states;
}

/**
 * Formatea un promedio para mostrarlo como cadena de texto fija a 1 decimal
 * (ej. 4.9, 5.0, 0.0).
 */
export function formatRatingValue(rating: number): string {
  const num = Number(rating);
  if (isNaN(num) || num <= 0) return '0.0';
  return num.toFixed(1);
}
