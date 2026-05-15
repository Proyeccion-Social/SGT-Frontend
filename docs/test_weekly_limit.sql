-- ==========================================================
-- SCRIPT: PRUEBA DE LÍMITE SEMANAL (> limit_disponibility)
-- Objetivo: Al confirmar la sesión, el tutor debe exceder su límite semanal (6h).
-- ==========================================================

DO $$
DECLARE
    v_tutor_id UUID;
    v_estudiante_id UUID;
    v_subject_id UUID;
    v_avail_id BIGINT := 100;
    v_monday DATE := date_trunc('week', CURRENT_DATE)::DATE + 7; -- Próximo lunes
BEGIN
    -- 1. Obtener IDs
    SELECT id_user INTO v_tutor_id FROM public.users WHERE email = 'tutor@udistrital.edu.co';
    SELECT id_user INTO v_estudiante_id FROM public.users WHERE email = 'estudiante1@udistrital.edu.co';

    -- 2. Configurar límite semanal del tutor a 6 horas
    UPDATE public.tutors SET limit_disponibility = 6 WHERE id_user = v_tutor_id;

    -- 3. Limpieza de sesiones en esa semana (Por rango y por IDs específicos)
    DELETE FROM public.session_modification_requests WHERE id_session IN (SELECT id_session FROM public.sessions WHERE (scheduled_date BETWEEN v_monday AND v_monday + 6) OR id_session IN ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000203'));
    DELETE FROM public.student_participate_session WHERE id_session IN (SELECT id_session FROM public.sessions WHERE (scheduled_date BETWEEN v_monday AND v_monday + 6) OR id_session IN ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000203'));
    DELETE FROM public.scheduled_sessions WHERE id_session IN (SELECT id_session FROM public.sessions WHERE (scheduled_date BETWEEN v_monday AND v_monday + 6) OR id_session IN ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000203'));
    DELETE FROM public.sessions WHERE (scheduled_date BETWEEN v_monday AND v_monday + 6) OR id_session IN ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000203');

    -- 4. Crear Materia
    INSERT INTO public.subject (id_subject, name, is_active)
    VALUES ('00000000-0000-0000-0000-000000000003', 'Cálculo Diferencial', true)
    ON CONFLICT (name) DO UPDATE SET is_active = true RETURNING id_subject INTO v_subject_id;

    -- 5. Insertar 5.5 horas de sesiones YA CONFIRMADAS en la semana
    -- Lunes: 2h
    INSERT INTO public.sessions (id_session, id_tutor, id_subject, scheduled_date, start_time, end_time, title, description, type, modality, status, tutor_confirmed)
    VALUES ('00000000-0000-0000-0000-000000000201', v_tutor_id, v_subject_id, v_monday, '08:00:00', '10:00:00', 'Lunes 2h', 'Desc', 'INDIVIDUAL', 'VIRT', 'SCHEDULED', true);
    INSERT INTO public.scheduled_sessions (id_tutor, id_availability, id_session, scheduled_date)
    VALUES (v_tutor_id, v_avail_id, '00000000-0000-0000-0000-000000000201', v_monday);
    
    -- Miércoles: 2h
    INSERT INTO public.sessions (id_session, id_tutor, id_subject, scheduled_date, start_time, end_time, title, description, type, modality, status, tutor_confirmed)
    VALUES ('00000000-0000-0000-0000-000000000202', v_tutor_id, v_subject_id, v_monday + 2, '08:00:00', '10:00:00', 'Miércoles 2h', 'Desc', 'INDIVIDUAL', 'VIRT', 'SCHEDULED', true);
    INSERT INTO public.scheduled_sessions (id_tutor, id_availability, id_session, scheduled_date)
    VALUES (v_tutor_id, v_avail_id, '00000000-0000-0000-0000-000000000202', v_monday + 2);
    
    -- Viernes: 1.5h
    INSERT INTO public.sessions (id_session, id_tutor, id_subject, scheduled_date, start_time, end_time, title, description, type, modality, status, tutor_confirmed)
    VALUES ('00000000-0000-0000-0000-000000000203', v_tutor_id, v_subject_id, v_monday + 4, '08:00:00', '09:30:00', 'Viernes 1.5h', 'Desc', 'INDIVIDUAL', 'VIRT', 'SCHEDULED', true);
    INSERT INTO public.scheduled_sessions (id_tutor, id_availability, id_session, scheduled_date)
    VALUES (v_tutor_id, v_avail_id, '00000000-0000-0000-0000-000000000203', v_monday + 4);

    -- Total previo: 5.5 horas.

    -- 6. Insertar sesión PENDIENTE de 1 hora para el Sábado
    INSERT INTO public.sessions (id_session, id_tutor, id_subject, scheduled_date, start_time, end_time, title, description, type, modality, status, tutor_confirmed)
    VALUES ('00000000-0000-0000-0000-000000000010', v_tutor_id, v_subject_id, v_monday + 5, '10:00:00', '11:00:00', 'Conflictiva', 'Desc', 'INDIVIDUAL', 'VIRT', 'PENDING_TUTOR_CONFIRMATION', false);
    INSERT INTO public.scheduled_sessions (id_tutor, id_availability, id_session, scheduled_date)
    VALUES (v_tutor_id, v_avail_id, '00000000-0000-0000-0000-000000000010', v_monday + 5);

    -- Registros de participación
    INSERT INTO public.student_participate_session (id_student, id_session, status)
    VALUES (v_estudiante_id, '00000000-0000-0000-0000-000000000201', 'CONFIRMED'),
           (v_estudiante_id, '00000000-0000-0000-0000-000000000202', 'CONFIRMED'),
           (v_estudiante_id, '00000000-0000-0000-0000-000000000203', 'CONFIRMED'),
           (v_estudiante_id, '00000000-0000-0000-0000-000000000010', 'CONFIRMED');

    RAISE NOTICE 'Escenario preparado.';
END $$;
