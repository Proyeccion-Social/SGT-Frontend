-- Script de preparación para pruebas de restablecimiento de contraseña (FINAL - Nuevos Tokens)
-- Tokens generados dinámicamente y validados por el usuario.

DO $$
DECLARE
    estudiante_id UUID;
    tutor_id UUID;
    -- Tokens planos para la URL
    token_estudiante_raw TEXT := '7777777777777777777777777777777777777777777777777777777777777777';
    token_tutor_raw TEXT := '8888888888888888888888888888888888888888888888888888888888888888';
    -- Hashes bcrypt proporcionados para la DB
    hash_estudiante TEXT := '$2b$10$3GL5U6wcC81Br6025nyjVu4KQjNCOhAf4WCisCHxUjDQFGBLE6cP6';
    hash_tutor TEXT := '$2b$10$mZBIff5VGssWsOgeRkIr.uzGf.iHAzdeKVvrNBuhbCkMc8QQr7382';
BEGIN
    -- 1. Preparar usuario estudiante
    INSERT INTO public.users (name, email, password, role, status, email_verified)
    VALUES ('Estudiante de Prueba', 'estudiante1@udistrital.edu.co', '$2b$10$placeholder_hash', 'STUDENT', 'ACTIVE', true)
    ON CONFLICT (email) DO UPDATE SET status = 'ACTIVE'
    RETURNING id_user INTO estudiante_id;

    INSERT INTO public.students (id_user, career, preferred_modality)
    VALUES (estudiante_id, 'Ingeniería de Sistemas', 'VIRT')
    ON CONFLICT (id_user) DO NOTHING;

    -- 2. Preparar usuario tutor
    INSERT INTO public.users (name, email, password, role, status, email_verified)
    VALUES ('Tutor de Prueba', 'tutor@udistrital.edu.co', '$2b$10$placeholder_hash', 'TUTOR', 'ACTIVE', true)
    ON CONFLICT (email) DO UPDATE SET status = 'ACTIVE'
    RETURNING id_user INTO tutor_id;

    INSERT INTO public.tutors (id_user, phone, is_active, profile_completed)
    VALUES (tutor_id, '3001234567', true, true)
    ON CONFLICT (id_user) DO NOTHING;

    -- 3. Limpiar tokens viejos e insertar nuevos
    DELETE FROM public.password_reset_tokens WHERE id_user IN (estudiante_id, tutor_id);

    INSERT INTO public.password_reset_tokens (id_user, token_hash, expires_at)
    VALUES 
        (estudiante_id, hash_estudiante, NOW() + INTERVAL '24 hours'),
        (tutor_id, hash_tutor, NOW() + INTERVAL '24 hours');

    RAISE NOTICE 'Pruebas listas con nuevos tokens:';
    RAISE NOTICE 'URL Estudiante: http://localhost:4321/reset-password?token=%', token_estudiante_raw;
    RAISE NOTICE 'URL Tutor: http://localhost:4321/reset-password?token=%', token_tutor_raw;
END $$;
