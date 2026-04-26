--
-- PostgreSQL database dump
--

\restrict kojXn77u3ekN3mKVLPwhFO41igbvMPIFBb9QQZkuXl1Y7HnqqWoVtPuVMH7bUpy

-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

-- Started on 2026-04-24 20:49:36

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 20919)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 5241 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 969 (class 1247 OID 21407)
-- Name: app_notifications_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.app_notifications_type_enum AS ENUM (
    'SESSION_REQUEST_RECEIVED',
    'SESSION_REQUEST_ACK',
    'SESSION_CONFIRMED',
    'SESSION_REJECTED',
    'SESSION_CANCELLED',
    'MODIFICATION_REQUEST',
    'MODIFICATION_ACCEPTED',
    'MODIFICATION_REJECTED',
    'SESSION_DETAILS_UPDATED',
    'SESSION_REMINDER_24H',
    'SESSION_REMINDER_2H',
    'EVALUATION_PENDING',
    'EVALUATION_REMINDER',
    'AVAILABILITY_CHANGED',
    'HOUR_LIMIT_ALERT',
    'SESSION_ABSENT'
);


ALTER TYPE public.app_notifications_type_enum OWNER TO postgres;

--
-- TOC entry 954 (class 1247 OID 21185)
-- Name: audit_logs_action_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.audit_logs_action_enum AS ENUM (
    'LOGIN',
    'LOGIN_FAILED',
    'LOGOUT',
    'PASSWORD_CHANGE',
    'PASSWORD_RESET_REQUESTED',
    'PASSWORD_RESET_COMPLETED',
    'ACCOUNT_CREATED',
    'EMAIL_VERIFIED',
    'ACCOUNT_LOCKED',
    'ACCOUNT_UNLOCKED',
    'SESSION_CREATED',
    'SESSION_REFRESHED',
    'SESSION_REVOKED',
    'SESSION_EXPIRED'
);


ALTER TYPE public.audit_logs_action_enum OWNER TO postgres;

--
-- TOC entry 957 (class 1247 OID 21214)
-- Name: audit_logs_result_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.audit_logs_result_enum AS ENUM (
    'SUCCESS',
    'FAILED'
);


ALTER TYPE public.audit_logs_result_enum OWNER TO postgres;

--
-- TOC entry 894 (class 1247 OID 20967)
-- Name: session_modification_requests_new_modality_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.session_modification_requests_new_modality_enum AS ENUM (
    'PRES',
    'VIRT'
);


ALTER TYPE public.session_modification_requests_new_modality_enum OWNER TO postgres;

--
-- TOC entry 897 (class 1247 OID 20972)
-- Name: session_modification_requests_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.session_modification_requests_status_enum AS ENUM (
    'PENDING',
    'ACCEPTED',
    'REJECTED',
    'EXPIRED'
);


ALTER TYPE public.session_modification_requests_status_enum OWNER TO postgres;

--
-- TOC entry 906 (class 1247 OID 21002)
-- Name: sessions_modality_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.sessions_modality_enum AS ENUM (
    'PRES',
    'VIRT'
);


ALTER TYPE public.sessions_modality_enum OWNER TO postgres;

--
-- TOC entry 909 (class 1247 OID 21008)
-- Name: sessions_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.sessions_status_enum AS ENUM (
    'PENDING_TUTOR_CONFIRMATION',
    'SCHEDULED',
    'PENDING_MODIFICATION',
    'REJECTED_BY_TUTOR',
    'CANCELLED_BY_STUDENT',
    'CANCELLED_BY_TUTOR',
    'CANCELLED_BY_ADMIN',
    'COMPLETED'
);


ALTER TYPE public.sessions_status_enum OWNER TO postgres;

--
-- TOC entry 903 (class 1247 OID 20996)
-- Name: sessions_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.sessions_type_enum AS ENUM (
    'INDIVIDUAL',
    'GROUP'
);


ALTER TYPE public.sessions_type_enum OWNER TO postgres;

--
-- TOC entry 888 (class 1247 OID 20949)
-- Name: student_participate_session_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.student_participate_session_status_enum AS ENUM (
    'CONFIRMED',
    'ATTENDED',
    'ABSENT',
    'LATE'
);


ALTER TYPE public.student_participate_session_status_enum OWNER TO postgres;

--
-- TOC entry 936 (class 1247 OID 21119)
-- Name: students_preferred_modality_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.students_preferred_modality_enum AS ENUM (
    'PRES',
    'VIRT'
);


