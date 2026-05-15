-- =====================================================================
-- SCRIPT DE PRUEBA: ESCENARIOS DE EMAIL SCREENS
-- Tutor: tutor1@udistrital.edu.co
-- Estudiante: estudiante22@udistrital.edu.co
-- =====================================================================

DO $$
DECLARE
    v_tutor_id UUID;
    v_estudiante_id UUID;
    v_subject_id UUID;
    v_avail_id BIGINT := 500;
BEGIN
    -- ==========================================
    -- 1. CREAR O OBTENER USUARIOS
    -- ==========================================
    
    -- Obtener o crear Tutor
    SELECT id_user INTO v_tutor_id FROM public.users WHERE email = 'tutor1@udistrital.edu.co';
    IF v_tutor_id IS NULL THEN
        v_tutor_id := uuid_generate_v4();
        INSERT INTO public.users (id_user, name, email, password, role, status, email_verified)
        VALUES (v_tutor_id, 'Tutor Email Test', 'tutor1@udistrital.edu.co', 'password', 'TUTOR', 'ACTIVE', true);
        
        INSERT INTO public.tutors (id_user, phone, is_active, limit_disponibility, profile_completed)
        VALUES (v_tutor_id, '3000000001', true, 10, true);
    END IF;

    -- Obtener o crear Estudiante
    SELECT id_user INTO v_estudiante_id FROM public.users WHERE email = 'estudiante22@udistrital.edu.co';
    IF v_estudiante_id IS NULL THEN
        v_estudiante_id := uuid_generate_v4();
        INSERT INTO public.users (id_user, name, email, password, role, status, email_verified)
        VALUES (v_estudiante_id, 'Estudiante Email Test', 'estudiante22@udistrital.edu.co', 'password', 'STUDENT', 'ACTIVE', true);
        
        INSERT INTO public.students (id_user, career, preferred_modality)
        VALUES (v_estudiante_id, 'Ingeniería', 'VIRT');
    END IF;

    -- Asegurar roles correctos y desbloquear en la tabla principal
    UPDATE public.users 
    SET role = 'TUTOR', failed_login_attempts = 0, locked_until = NULL 
    WHERE id_user = v_tutor_id;
    
    UPDATE public.users 
    SET role = 'STUDENT', failed_login_attempts = 0, locked_until = NULL,
        password = (SELECT password FROM public.users WHERE id_user = v_tutor_id)
    WHERE id_user = v_estudiante_id;

    -- ==========================================
    -- 2. ASEGURAR MATERIA Y DISPONIBILIDAD
    -- ==========================================
    INSERT INTO public.subject (id_subject, name, is_active) 
    VALUES (uuid_generate_v4(), 'Ingeniería de Software', true) 
    ON CONFLICT (name) DO UPDATE SET is_active = true 
    RETURNING id_subject INTO v_subject_id;

    INSERT INTO public.tutor_impart_subject (id_tutor, id_subject) VALUES (v_tutor_id, v_subject_id) ON CONFLICT DO NOTHING;
    INSERT INTO public.availability (id_availability, day_of_week, start_time) VALUES (v_avail_id, 1, '08:00:00') ON CONFLICT DO NOTHING;
    INSERT INTO public.tutor_have_availability (id_tutor, id_availability, modality) VALUES (v_tutor_id, v_avail_id, 'VIRT') ON CONFLICT DO NOTHING;

    -- ==========================================
    -- 3. LIMPIEZA DE PRUEBAS ANTERIORES
    -- ==========================================
    DELETE FROM public.password_reset_tokens WHERE id_user = v_estudiante_id;
    DELETE FROM public.session_modification_requests WHERE id_session IN ('50000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000004');
    DELETE FROM public.answers WHERE id_session IN ('50000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000004');
    DELETE FROM public.student_participate_session WHERE id_session IN ('50000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000004');
    DELETE FROM public.scheduled_sessions WHERE id_session IN ('50000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000004');
    DELETE FROM public.sessions WHERE id_session IN ('50000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000004');

    -- ==========================================
    -- 4. INSERCIÓN DE ESCENARIOS
    -- ==========================================

    -- [1] Reset Password para el estudiante
    INSERT INTO public.password_reset_tokens (id_user, token_hash, expires_at)
    VALUES (v_estudiante_id, '$2b$10$.MDrx8sfhV.cONveI0mPEunZTvP.6zZ0mQ6VbqgJJw0YzGcJZkAW2', NOW() + INTERVAL '24 hours');

    -- [2] Confirmar sesión para tutor (PENDING_TUTOR_CONFIRMATION)
    INSERT INTO public.sessions (id_session, id_tutor, id_subject, scheduled_date, start_time, end_time, title, description, type, modality, status)
    VALUES ('50000000-0000-0000-0000-000000000001', v_tutor_id, v_subject_id, CURRENT_DATE + 1, '10:00:00', '12:00:00', 'Revisión de Arquitectura', 'Dudas de MVC', 'INDIVIDUAL', 'VIRT', 'PENDING_TUTOR_CONFIRMATION');
    INSERT INTO public.scheduled_sessions (id_tutor, id_availability, id_session, scheduled_date) VALUES (v_tutor_id, v_avail_id, '50000000-0000-0000-0000-000000000001', CURRENT_DATE + 1);
    INSERT INTO public.student_participate_session (id_student, id_session, status) VALUES (v_estudiante_id, '50000000-0000-0000-0000-000000000001', 'CONFIRMED');

    -- [3] Propuesta de modificación para que la vea el tutor (Requested by student)
    INSERT INTO public.sessions (id_session, id_tutor, id_subject, scheduled_date, start_time, end_time, title, description, type, modality, status)
    VALUES ('50000000-0000-0000-0000-000000000002', v_tutor_id, v_subject_id, CURRENT_DATE + 2, '08:00:00', '10:00:00', 'Patrones de Diseño', 'Factory y Singleton', 'INDIVIDUAL', 'VIRT', 'PENDING_MODIFICATION');
    INSERT INTO public.scheduled_sessions (id_tutor, id_availability, id_session, scheduled_date) VALUES (v_tutor_id, v_avail_id, '50000000-0000-0000-0000-000000000002', CURRENT_DATE + 2);
    INSERT INTO public.student_participate_session (id_student, id_session, status) VALUES (v_estudiante_id, '50000000-0000-0000-0000-000000000002', 'CONFIRMED');
    
    INSERT INTO public.session_modification_requests (id_request, id_session, requested_by, new_scheduled_date, new_start_time, status, expires_at)
    VALUES ('50000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000002', v_estudiante_id, CURRENT_DATE + 3, '14:00:00', 'PENDING', NOW() + INTERVAL '48 hours');

    -- [4] Reschedule para estudiante (Requested by tutor)
    INSERT INTO public.sessions (id_session, id_tutor, id_subject, scheduled_date, start_time, end_time, title, description, type, modality, status)
    VALUES ('50000000-0000-0000-0000-000000000003', v_tutor_id, v_subject_id, CURRENT_DATE + 4, '16:00:00', '18:00:00', 'Bases de Datos', 'Normalización', 'INDIVIDUAL', 'VIRT', 'PENDING_MODIFICATION');
    INSERT INTO public.scheduled_sessions (id_tutor, id_availability, id_session, scheduled_date) VALUES (v_tutor_id, v_avail_id, '50000000-0000-0000-0000-000000000003', CURRENT_DATE + 4);
    INSERT INTO public.student_participate_session (id_student, id_session, status) VALUES (v_estudiante_id, '50000000-0000-0000-0000-000000000003', 'CONFIRMED');
    
    INSERT INTO public.session_modification_requests (id_request, id_session, requested_by, new_scheduled_date, new_start_time, status, expires_at)
    VALUES ('50000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000003', v_tutor_id, CURRENT_DATE + 5, '10:00:00', 'PENDING', NOW() + INTERVAL '48 hours');

    -- [5] Calificar sesión para estudiante (COMPLETED)
    INSERT INTO public.sessions (id_session, id_tutor, id_subject, scheduled_date, start_time, end_time, title, description, type, modality, status)
    VALUES ('50000000-0000-0000-0000-000000000004', v_tutor_id, v_subject_id, CURRENT_DATE - 1, '14:00:00', '16:00:00', 'Testing y QA', 'Pruebas unitarias', 'INDIVIDUAL', 'VIRT', 'COMPLETED');
    INSERT INTO public.scheduled_sessions (id_tutor, id_availability, id_session, scheduled_date) VALUES (v_tutor_id, v_avail_id, '50000000-0000-0000-0000-000000000004', CURRENT_DATE - 1);
    INSERT INTO public.student_participate_session (id_student, id_session, status) VALUES (v_estudiante_id, '50000000-0000-0000-0000-000000000004', 'ATTENDED');

    RAISE NOTICE 'Script de Email Screens ejecutado correctamente.';
END $$;
