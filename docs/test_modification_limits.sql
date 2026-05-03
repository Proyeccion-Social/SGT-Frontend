-- ==========================================================
-- SCRIPT: PRUEBA DE REVISIÓN DE MODIFICACIÓN (SIN LÍMITES)
-- Objetivo: Permitir la aceptación de la modificación sin errores de límites.
-- Ajuste: Inclusión de modalidad (new_modality) en las propuestas.
-- ==========================================================

DO $$
DECLARE
    v_tutor_id UUID;
    v_estudiante_id UUID;
    v_subject_id UUID;
    v_monday DATE := date_trunc('week', CURRENT_DATE)::DATE + 7; -- Próximo lunes
    v_start_time TIME;
    v_avail_id BIGINT;
BEGIN
    -- 1. Obtener IDs
    SELECT id_user INTO v_tutor_id FROM public.users WHERE email = 'tutor@udistrital.edu.co';
    SELECT id_user INTO v_estudiante_id FROM public.users WHERE email = 'estudiante1@udistrital.edu.co';

    IF v_tutor_id IS NULL OR v_estudiante_id IS NULL THEN
        RAISE EXCEPTION 'Usuarios no encontrados.';
    END IF;

    -- 2. Configurar límite alto (20 horas)
    UPDATE public.tutors SET limit_disponibility = 20 WHERE id_user = v_tutor_id;

    -- 3. LIMPIEZA TOTAL
    DELETE FROM public.session_modification_requests WHERE id_session IN (SELECT id_session FROM public.sessions WHERE id_tutor = v_tutor_id);
    DELETE FROM public.student_participate_session WHERE id_session IN (SELECT id_session FROM public.sessions WHERE id_tutor = v_tutor_id);
    DELETE FROM public.scheduled_sessions WHERE id_tutor = v_tutor_id;
    DELETE FROM public.sessions WHERE id_tutor = v_tutor_id;
    DELETE FROM public.tutor_have_availability WHERE id_tutor = v_tutor_id;

    -- 4. Materia   
    INSERT INTO public.subject (id_subject, name, is_active)
    VALUES ('00000000-0000-0000-0000-000000000003', 'Cálculo Diferencial', true)
    ON CONFLICT (name) DO UPDATE SET is_active = true RETURNING id_subject INTO v_subject_id;

    -- 5. Disponibilidad para la semana laboral (Lunes a Sábado)
    FOR d IN 1..6 LOOP
        FOR i IN 0..30 LOOP
            v_start_time := '07:00:00'::TIME + (i * INTERVAL '30 minutes');
            IF NOT EXISTS (SELECT 1 FROM public.availability WHERE day_of_week = d AND start_time = v_start_time) THEN
                INSERT INTO public.availability (day_of_week, start_time) VALUES (d, v_start_time);
            END IF;
            INSERT INTO public.tutor_have_availability (id_tutor, id_availability, modality)
            SELECT v_tutor_id, id_availability, 'VIRT' FROM public.availability WHERE day_of_week = d AND start_time = v_start_time ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;

    -- 6. Obtener ID de disponibilidad para la propuesta (Viernes 08:00 AM, día 5)
    SELECT id_availability INTO v_avail_id 
    FROM public.availability 
    WHERE day_of_week = 5 AND start_time = '08:00:00';

    -- 7. Sesión Original (Sábado)
    INSERT INTO public.sessions (id_session, id_tutor, id_subject, scheduled_date, start_time, end_time, title, description, type, modality, status, tutor_confirmed)
    VALUES ('00000000-0000-0000-0000-000000000030', v_tutor_id, v_subject_id, v_monday + 5, '10:00:00', '11:00:00', 'Sesión Original', 'D', 'INDIVIDUAL', 'VIRT', 'PENDING_MODIFICATION', true);

    -- 8. SOLICITUDES DE PRUEBA
    -- Solicitud principal (ID ...31) - VIRTUAL
    INSERT INTO public.session_modification_requests (id_request, id_session, requested_by, new_scheduled_date, new_start_time, new_duration_hours, new_modality, status, expires_at, new_availability_id)
    VALUES ('00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000030', v_estudiante_id, v_monday + 4, '08:00:00', 1.0, 'VIRT', 'PENDING', NOW() + INTERVAL '48 hours', v_avail_id);

    -- Solicitud adicional (ID ...32) - PRESENCIAL (para ver el cambio en la lista)
    INSERT INTO public.session_modification_requests (id_request, id_session, requested_by, new_scheduled_date, new_start_time, new_duration_hours, new_modality, status, expires_at, new_availability_id)
    VALUES ('00000000-0000-0000-0000-000000000032', '00000000-0000-0000-0000-000000000030', v_estudiante_id, v_monday + 4, '09:00:00', 1.0, 'PRES', 'PENDING', NOW() + INTERVAL '48 hours', v_avail_id + 2);

    -- 9. Vinculación Multi-franja
    INSERT INTO public.scheduled_sessions (id_tutor, id_availability, id_session, scheduled_date)
    SELECT v_tutor_id, a.id_availability, s.id_session, s.scheduled_date
    FROM public.sessions s
    JOIN public.availability a ON a.day_of_week = CAST(extract(dow from s.scheduled_date) AS INTEGER)
        AND a.start_time >= s.start_time AND a.start_time < s.end_time
    WHERE s.id_tutor = v_tutor_id
    ON CONFLICT DO NOTHING;

    INSERT INTO public.student_participate_session (id_student, id_session, status)
    SELECT v_estudiante_id, id_session, 'CONFIRMED' FROM public.sessions WHERE id_tutor = v_tutor_id;

    RAISE NOTICE 'Escenario con modalidades (VIRT/PRES) preparado.';
END $$;
