/**
 * tutorialState.js
 *
 * Unica fuente de verdad para el estado de los tours del Driven Tutorial.
 * Persiste en localStorage bajo la key ATLAS_TUTORIAL_STATE_KEY.
 *
 * - Si localStorage no esta disponible (modo incognito estricto), opera en memoria.
 * - Si el JSON esta corrupto, devuelve null y arranca limpio.
 */

const ATLAS_TUTORIAL_STATE_KEY = "atlas:tutorial:state";
const STATE_SCHEMA_VERSION = 1;

const STATUS = Object.freeze({
  ACTIVE: "active",
  DISCARDED: "discarded",
  COMPLETED: "completed",
});

// Cache en memoria para fallback cuando localStorage no esta disponible.
let memoryState = null;
let memoryStorageAvailable = null;

/** Detecta si localStorage es usable. Cachea el resultado. */
function hasLocalStorage() {
  if (memoryStorageAvailable !== null) return memoryStorageAvailable;
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      memoryStorageAvailable = false;
      return false;
    }
    const probe = "__atlas_probe__";
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
    memoryStorageAvailable = true;
    return true;
  } catch {
    memoryStorageAvailable = false;
    return false;
  }
}

function readRaw() {
  if (!hasLocalStorage()) return memoryState ? JSON.stringify(memoryState) : null;
  try {
    return window.localStorage.getItem(ATLAS_TUTORIAL_STATE_KEY);
  } catch {
    return null;
  }
}

function writeRaw(value) {
  if (!hasLocalStorage()) {
    memoryState = value ?? null;
    return;
  }
  try {
    if (value === null || value === undefined) {
      window.localStorage.removeItem(ATLAS_TUTORIAL_STATE_KEY);
    } else {
      window.localStorage.setItem(ATLAS_TUTORIAL_STATE_KEY, JSON.stringify(value));
    }
  } catch (err) {
    // Cuota llena o SecurityError: degradar a memoria.
    if (typeof console !== "undefined") {
      console.warn("[tutorialState] No se pudo escribir en localStorage:", err);
    }
  }
}

/** Lee y parsea el state. Devuelve null si no existe o esta corrupto. */
export function getState() {
  const raw = readRaw();
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (parsed.version !== STATE_SCHEMA_VERSION) return null;
    return parsed;
  } catch (err) {
    if (typeof console !== "undefined") {
      console.warn("[tutorialState] State corrupto, se ignora:", err);
    }
    return null;
  }
}

export function setState(state) {
  if (state === null || state === undefined) {
    writeRaw(null);
    return;
  }
  writeRaw({ ...state, version: STATE_SCHEMA_VERSION });
}

/** Estado de un tour, o null si no existe. */
export function getTourStatus(tourId) {
  const state = getState();
  if (!state) return null;
  const tour = state.tours?.[tourId];
  if (!tour) return null;
  return {
    status: tour.status,
    currentStep: tour.currentStep ?? 0,
    version: tour.version,
  };
}

/** Inicia un tour. Si ya existe con status ACTIVE y misma version, preserva el currentStep.
 *  Si el tour fue DISCARDED o COMPLETED, no lo reinicia (el usuario ya decidio no verlo).
 *  Devuelve true si el tour quedo activo, false si fue bloqueado. */
export function startTour(tourId, tourVersion, totalSteps, userRole) {
  const state = getState() || {
    version: STATE_SCHEMA_VERSION,
    userRole,
    tours: {},
  };
  state.userRole = userRole ?? state.userRole;

  const existing = state.tours[tourId];

  // No reactivar tours que el usuario ya descarto o completo.
  if (existing && (existing.status === STATUS.DISCARDED || existing.status === STATUS.COMPLETED)) {
    return false;
  }

  // Si el tour ya esta activo con la misma version, no reiniciar el progreso.
  if (existing && existing.status === STATUS.ACTIVE && existing.version === tourVersion) {
    existing.totalSteps = totalSteps;
    existing.updatedAt = Date.now();
  } else {
    state.tours[tourId] = {
      version: tourVersion,
      status: STATUS.ACTIVE,
      currentStep: 0,
      totalSteps,
      updatedAt: Date.now(),
    };
  }
  setState(state);
  return true;
}

/** Actualiza el paso actual de un tour. */
export function setTourStep(tourId, stepIndex) {
  const state = getState();
  if (!state || !state.tours?.[tourId]) return;
  const tour = state.tours[tourId];
  if (tour.status !== STATUS.ACTIVE) return;
  const safeIndex = Math.max(0, Math.min(stepIndex, tour.totalSteps - 1));
  tour.currentStep = safeIndex;
  tour.updatedAt = Date.now();
  setState(state);
}

/** Marca TODOS los tours como descartados (usuario salto el tutorial completo). */
export function discardAllTours() {
  const ALL_TOUR_IDS = [
    "dashboard-student",
    "dashboard-tutor",
    "agendamiento-student",
    "search-student",
    "disponibilidad-tutor",
    "final",
  ];
  const state = getState() || {
    version: STATE_SCHEMA_VERSION,
    userRole: null,
    tours: {},
  };
  const now = Date.now();
  ALL_TOUR_IDS.forEach((id) => {
    state.tours[id] = {
      version: "1.0.0",
      status: STATUS.DISCARDED,
      currentStep: 0,
      totalSteps: 0,
      updatedAt: now,
    };
  });
  setState(state);
}

/** Marca un tour como completado (usuario llego al final). */
export function completeTour(tourId) {
  const state = getState();
  if (!state || !state.tours?.[tourId]) return;
  state.tours[tourId].status = STATUS.COMPLETED;
  state.tours[tourId].updatedAt = Date.now();
  setState(state);
}

/** Paso desde el que reanudar. 0 si no hay progreso, version invalida, o estado terminal. */
export function getResumeStep(tourId, tourVersion) {
  const state = getState();
  if (!state) return 0;
  const tour = state.tours?.[tourId];
  if (!tour) return 0;
  if (tour.version !== tourVersion) return 0;
  if (tour.status === STATUS.DISCARDED || tour.status === STATUS.COMPLETED) return 0;
  return Math.max(0, tour.currentStep ?? 0);
}

export const TUTORIAL_STATUS = STATUS;
