-- ==========================================================
-- SCRIPT: PRUEBA DE LÍMITE DIARIO (> 4 HORAS)
-- Objetivo: Al confirmar la sesión, el tutor debe exceder las 4 horas diarias.
-- ==========================================================

DO $$
DECLARE
    v_tutor_id UUID;
    v_estudiante_id UUID;
    v_subject_id UUID;
    v_test_date DATE := CURRENT_DATE + 2;
BEGIN
    -- 1. Obtener IDs
    SELECT id_user INTO v_tutor_id FROM public.users WHERE email = 'tutor@udistrital.edu.co';
    SELECT id_user INTO v_estudiante_id FROM public.users WHERE email = 'estudiante1@udistrital.edu.co';

    -- 2. Configurar límite semanal del tutor a 10
    UPDATE public.tutors SET limit_disponibility = 10 WHERE id_user = v_tutor_id;

    -- 3. Limpieza de sesiones previas
    DELETE FROM public.session_modification_requests WHERE id_session IN (SELECT id_session FROM public.sessions WHERE scheduled_date = v_test_date OR id_session IN ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000103'));
    DELETE FROM public.student_participate_session WHERE id_session IN (SELECT id_session FROM public.sessions WHERE scheduled_date = v_test_date OR id_session IN ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000103'));
    DELETE FROM public.scheduled_sessions WHERE id_session IN (SELECT id_session FROM public.sessions WHERE scheduled_date = v_test_date OR id_session IN ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000103'));
    DELETE FROM public.sessions WHERE scheduled_date = v_test_date OR id_session IN ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000103');

    -- 4. Crear Materia
    INSERT INTO public.subject (id_subject, name, is_active)
    VALUES ('00000000-0000-0000-0000-000000000003', 'Cálculo Diferencial', true)
    ON CONFLICT (name) DO UPDATE SET is_active = true RETURNING id_subject INTO v_subject_id;

    -- 5. Crear Disponibilidades únicas para evitar conflictos de UQ_tutor_availability_date
    INSERT INTO public.availability (id_availability, day_of_week, start_time) VALUES (101, 1, '08:00:00') ON CONFLICT DO NOTHING;
    INSERT INTO public.availability (id_availability, day_of_week, start_time) VALUES (102, 1, '10:00:00') ON CONFLICT DO NOTHING;
    INSERT INTO public.availability (id_availability, day_of_week, start_time) VALUES (103, 1, '11:00:00') ON CONFLICT DO NOTHING;
    INSERT INTO public.availability (id_availability, day_of_week, start_time) VALUES (104, 1, '14:00:00') ON CONFLICT DO NOTHING;

    INSERT INTO public.tutor_have_availability (id_tutor, id_availability, modality) VALUES (v_tutor_id, 101, 'VIRT') ON CONFLICT DO NOTHING;
    INSERT INTO public.tutor_have_availability (id_tutor, id_availability, modality) VALUES (v_tutor_id, 102, 'VIRT') ON CONFLICT DO NOTHING;
    INSERT INTO public.tutor_have_availability (id_tutor, id_availability, modality) VALUES (v_tutor_id, 103, 'VIRT') ON CONFLICT DO NOTHING;
    INSERT INTO public.tutor_have_availability (id_tutor, id_availability, modality) VALUES (v_tutor_id, 104, 'VIRT') ON CONFLICT DO NOTHING;

    -- 6. Insertar Sesiones (3.5h confirmadas)
    INSERT INTO public.sessions (id_session, id_tutor, id_subject, scheduled_date, start_time, end_time, title, description, type, modality, status, tutor_confirmed)
    VALUES ('00000000-0000-0000-0000-000000000101', v_tutor_id, v_subject_id, v_test_date, '08:00:00', '09:30:00', 'S1', 'D', 'INDIVIDUAL', 'VIRT', 'SCHEDULED', true);
    INSERT INTO public.scheduled_sessions (id_tutor, id_availability, id_session, scheduled_date) VALUES (v_tutor_id, 101, '00000000-0000-0000-0000-000000000101', v_test_date);

    INSERT INTO public.sessions (id_session, id_tutor, id_subject, scheduled_date, start_time, end_time, title, description, type, modality, status, tutor_confirmed)
    VALUES ('00000000-0000-0000-0000-000000000102', v_tutor_id, v_subject_id, v_test_date, '10:00:00', '11:00:00', 'S2', 'D', 'INDIVIDUAL', 'VIRT', 'SCHEDULED', true);
    INSERT INTO public.scheduled_sessions (id_tutor, id_availability, id_session, scheduled_date) VALUES (v_tutor_id, 102, '00000000-0000-0000-0000-000000000102', v_test_date);

    INSERT INTO public.sessions (id_session, id_tutor, id_subject, scheduled_date, start_time, end_time, title, description, type, modality, status, tutor_confirmed)
    VALUES ('00000000-0000-0000-0000-000000000103', v_tutor_id, v_subject_id, v_test_date, '11:00:00', '12:00:00', 'S3', 'D', 'INDIVIDUAL', 'VIRT', 'SCHEDULED', true);
    INSERT INTO public.scheduled_sessions (id_tutor, id_availability, id_session, scheduled_date) VALUES (v_tutor_id, 103, '00000000-0000-0000-0000-000000000103', v_test_date);

    -- Sesión pendiente de 1h (Total 4.5h)
    INSERT INTO public.sessions (id_session, id_tutor, id_subject, scheduled_date, start_time, end_time, title, description, type, modality, status, tutor_confirmed)
    VALUES ('00000000-0000-0000-0000-000000000010', v_tutor_id, v_subject_id, v_test_date, '14:00:00', '15:00:00', 'Conflictiva', 'D', 'INDIVIDUAL', 'VIRT', 'PENDING_TUTOR_CONFIRMATION', false);
    INSERT INTO public.scheduled_sessions (id_tutor, id_availability, id_session, scheduled_date) VALUES (v_tutor_id, 104, '00000000-0000-0000-0000-000000000010', v_test_date);

    INSERT INTO public.student_participate_session (id_student, id_session, status)
    SELECT v_estudiante_id, id_session, 'CONFIRMED' FROM public.sessions WHERE scheduled_date = v_test_date;

    RAISE NOTICE 'Escenario preparado.';
END $$;