ALTER TYPE public.students_preferred_modality_enum OWNER TO postgres;

--
-- TOC entry 942 (class 1247 OID 21130)
-- Name: users_role_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.users_role_enum AS ENUM (
    'STUDENT',
    'TUTOR',
    'ADMIN'
);


ALTER TYPE public.users_role_enum OWNER TO postgres;

--
-- TOC entry 945 (class 1247 OID 21138)
-- Name: users_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.users_status_enum AS ENUM (
    'ACTIVE',
    'PENDING',
    'BLOCKED'
);


ALTER TYPE public.users_status_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 221 (class 1259 OID 20940)
-- Name: answers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.answers (
    id_question uuid NOT NULL,
    id_student uuid NOT NULL,
    id_session uuid NOT NULL,
    score smallint,
    evaluation_id uuid NOT NULL,
    evaluated_at timestamp without time zone DEFAULT now() NOT NULL,
    questionnaire_version character varying(20) DEFAULT '1.0'::character varying NOT NULL
);


ALTER TABLE public.answers OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 21439)
-- Name: app_notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.app_notifications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    type public.app_notifications_type_enum NOT NULL,
    message character varying(300) NOT NULL,
    payload jsonb,
    read boolean DEFAULT false NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.app_notifications OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 21219)
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id_log uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    id_user uuid,
    id_session uuid,
    action public.audit_logs_action_enum NOT NULL,
    result public.audit_logs_result_enum NOT NULL,
    email_attempted character varying(255),
    failure_reason text,
    ip_address character varying(45),
    user_agent text,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 21169)
-- Name: auth_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_sessions (
    id_session uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    refresh_token_hash character varying(255) NOT NULL,
    user_agent text,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    revoked_at timestamp without time zone,
    last_activity_at timestamp without time zone DEFAULT now() NOT NULL,
    id_user uuid
);


ALTER TABLE public.auth_sessions OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 21063)
-- Name: availability; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.availability (
    id_availability bigint NOT NULL,
    day_of_week smallint NOT NULL,
    start_time time without time zone NOT NULL
);


ALTER TABLE public.availability OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 21062)
-- Name: availability_id_availability_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.availability_id_availability_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.availability_id_availability_seq OWNER TO postgres;

--
-- TOC entry 5242 (class 0 OID 0)
-- Dependencies: 226
-- Name: availability_id_availability_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.availability_id_availability_seq OWNED BY public.availability.id_availability;


--
-- TOC entry 238 (class 1259 OID 21244)
-- Name: email_verification_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.email_verification_tokens (
    id_token uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    id_user uuid NOT NULL,
    token_hash character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    verified_at timestamp without time zone
);


ALTER TABLE public.email_verification_tokens OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 21232)
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    id_token uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    id_user uuid NOT NULL,
    token_hash character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    used_at timestamp without time zone
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 20930)
-- Name: questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.questions (
    id_question uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    content text NOT NULL,
    aspect character varying(30) DEFAULT 'CLARITY'::character varying NOT NULL,
    label character varying(150) DEFAULT ''::character varying NOT NULL,
    description text,
    required boolean DEFAULT true NOT NULL,
    display_order smallint DEFAULT '1'::smallint NOT NULL,
    min_score smallint DEFAULT '1'::smallint NOT NULL,
    max_score smallint DEFAULT '5'::smallint NOT NULL,
    questionnaire_version character varying(20) DEFAULT '1.0'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.questions OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 21051)
-- Name: scheduled_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scheduled_sessions (
    id_tutor uuid NOT NULL,
    id_availability bigint NOT NULL,
    id_session uuid NOT NULL,
    scheduled_date date NOT NULL
);


ALTER TABLE public.scheduled_sessions OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 20981)
-- Name: session_modification_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session_modification_requests (
    id_request uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    id_session uuid NOT NULL,
    requested_by uuid NOT NULL,
    new_scheduled_date date,
    new_start_time time without time zone,
    new_availability_id bigint,
    new_modality public.session_modification_requests_new_modality_enum,
    new_duration_hours numeric(3,1),
    status public.session_modification_requests_status_enum DEFAULT 'PENDING'::public.session_modification_requests_status_enum NOT NULL,
    requested_at timestamp without time zone DEFAULT now() NOT NULL,
    responded_at timestamp without time zone,
    responded_by uuid,
    expires_at timestamp without time zone NOT NULL
);


