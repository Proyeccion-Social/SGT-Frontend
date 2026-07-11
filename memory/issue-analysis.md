# Issue Analysis: Tutor Profile and Availability Features

## Issue 1: Password Special Character Validation
**Description:** El carácter "#" no es detectado como carácter especial en la contraseña; el mensaje de error es genérico y no explica la causa.

**Location:** `src/features/tutorProfile/components/SetNewPassword.tsx`

**Root Cause Analysis:**
- The `getStrength()` function correctly identifies special characters using regex `/[^A-Za-z0-9]/`
- However, the form validation logic (lines 55-62) only requires:
  1. Valid phone number (10 digits)
  2. Either empty password OR (length between 8-128 AND passwords match)
- Special character strength is only shown visually in the strength meter but is NOT required for form submission

**Impact:** Security vulnerability - users can set weak passwords without special characters

**Solution:** 
1. Either remove the special character strength indicator if not required
2. OR enforce special character requirement in validation logic
3. Update error messages to be specific about requirements

## Issue 2: Availability Tutorial Not Showing
**Description:** No se visualiza el tutorial para crear la disponibilidad.

**Location:** Tutorial system (`src/driverTutorial/TutorialInitializer.tsx` and related tutorial files)

**Root Cause Analysis:**
- Tutorial system uses `localStorage.getItem("current-tour")` to track progress
- For tutor availability tutorial to show:
  1. User must be on `/availability/tutor/slots` page
  2. `localStorage.getItem("current-tour")` must equal `"disponibilidad"`
  3. Then `startDisponibilidadTutorTutorial()` is called
- Issue likely in the tutorial triggering logic or state management

**Impact:** New tutors don't get guided setup for availability

**Solution:**
1. Verify tutorial triggering conditions in `TutorialInitializer.tsx`
2. Check if `localStorage` item is being set correctly
3. Ensure tutorial starts when user navigates to availability page

## Issue 3: Tutorial Interaction Problems
**Description:** En medio del tutorial, no reacciona al interactuar con el botón de horarios, ni permite hacer zoom para verificar si hay un botón de continuar.

**Location:** Tutorial system and related UI components

**Root Cause Analysis:**
- Tutorial uses Shepherd.js or similar library for guided tours
- Issues with:
  1. Event listeners not properly attached to dynamic elements
  2. Z-index or pointer-events issues preventing interaction
  3. Tutorial overlay blocking user interaction
  4. Zoom functionality hindered by fixed-position overlays

**Impact:** Users cannot complete the tutorial, getting stuck mid-process

**Solution:**
1. Review tutorial event handling in `driverTutorial/createTour.js` (if exists) or tutorial scripts
2. Ensure interactive elements have proper z-index and pointer-events
3. Verify tutorial steps correctly highlight and enable interaction with target elements

## Issue 4: Tutorial Reappears After Availability Save
**Description:** Al iniciar sesión no sale el tutorial, pero al modificar la disponibilidad y guardarla, vuelve a aparecer.

**Location:** Tutorial state management and availability update logic

**Root Cause Analysis:**
- Tutorial completion should set `localStorage.setItem("current-tour", "completed-step")` or similar
- After saving availability, some state is being reset incorrectly
- Possibly the availability save process is clearing localStorage or resetting tutorial flags

**Impact:** Annoying user experience, repetitive tutorials

**Solution:**
1. Identify what happens after availability save that resets tutorial state
2. Ensure tutorial completion flags are preserved during availability updates
3. Check if any process clears localStorage unnecessarily

## Issue 5: Data Loss When Updating Availability
**Description:** Al actualizar la disponibilidad se eliminaron las materias (ocurrió una única vez, no reproducido en pruebas posteriores).

**Location:** Availability update API calls and state management

**Root Cause Analysis:**
- Possible race condition in state updates
- Incorrect API endpoint usage (DELETE instead of PATCH/PUT)
- State synchronization issues between availability store and UI
- Potential bug in `patchSlotsByRange` or related API functions

**Impact:** Critical data loss - subjects/schedules being deleted unexpectedly

