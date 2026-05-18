-- ==========================================================
-- SCRIPT DE PRUEBAS PARA EMAIL FEATURES (SGT)
-- Configuración para usuarios existentes (FIX Missing StudentParticipation)
-- ==========================================================

DO $$
DECLARE
    v_tutor_id UUID;
    v_estudiante_id UUID;
    v_subject_id UUID;
    v_avail_id BIGINT := 100;
BEGIN
    -- 1. OBTENER IDs DE USUARIOS EXISTENTES
    SELECT id_user INTO v_tutor_id FROM public.users WHERE email = 'tutor@udistrital.edu.co';
    SELECT id_user INTO v_estudiante_id FROM public.users WHERE email = 'estudiante1@udistrital.edu.co';

    IF v_tutor_id IS NULL OR v_estudiante_id IS NULL THEN
        RAISE EXCEPTION 'Usuarios no encontrados. Verifica que tutor@udistrital.edu.co y estudiante1@udistrital.edu.co existan.';
    END IF;

    -- 2. INSERTAR O REUTILIZAR MATERIA
    INSERT INTO public.subject (id_subject, name, is_active)
    VALUES ('00000000-0000-0000-0000-000000000003', 'Cálculo Diferencial', true)
    ON CONFLICT (name) DO UPDATE SET is_active = true
    RETURNING id_subject INTO v_subject_id;

    -- 3. LIMPIEZA DE DATOS PREVIOS
    DELETE FROM public.password_reset_tokens WHERE id_user IN (v_tutor_id, v_estudiante_id);
    
    DELETE FROM public.session_modification_requests WHERE id_session IN (
        '00000000-0000-0000-0000-000000000010',
        '00000000-0000-0000-0000-000000000020',
        '00000000-0000-0000-0000-000000000030',
        '00000000-0000-0000-0000-000000000040'
    );

    DELETE FROM public.student_participate_session WHERE id_session IN (
        '00000000-0000-0000-0000-000000000010',
        '00000000-0000-0000-0000-000000000020',
        '00000000-0000-0000-0000-000000000030',
        '00000000-0000-0000-0000-000000000040'
    );

    DELETE FROM public.scheduled_sessions WHERE id_session IN (
        '00000000-0000-0000-0000-000000000010',
        '00000000-0000-0000-0000-000000000020',
        '00000000-0000-0000-0000-000000000030',
        '00000000-0000-0000-0000-000000000040'
    );

    DELETE FROM public.sessions WHERE id_session IN (
        '00000000-0000-0000-0000-000000000010',
        '00000000-0000-0000-0000-000000000020',
        '00000000-0000-0000-0000-000000000030',
        '00000000-0000-0000-0000-000000000040'
    );

    -- 4. VINCULAR TUTOR CON LA MATERIA Y DISPONIBILIDAD
    INSERT INTO public.tutor_impart_subject (id_tutor, id_subject)
    VALUES (v_tutor_id, v_subject_id) ON CONFLICT DO NOTHING;

    INSERT INTO public.availability (id_availability, day_of_week, start_time)
    VALUES (v_avail_id, 1, '08:00:00') ON CONFLICT (id_availability) DO NOTHING;

    INSERT INTO public.tutor_have_availability (id_tutor, id_availability, modality)
    VALUES (v_tutor_id, v_avail_id, 'VIRT') ON CONFLICT DO NOTHING;

    -- 5. INSERTAR SESIONES Y SUS DEPENDENCIAS (SCHEDULED_SESSIONS Y STUDENT_PARTICIPATION)

    -- [A] CONFIRMAR SESIÓN
    INSERT INTO public.sessions (id_session, id_tutor, id_subject, scheduled_date, start_time, end_time, title, description, type, modality, status)
    VALUES ('00000000-0000-0000-0000-000000000010', v_tutor_id, v_subject_id, CURRENT_DATE + 1, '08:00:00', '09:00:00', 'Sesión por Confirmar', 'Prueba confirmación', 'INDIVIDUAL', 'VIRT', 'PENDING_TUTOR_CONFIRMATION');
    
    INSERT INTO public.scheduled_sessions (id_tutor, id_availability, id_session, scheduled_date)
    VALUES (v_tutor_id, v_avail_id, '00000000-0000-0000-0000-000000000010', CURRENT_DATE + 1);

    INSERT INTO public.student_participate_session (id_student, id_session, status)
    VALUES (v_estudiante_id, '00000000-0000-0000-0000-000000000010', 'CONFIRMED');

    -- [B] EVALUAR SESIÓN
    INSERT INTO public.sessions (id_session, id_tutor, id_subject, scheduled_date, start_time, end_time, title, description, type, modality, status)
    VALUES ('00000000-0000-0000-0000-000000000020', v_tutor_id, v_subject_id, CURRENT_DATE - 1, '08:00:00', '09:00:00', 'Sesión para Evaluar', 'Prueba evaluación', 'INDIVIDUAL', 'VIRT', 'COMPLETED');
    
    INSERT INTO public.scheduled_sessions (id_tutor, id_availability, id_session, scheduled_date)
    VALUES (v_tutor_id, v_avail_id, '00000000-0000-0000-0000-000000000020', CURRENT_DATE - 1);

    INSERT INTO public.student_participate_session (id_student, id_session, status)
    VALUES (v_estudiante_id, '00000000-0000-0000-0000-000000000020', 'ATTENDED');

    -- [C] REVISAR MODIFICACIÓN
    INSERT INTO public.sessions (id_session, id_tutor, id_subject, scheduled_date, start_time, end_time, title, description, type, modality, status)
    VALUES ('00000000-0000-0000-0000-000000000030', v_tutor_id, v_subject_id, CURRENT_DATE + 2, '10:00:00', '11:00:00', 'Sesión Modificable', 'Prueba modificación', 'INDIVIDUAL', 'VIRT', 'PENDING_MODIFICATION');
    
    INSERT INTO public.scheduled_sessions (id_tutor, id_availability, id_session, scheduled_date)
    VALUES (v_tutor_id, v_avail_id, '00000000-0000-0000-0000-000000000030', CURRENT_DATE + 2);

    INSERT INTO public.student_participate_session (id_student, id_session, status)
    VALUES (v_estudiante_id, '00000000-0000-0000-0000-000000000030', 'CONFIRMED');

    INSERT INTO public.session_modification_requests (id_request, id_session, requested_by, new_scheduled_date, new_start_time, status, expires_at)
    VALUES ('00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000030', v_estudiante_id, CURRENT_DATE + 3, '14:00:00', 'PENDING', NOW() + INTERVAL '48 hours');

    -- [D] REAGENDAR
    INSERT INTO public.sessions (id_session, id_tutor, id_subject, scheduled_date, start_time, end_time, title, description, type, modality, status)
    VALUES ('00000000-0000-0000-0000-000000000040', v_tutor_id, v_subject_id, CURRENT_DATE + 5, '09:00:00', '10:00:00', 'Sesión Agendada', 'Prueba reagendar', 'INDIVIDUAL', 'VIRT', 'SCHEDULED');
    
    INSERT INTO public.scheduled_sessions (id_tutor, id_availability, id_session, scheduled_date)
    VALUES (v_tutor_id, v_avail_id, '00000000-0000-0000-0000-000000000040', CURRENT_DATE + 5);

    INSERT INTO public.student_participate_session (id_student, id_session, status)
    VALUES (v_estudiante_id, '00000000-0000-0000-0000-000000000040', 'CONFIRMED');

    -- 6. TOKEN DE RESTABLECIMIENTO DE CONTRASEÑA
    INSERT INTO public.password_reset_tokens (id_user, token_hash, expires_at)
    VALUES (v_tutor_id, '$2b$10$ziwaYQs/IrRyzMFsVfJ9AucUftC4btg1dW0nF25jrskqEp/mppfxC', NOW() + INTERVAL '24 hours');

    RAISE NOTICE 'Script ejecutado con éxito.';

END $$;