ALTER TABLE public.session_modification_requests OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 21025)
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id_session uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    id_tutor uuid NOT NULL,
    id_subject uuid NOT NULL,
    scheduled_date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    title character varying(100) NOT NULL,
    description text NOT NULL,
    type public.sessions_type_enum NOT NULL,
    modality public.sessions_modality_enum NOT NULL,
    status public.sessions_status_enum DEFAULT 'SCHEDULED'::public.sessions_status_enum NOT NULL,
    cancellation_reason text,
    cancelled_at timestamp without time zone,
    cancelled_within_24h boolean DEFAULT false NOT NULL,
    cancelled_by uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    tutor_confirmed boolean DEFAULT false NOT NULL,
    tutor_confirmed_at timestamp without time zone,
    rejection_reason text,
    rejected_at timestamp without time zone,
    location character varying,
    virtual_link character varying
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 21111)
-- Name: student_interested_subject; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_interested_subject (
    id_student uuid NOT NULL,
    id_subject uuid NOT NULL
);


ALTER TABLE public.student_interested_subject OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 20957)
-- Name: student_participate_session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_participate_session (
    id_student uuid NOT NULL,
    id_session uuid NOT NULL,
    status public.student_participate_session_status_enum,
    comment text,
    arrival_time timestamp without time zone
);


ALTER TABLE public.student_participate_session OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 21123)
-- Name: students; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.students (
    id_user uuid NOT NULL,
    career character varying(100),
    preferred_modality public.students_preferred_modality_enum
);


ALTER TABLE public.students OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 21099)
-- Name: subject; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subject (
    id_subject uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.subject OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 21072)
-- Name: tutor_have_availability; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tutor_have_availability (
    id_tutor uuid NOT NULL,
    id_availability bigint NOT NULL,
    modality character varying(10)
);


ALTER TABLE public.tutor_have_availability OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 21092)
-- Name: tutor_impart_subject; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tutor_impart_subject (
    id_tutor uuid NOT NULL,
    id_subject uuid NOT NULL
);


ALTER TABLE public.tutor_impart_subject OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 21079)
-- Name: tutors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tutors (
    id_user uuid NOT NULL,
    phone character varying(20),
    is_active boolean DEFAULT false NOT NULL,
    limit_disponibility smallint DEFAULT '8'::smallint,
    profile_completed boolean DEFAULT false NOT NULL,
    url_image text
);


ALTER TABLE public.tutors OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 21145)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id_user uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    password character varying(255) NOT NULL,
    role public.users_role_enum NOT NULL,
    status public.users_status_enum NOT NULL,
    email_verified boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    email_verified_at timestamp without time zone,
    failed_login_attempts integer DEFAULT 0 NOT NULL,
    locked_until timestamp without time zone,
    password_changed_at timestamp without time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 4994 (class 2604 OID 21066)
-- Name: availability id_availability; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.availability ALTER COLUMN id_availability SET DEFAULT nextval('public.availability_id_availability_seq'::regclass);


--
-- TOC entry 5054 (class 2606 OID 21231)
-- Name: audit_logs PK_0db8a907e1af1cdfe86642282a2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "PK_0db8a907e1af1cdfe86642282a2" PRIMARY KEY (id_log);


--
-- TOC entry 5034 (class 2606 OID 21078)
-- Name: tutor_have_availability PK_1081a75d607ac74f1c1daac8e70; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tutor_have_availability
    ADD CONSTRAINT "PK_1081a75d607ac74f1c1daac8e70" PRIMARY KEY (id_tutor, id_availability);


--
-- TOC entry 5024 (class 2606 OID 20994)
-- Name: session_modification_requests PK_1b1046a24e0991b03562c303185; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session_modification_requests
    ADD CONSTRAINT "PK_1b1046a24e0991b03562c303185" PRIMARY KEY (id_request);


--
-- TOC entry 5018 (class 2606 OID 20939)
-- Name: questions PK_42f7d8f0cb5a36bdb8873474f73; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT "PK_42f7d8f0cb5a36bdb8873474f73" PRIMARY KEY (id_question);


--
-- TOC entry 5063 (class 2606 OID 21454)
-- Name: app_notifications PK_4ff08fe3c2ebf2593490403bbe0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_notifications
    ADD CONSTRAINT "PK_4ff08fe3c2ebf2593490403bbe0" PRIMARY KEY (id);


--
-- TOC entry 5040 (class 2606 OID 21108)
-- Name: subject PK_6a78d4af7c4f73c256c43f00c40; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject
    ADD CONSTRAINT "PK_6a78d4af7c4f73c256c43f00c40" PRIMARY KEY (id_subject);