**Solution:**
1. Audit all availability update API calls
2. Verify correct HTTP methods are used (PATCH for updates, not DELETE)
3. Check state management in `useAvailabilityStore` and related hooks
4. Add confirmation dialogs for destructive operations

## Issue 6: Tutorial Reactivates After Availability Update
**Description:** Tras actualizar la disponibilidad, se vuelve a activar el tutorial en el dashboard.

**Location:** Tutorial trigger logic and availability update side effects

**Root Cause Analysis:**
- Similar to issue #4 - availability update process is incorrectly triggering tutorial reset
- Possibly the success callback from availability update is resetting tutorial state
- Or the dashboard reload/refresh after update is triggering tutorial check incorrectly

**Impact:** Annoying repetitive tutorials after legitimate actions

**Solution:**
1. Trace the availability update success path
2. Ensure tutorial state is not modified during availability operations
3. Check if dashboard reload after update incorrectly triggers tutorial

## Issue 7: Empty "Tu Disponibilidad" Section
**Description:** La sección "Tu Disponibilidad" no muestra nada (pantalla en blanco).

**Location:** `TutorAvailabilityBar` component and related data fetching

**Root Cause Analysis:**
- The `TutorAvailabilityManager` component uses `useAvailabilityStore` to get:
  - `weeklyHoursUsed`
  - `weeklyHoursLimit`
  - `loading`
  - `error`
- If data fails to load or returns empty/default values, the UI shows nothing
- Possible issues:
  1. API endpoint `/api/dashboard/tutor` not returning expected data
  2. State not properly updated in availability store
  3. Component rendering issue when data is zero/null

**Impact:** Core functionality unavailable - users can't see their availability

**Solution:**
1. Check API response format for dashboard endpoint
2. Verify state updates in `useAvailabilityStore`
3. Add proper loading/error states to UI
4. Ensure default values don't cause empty display


## Issue 8: Session Field Validation Based on Modality
**Description:** Es permitido editar el campo "salón" en una sesión virtual, y el campo "link" en una sesión presencial (deberían ser mutuamente excluyentes según modalidad).

**Location:** Session creation/editing components (likely in sessions feature)

**Root Cause Analysis:**
- Missing validation logic that checks session modality before allowing field edits
- UI doesn't dynamically enable/disable fields based on session type
- No backend validation to prevent invalid combinations

**Impact:** Data integrity issues - invalid session configurations

**Solution:**
1. Add frontend validation to disable inappropriate fields based on modality
2. Add backend validation to reject invalid session data
3. Update UI to show/hide fields based on selected modality

## Issue 9: Non-functional Sidebar Configuration Button
**Description:** El botón de configuración en el sidebar no tiene ninguna función.

**Location:** `src/features/dashboards/components/Sidebar.astro` lines 86-89

**Root Cause Analysis:**
- The configuration button is just a link to `'#'` (anchor to current page)
- No actual functionality attached
- Missing event handler or navigation target

**Impact:** Minor usability issue - button does nothing

**Solution:**
1. Replace `'#'` with actual path to configuration page
2. Or add click event handler to open configuration modal/dialog
3. Implement actual configuration functionality if needed

## Priority Order for Fixes:

**High Priority (Immediate Attention):**
1. Issue #5: Data loss when updating availability (critical data integrity)
2. Issue #7: Empty "Tu Disponibilidad" section (core functionality broken)
3. Issue #3: Tutorial interaction problems (blocks user onboarding)

**Medium Priority:**
1. Issue #2: Availability tutorial not showing (onboarding affected)
2. Issue #4: Tutorial reappears after availability save (annoying)
3. Issue #6: Tutorial reactivates after availability update (annoying)
4. Issue #8: Session field validation (data integrity)
5. Issue #1: Password validation (security enhancement)

**Low Priority:**
1. Issue #9: Non-functional sidebar button (minor usability)

## Recommended Implementation Order:
1. Fix data loss issue (#5)
2. Fix empty availability display (#7)  
3. Fix tutorial interaction issues (#3)
4. Fix tutorial display/issues (#2, #4, #6)
5. Fix session field validation (#8)
6. Fix password validation (#1)
7. Fix sidebar button (#9)