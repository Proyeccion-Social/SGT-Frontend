-- SCRIPT DE PRUEBA: AJUSTADO A FILTROS DE BACKEND (SCHEDULED/PENDING)
-- Este script inserta sesiones que coinciden con los filtros observados en los logs.
-- USUARIO OBJETIVO: luflopezp@udistrital.edu.co

DO $$
DECLARE
    v_user_id UUID;
    v_subject_id UUID;
    v_estudiante_id UUID := '00000000-0000-0000-0000-000000000001'; -- Estudiante genérico para las sesiones donde eres tutor
BEGIN
    -- 1. OBTENER ID DEL USUARIO
    SELECT id_user INTO v_user_id FROM public.users WHERE email = 'luflopezp@udistrital.edu.co';
    
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'Usuario luflopezp@udistrital.edu.co no encontrado.';
        RETURN;
    END IF;

    -- 2. LIMPIEZA DE SESIONES DONDE ERES TUTOR O ESTUDIANTE
    DELETE FROM public.student_participate_session WHERE id_student = v_user_id OR id_session IN (SELECT id_session FROM public.sessions WHERE id_tutor = v_user_id);
    DELETE FROM public.scheduled_sessions WHERE id_tutor = v_user_id;
    DELETE FROM public.sessions WHERE id_tutor = v_user_id;

    -- 3. CONFIGURAR MATERIA
    INSERT INTO public.subject (id_subject, name, is_active)
    VALUES (uuid_generate_v4(), 'Cálculo Diferencial', true)
    ON CONFLICT (name) DO UPDATE SET is_active = true
    RETURNING id_subject INTO v_subject_id;

    -- 4. INSERTAR SESIONES QUE EL BACKEND ESTÁ FILTRANDO (Basado en logs: SCHEDULED, PENDING_MODIFICATION, PENDING_TUTOR_CONFIRMATION)
    
    -- A. SESIÓN PROGRAMADA (SCHEDULED) - Fecha dentro del rango del log (2026-05-02)
    INSERT INTO public.sessions (id_session, id_tutor, id_subject, scheduled_date, start_time, end_time, title, description, type, modality, status)
    VALUES ('30000000-0000-0000-0000-000000000001', v_user_id, v_subject_id, '2026-05-02', '10:00:00', '11:00:00', 'Sesión de Cálculo (Programada)', 'Repaso', 'INDIVIDUAL', 'VIRT', 'SCHEDULED');
    
    INSERT INTO public.scheduled_sessions (id_tutor, id_availability, id_session, scheduled_date)
    VALUES (v_user_id, 1, '30000000-0000-0000-0000-000000000001', '2026-05-02') ON CONFLICT DO NOTHING;

    -- B. MODIFICACIÓN SUGERIDA (PENDING_MODIFICATION) - Fecha 2026-05-03
    INSERT INTO public.sessions (id_session, id_tutor, id_subject, scheduled_date, start_time, end_time, title, description, type, modality, status)
    VALUES ('30000000-0000-0000-0000-000000000002', v_user_id, v_subject_id, '2026-05-03', '08:00:00', '09:00:00', 'Modificación Sugerida (Test)', 'Prueba mod', 'INDIVIDUAL', 'VIRT', 'PENDING_MODIFICATION');

    INSERT INTO public.scheduled_sessions (id_tutor, id_availability, id_session, scheduled_date)
    VALUES (v_user_id, 1, '30000000-0000-0000-0000-000000000002', '2026-05-03') ON CONFLICT DO NOTHING;

    -- C. CONFIRMACIÓN PENDIENTE (PENDING_TUTOR_CONFIRMATION) - Fecha 2026-05-01
    INSERT INTO public.sessions (id_session, id_tutor, id_subject, scheduled_date, start_time, end_time, title, description, type, modality, status)
    VALUES ('30000000-0000-0000-0000-000000000003', v_user_id, v_subject_id, '2026-05-01', '14:00:00', '15:00:00', 'Confirmación Pendiente (Test)', 'Prueba conf', 'INDIVIDUAL', 'VIRT', 'PENDING_TUTOR_CONFIRMATION');

    INSERT INTO public.scheduled_sessions (id_tutor, id_availability, id_session, scheduled_date)
    VALUES (v_user_id, 1, '30000000-0000-0000-0000-000000000003', '2026-05-01') ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Script inyectado con éxito. Verifica si ahora aparecen estas 3 sesiones nuevas.';

END $$;