--
-- TOC entry 5028 (class 2606 OID 21059)
-- Name: scheduled_sessions PK_6df0305f4681b7af345413ee6d7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scheduled_sessions
    ADD CONSTRAINT "PK_6df0305f4681b7af345413ee6d7" PRIMARY KEY (id_session);


--
-- TOC entry 5032 (class 2606 OID 21071)
-- Name: availability PK_74c354f1c8d40ea5ca04a281895; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.availability
    ADD CONSTRAINT "PK_74c354f1c8d40ea5ca04a281895" PRIMARY KEY (id_availability);


--
-- TOC entry 5044 (class 2606 OID 21117)
-- Name: student_interested_subject PK_7669f9531866a26d5eecf993e01; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_interested_subject
    ADD CONSTRAINT "PK_7669f9531866a26d5eecf993e01" PRIMARY KEY (id_student, id_subject);


--
-- TOC entry 5052 (class 2606 OID 21183)
-- Name: auth_sessions PK_79c7537367be7ffbbea479fbb18; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_sessions
    ADD CONSTRAINT "PK_79c7537367be7ffbbea479fbb18" PRIMARY KEY (id_session);


--
-- TOC entry 5036 (class 2606 OID 21091)
-- Name: tutors PK_8325796beb64a4c91dfe1c3955b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tutors
    ADD CONSTRAINT "PK_8325796beb64a4c91dfe1c3955b" PRIMARY KEY (id_user);


--
-- TOC entry 5026 (class 2606 OID 21050)
-- Name: sessions PK_858bc8fe367b57b2de3ad3316bd; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "PK_858bc8fe367b57b2de3ad3316bd" PRIMARY KEY (id_session);


--
-- TOC entry 5058 (class 2606 OID 21255)
-- Name: email_verification_tokens PK_a7696f895a903e3327da6184d20; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_verification_tokens
    ADD CONSTRAINT "PK_a7696f895a903e3327da6184d20" PRIMARY KEY (id_token);


--
-- TOC entry 5046 (class 2606 OID 21128)
-- Name: students PK_b559710a42d2bf3b49062750132; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "PK_b559710a42d2bf3b49062750132" PRIMARY KEY (id_user);


--
-- TOC entry 5022 (class 2606 OID 20965)
-- Name: student_participate_session PK_bd04f2a8d91eafd52dd6d937527; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_participate_session
    ADD CONSTRAINT "PK_bd04f2a8d91eafd52dd6d937527" PRIMARY KEY (id_student, id_session);


--
-- TOC entry 5020 (class 2606 OID 20947)
-- Name: answers PK_c1417fe520634f4cb323644d9f8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.answers
    ADD CONSTRAINT "PK_c1417fe520634f4cb323644d9f8" PRIMARY KEY (id_question, id_student, id_session);


--
-- TOC entry 5038 (class 2606 OID 21098)
-- Name: tutor_impart_subject PK_e99569804681cad9ec6b7d8b7bf; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tutor_impart_subject
    ADD CONSTRAINT "PK_e99569804681cad9ec6b7d8b7bf" PRIMARY KEY (id_tutor, id_subject);


--
-- TOC entry 5056 (class 2606 OID 21243)
-- Name: password_reset_tokens PK_fae074bbad2c452ca1a640fc45c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT "PK_fae074bbad2c452ca1a640fc45c" PRIMARY KEY (id_token);


--
-- TOC entry 5048 (class 2606 OID 21166)
-- Name: users PK_fbb07fa6fbd1d74bee9782fb945; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_fbb07fa6fbd1d74bee9782fb945" PRIMARY KEY (id_user);


--
-- TOC entry 5050 (class 2606 OID 21168)
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- TOC entry 5042 (class 2606 OID 21110)
-- Name: subject UQ_d011c391e37d9a5e63e8b04c977; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject
    ADD CONSTRAINT "UQ_d011c391e37d9a5e63e8b04c977" UNIQUE (name);


--
-- TOC entry 5030 (class 2606 OID 21061)
-- Name: scheduled_sessions UQ_tutor_availability_date; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scheduled_sessions
    ADD CONSTRAINT "UQ_tutor_availability_date" UNIQUE (id_tutor, id_availability, scheduled_date);


--
-- TOC entry 5059 (class 1259 OID 21486)
-- Name: IDX_0ba1a7b7a3221b68b9b89f00ad; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_0ba1a7b7a3221b68b9b89f00ad" ON public.app_notifications USING btree (created_at);


--
-- TOC entry 5060 (class 1259 OID 21487)
-- Name: IDX_47db88381f4401f7c35b58ec7a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_47db88381f4401f7c35b58ec7a" ON public.app_notifications USING btree (user_id, read);


--
-- TOC entry 5061 (class 1259 OID 21488)
-- Name: IDX_f0ba28fb988d154f68de8cad77; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_f0ba28fb988d154f68de8cad77" ON public.app_notifications USING btree (user_id, created_at);


--
-- TOC entry 5066 (class 2606 OID 21266)
-- Name: student_participate_session FK_049762489deb773f79eaa38e43b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_participate_session
    ADD CONSTRAINT "FK_049762489deb773f79eaa38e43b" FOREIGN KEY (id_student) REFERENCES public.students(id_user);


--
-- TOC entry 5073 (class 2606 OID 21301)
-- Name: scheduled_sessions FK_0d4b04a7079847403da2f7587cd; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scheduled_sessions
    ADD CONSTRAINT "FK_0d4b04a7079847403da2f7587cd" FOREIGN KEY (id_tutor) REFERENCES public.tutors(id_user);


--
-- TOC entry 5068 (class 2606 OID 21276)
-- Name: session_modification_requests FK_1261036d0c45dda8eb7c43bd1a1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session_modification_requests
    ADD CONSTRAINT "FK_1261036d0c45dda8eb7c43bd1a1" FOREIGN KEY (id_session) REFERENCES public.sessions(id_session);


--
-- TOC entry 5085 (class 2606 OID 21361)
-- Name: audit_logs FK_1aabbc22a9f345c55ee39bf5daf; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "FK_1aabbc22a9f345c55ee39bf5daf" FOREIGN KEY (id_user) REFERENCES public.users(id_user) ON DELETE SET NULL;


--
-- TOC entry 5076 (class 2606 OID 21321)
-- Name: tutor_have_availability FK_1b75a22ce69dd4ad3eafb4ccf2f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tutor_have_availability
    ADD CONSTRAINT "FK_1b75a22ce69dd4ad3eafb4ccf2f" FOREIGN KEY (id_availability) REFERENCES public.availability(id_availability);


--
-- TOC entry 5086 (class 2606 OID 21366)
-- Name: audit_logs FK_25d884c2a4c2cb629dc994e82d1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "FK_25d884c2a4c2cb629dc994e82d1" FOREIGN KEY (id_session) REFERENCES public.auth_sessions(id_session) ON DELETE SET NULL;


--
-- TOC entry 5081 (class 2606 OID 21346)
-- Name: student_interested_subject FK_36ba92aa42c5d6d14eca4ac8028; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_interested_subject
    ADD CONSTRAINT "FK_36ba92aa42c5d6d14eca4ac8028" FOREIGN KEY (id_subject) REFERENCES public.subject(id_subject);


--
-- TOC entry 5071 (class 2606 OID 21296)
-- Name: sessions FK_412317c2f4613f7f852ec0eaf31; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "FK_412317c2f4613f7f852ec0eaf31" FOREIGN KEY (id_subject) REFERENCES public.subject(id_subject);


--
-- TOC entry 5074 (class 2606 OID 21311)
-- Name: scheduled_sessions FK_6df0305f4681b7af345413ee6d7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scheduled_sessions
    ADD CONSTRAINT "FK_6df0305f4681b7af345413ee6d7" FOREIGN KEY (id_session) REFERENCES public.sessions(id_session);


--
-- TOC entry 5077 (class 2606 OID 21316)
-- Name: tutor_have_availability FK_6fe15be85a142eb123e22c9d043; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tutor_have_availability
    ADD CONSTRAINT "FK_6fe15be85a142eb123e22c9d043" FOREIGN KEY (id_tutor) REFERENCES public.tutors(id_user);


--
-- TOC entry 5069 (class 2606 OID 21286)
-- Name: session_modification_requests FK_703383a4c0a87bbcd10f9dde19f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session_modification_requests
    ADD CONSTRAINT "FK_703383a4c0a87bbcd10f9dde19f" FOREIGN KEY (responded_by) REFERENCES public.users(id_user);


--
-- TOC entry 5078 (class 2606 OID 21326)
-- Name: tutors FK_8325796beb64a4c91dfe1c3955b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tutors
    ADD CONSTRAINT "FK_8325796beb64a4c91dfe1c3955b" FOREIGN KEY (id_user) REFERENCES public.users(id_user);


--
-- TOC entry 5070 (class 2606 OID 21281)
-- Name: session_modification_requests FK_8b3e850804222a5cab0b51158e7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session_modification_requests
    ADD CONSTRAINT "FK_8b3e850804222a5cab0b51158e7" FOREIGN KEY (requested_by) REFERENCES public.users(id_user);


--
-- TOC entry 5088 (class 2606 OID 21376)
-- Name: email_verification_tokens FK_8e4afd15aa5933a0aef14ddc743; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_verification_tokens
    ADD CONSTRAINT "FK_8e4afd15aa5933a0aef14ddc743" FOREIGN KEY (id_user) REFERENCES public.users(id_user) ON DELETE CASCADE;


--
-- TOC entry 5079 (class 2606 OID 21331)
-- Name: tutor_impart_subject FK_a11475cea15ad0c4faa5e7ade16; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tutor_impart_subject
    ADD CONSTRAINT "FK_a11475cea15ad0c4faa5e7ade16" FOREIGN KEY (id_tutor) REFERENCES public.tutors(id_user);


--
-- TOC entry 5064 (class 2606 OID 21261)
-- Name: answers FK_a34388d454fcfb0f90b6ff4b515; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.answers
    ADD CONSTRAINT "FK_a34388d454fcfb0f90b6ff4b515" FOREIGN KEY (id_student, id_session) REFERENCES public.student_participate_session(id_student, id_session);


--
-- TOC entry 5087 (class 2606 OID 21371)
-- Name: password_reset_tokens FK_a440159fb2d7b579070f5206044; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT "FK_a440159fb2d7b579070f5206044" FOREIGN KEY (id_user) REFERENCES public.users(id_user) ON DELETE CASCADE;


--
-- TOC entry 5072 (class 2606 OID 21291)
-- Name: sessions FK_a9ed75a85efcadd71bbc8be5ee5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "FK_a9ed75a85efcadd71bbc8be5ee5" FOREIGN KEY (id_tutor) REFERENCES public.tutors(id_user);


--
-- TOC entry 5084 (class 2606 OID 21356)
-- Name: auth_sessions FK_b266e81e60e8c49ae2eb7c46d27; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_sessions
    ADD CONSTRAINT "FK_b266e81e60e8c49ae2eb7c46d27" FOREIGN KEY (id_user) REFERENCES public.users(id_user) ON DELETE CASCADE;


--
-- TOC entry 5083 (class 2606 OID 21351)
-- Name: students FK_b559710a42d2bf3b49062750132; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "FK_b559710a42d2bf3b49062750132" FOREIGN KEY (id_user) REFERENCES public.users(id_user);


--
-- TOC entry 5065 (class 2606 OID 21256)
-- Name: answers FK_c570b5fef77654bf9ff41b00624; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.answers
    ADD CONSTRAINT "FK_c570b5fef77654bf9ff41b00624" FOREIGN KEY (id_question) REFERENCES public.questions(id_question);


--
-- TOC entry 5075 (class 2606 OID 21306)
-- Name: scheduled_sessions FK_c862ed5f3d65ee0ab41aa0c6fd6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scheduled_sessions
    ADD CONSTRAINT "FK_c862ed5f3d65ee0ab41aa0c6fd6" FOREIGN KEY (id_availability) REFERENCES public.availability(id_availability);


--
-- TOC entry 5080 (class 2606 OID 21336)
-- Name: tutor_impart_subject FK_e2a77eea1cf449be7efe7147b31; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tutor_impart_subject
    ADD CONSTRAINT "FK_e2a77eea1cf449be7efe7147b31" FOREIGN KEY (id_subject) REFERENCES public.subject(id_subject);


--
-- TOC entry 5082 (class 2606 OID 21341)
-- Name: student_interested_subject FK_fa1094cb4cc067b455c39fa4ac8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_interested_subject
    ADD CONSTRAINT "FK_fa1094cb4cc067b455c39fa4ac8" FOREIGN KEY (id_student) REFERENCES public.students(id_user);


--
-- TOC entry 5067 (class 2606 OID 21271)
-- Name: student_participate_session FK_fe4bfc9c9d6054067ca1490a5a3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_participate_session
    ADD CONSTRAINT "FK_fe4bfc9c9d6054067ca1490a5a3" FOREIGN KEY (id_session) REFERENCES public.sessions(id_session);


-- Completed on 2026-04-24 20:49:37

--
-- PostgreSQL database dump complete
--

\unrestrict kojXn77u3ekN3mKVLPwhFO41igbvMPIFBb9QQZkuXl1Y7HnqqWoVtPuVMH7bUpy

