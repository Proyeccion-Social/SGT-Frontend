'use client';
import { Drawer } from 'vaul';
import { sileo } from 'sileo';
import React, { useEffect, useCallback } from 'react';

import type { StepHandle } from '@/features/tutorProfile/components/ChooseSubjects';
import ChooseSubjects from '@/features/tutorProfile/components/ChooseSubjects';
import UploadProfileImage from '@/features/tutorProfile/components/UploadProfileImage';
import PersonalData from '@/features/tutorProfile/components/PersonalData';
import Finish from '@/features/tutorProfile/components/Finish';
import { Button } from '@/components/ui/button';

import { useAuthStore } from '@/store/authStore';
import type { CompleteTutorProfileDto } from '@/features/tutorProfile/services/tutorService';

import './styles/drawer.css';
import checkedIcon from "./images/checked-icon.svg"
import numberOne from "./images/number-one.png";
import numberTwo from "./images/number-two.png";
import numberThree from "./images/number-three.png";
import markedTitle from "./images/marked-title.svg"

import StudentAdditionalData from '@/features/studentProfile/components/StudentAdditionalData';

const TUTOR_STEPS = [
    { id: 1, label: 'Materias', shortLabel: '01' },
    { id: 2, label: 'Foto de Perfil', shortLabel: '02' },
    { id: 3, label: 'Datos personales', shortLabel: '03' },
];

const STUDENT_STEPS = [
    { id: 1, label: 'Materias', shortLabel: '01' },
    { id: 2, label: 'Preferencias', shortLabel: '02' },
];

interface DrawerFormData {
    phone: string;
    url_image: string;
    max_weekly_hours: number;
    subjectIds: string[];
    preferredModality: string;
    career: string;
}

export default function VaulDrawer() {
    const { user, requiresProfileCompletion } = useAuthStore();
    const [isOpen, setIsOpen] = React.useState(false);
    const [step, setStep] = React.useState(1);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const isStudent = user?.role === 'STUDENT';
    const activeSteps = isStudent ? STUDENT_STEPS : TUTOR_STEPS;
    const finishStepId = isStudent ? 3 : 4;

    const [formData, setFormData] = React.useState<DrawerFormData>({
        phone: user?.phone || '',
        url_image: user?.url_image || 'https://avatars.githubusercontent.com/u/150485576?v=4',
        max_weekly_hours: user?.max_weekly_hours || 8,
        subjectIds: user?.subjects?.map(s => s.id) || [],
        preferredModality: user?.preferredModality || '',
        career: user?.career || '',
    });

    // Open drawer when profile completion is required
    useEffect(() => {
        if (requiresProfileCompletion) {
            setIsOpen(true);
        }
    }, [requiresProfileCompletion]);

    useEffect(() => {
        const handlePageTransition = () => {
            if (isOpen) {
            }
        };

        document.addEventListener('astro:after-swap', handlePageTransition);
        return () => document.removeEventListener('astro:after-swap', handlePageTransition);
    }, [isOpen]);

    const nextStep = (newData?: Partial<DrawerFormData>) => {
        const merged = newData ? { ...formData, ...newData } : formData;
        if (newData) {
            setFormData(merged);
        }

        if (newData?.subjectIds) {
            console.log("Materias seleccionadas (IDs):", newData.subjectIds);
        }

        setCanContinue(false);
        setContinueLabel('Continuar');
        setStep((prev) => Math.min(prev + 1, finishStepId));
    };

    const handleSubmit = async (dataOverride?: Partial<DrawerFormData>) => {
        if (!user || isSubmitting) return;
        setIsSubmitting(true);
        const submitData = dataOverride || formData;

        try {
            let payload: any;
            let endpoint: string;

            // Limpieza de IDs común
            const cleanIds = (submitData.subjectIds || [])
                .filter(id => typeof id === 'string' && id.trim() !== '')
                .map(id => id.trim());

            if (isStudent) {
                endpoint = '/api/student/complete-profile';
                payload = {
                    subjectIds: cleanIds,
                    preferredModality: submitData.preferredModality,
                    career: submitData.career
                };
            } else {
                endpoint = '/api/tutor/complete-profile';
                payload = {
                    subject_ids: cleanIds, // Tutor espera snake_case
                    phone: submitData.phone,
                    max_weekly_hours: Math.round(Number(submitData.max_weekly_hours) || 8),
                };
            }
            
            console.log('[drawer] endpoint:', endpoint, '| payload:', JSON.stringify(payload, null, 2));

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => null);
                console.error('[drawer] error response:', res.status, JSON.stringify(err, null, 2));
                throw new Error(err?.message ?? 'Profile completion failed');
            }
            
            sileo.success({ title: '¡Perfil completado con éxito!', fill: '#58d68d' });
            
            // Update local store state
            if (user) {
                const updatedUser = { ...user };
                
                if (isStudent) {
                    updatedUser.preferredModality = payload.preferredModality || user.preferredModality || '';
                    updatedUser.career = payload.career || user.career || '';
                    updatedUser.subjects = payload.subjectIds?.map((id: string) => ({ id })) || user.subjects || [];
                } else {
                    updatedUser.phone = payload.phone || user.phone || '';
                    updatedUser.max_weekly_hours = payload.max_weekly_hours || user.max_weekly_hours || 8;
                    updatedUser.subjects = payload.subject_ids?.map((id: string) => ({ id })) || user.subjects || [];
                }

                useAuthStore.setState({ 
                    user: updatedUser,
                    requiresProfileCompletion: false 
                });
            } else {
                useAuthStore.setState({ requiresProfileCompletion: false });
            }

            // Go to finish step
            setStep(finishStepId);
        } catch (error: any) {
            sileo.error({ title: 'Error', description: error.message, fill: '#f35761' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFinishStep = step === finishStepId;

    const containerRef = React.useRef<HTMLDivElement>(null);
    const stepRef = React.useRef<StepHandle>(null);
    const [canContinue, setCanContinue] = React.useState(false);
    const [continueLabel, setContinueLabel] = React.useState('Continuar');

    const handleCanContinueChange = useCallback((value: boolean, label?: string) => {
        setCanContinue(value);
        setContinueLabel(label || 'Continuar');
    }, []);

    // Reset footer state when step changes
    const goToStep = (targetStep: number) => {
        // Save current step data before navigating away
        const data = stepRef.current?.getData?.();
        if (data) {
            setFormData((prev: DrawerFormData) => ({ ...prev, ...data }));
        }
        setCanContinue(false);
        setContinueLabel('Continuar');
        setStep(targetStep);
    };

    const handleFooterContinue = () => {
        stepRef.current?.triggerContinue();
    };

    return (
        <div ref={containerRef}>
            <Drawer.Root
                dismissible={false}
                open={isOpen}
                modal={true}
                onOpenChange={(open) => {
                    if (!open) return;
                    setIsOpen(open);
                }}
            >
                <Drawer.Portal container={containerRef.current}>
                    <Drawer.Overlay className="drawer-overlay" data-state={isOpen ? "open" : "closed"} />
                    <Drawer.Content className={`drawer-content${isStudent && (step === 1 || step === 2) ? ' drawer-content--student-additional' : ''}`}>
                        {/* Drag handle */}
                        <div aria-hidden className="drawer-handle" />

                        {/* Header */}
                        {!isFinishStep && (
                            <div className="drawer-header">
                                <Drawer.Title className="drawer-title">
                                    <span className="drawer-title-text">
                                        <span>Completemos tu perfil</span>
                                        <img src={markedTitle.src} alt="Marked" />
                                    </span>
                                </Drawer.Title>
                                <Drawer.Description className="drawer-description">
                                    {user?.name ? `Bienvenido ${user.name}` : 'Bienvenido'}
                                </Drawer.Description>
                            </div>
                        )}

                        <div className="drawer-layout">
                            <div className='drawer-content-container'>
                                {/* Internal step sidebar */}
                                {!isFinishStep && !isStudent && (
                                    <nav className="drawer-step-nav">
                                        <div className="drawer-step-nav-header">
                                            <Drawer.Description className="drawer-description">
                                                Bienvenido, sigue los pasos para configurar tu cuenta.
                                            </Drawer.Description>
                                        </div>
                                        <ul className="drawer-step-list">
                                            {activeSteps.map((s) => (
                                                <li key={s.id}>
                                                    <button
                                                        className={`drawer-step-item${step === s.id ? ' drawer-step-item--active' : ''}${step > s.id ? ' drawer-step-item--done' : ''}`}
                                                        onClick={() => { if (s.id < step) goToStep(s.id); }}
                                                        type="button"
                                                        disabled={s.id > step}
                                                    >
                                                        <span className="drawer-step-number">{s.shortLabel}</span>
                                                        <span className="drawer-step-label">{s.label}</span>
                                                        {step > s.id && (
                                                            <span className="drawer-step-check">
                                                                <img style={{width: '20px', height: '20px'}} src={checkedIcon.src} alt="Completado" />
                                                            </span>
                                                        )}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </nav>
                                )}

                                {/* Main content area */}
                                <div className={`drawer-main${isFinishStep || isStudent ? ' drawer-main--full' : ''}`}>
                                    {/* TUTOR FLOW */}
                                    {!isStudent && (
                                        <>
                                            {step === 1 && (
                                                <ChooseSubjects
                                                    ref={stepRef}
                                                    initialSelected={formData.subjectIds}
                                                    onNext={(data) => nextStep(data)}
                                                    onCanContinueChange={handleCanContinueChange}
                                                />
                                            )}
                                            {step === 2 && (
                                                <UploadProfileImage
                                                    ref={stepRef}
                                                    onNext={() => nextStep()}
                                                    onCanContinueChange={handleCanContinueChange}
                                                />
                                            )}
                                            {step === 3 && (
                                                <PersonalData
                                                    ref={stepRef}
                                                    initialPhone={formData.phone}
                                                    onNext={(data) => {
                                                        const merged = { ...formData, ...data };
                                                        setFormData(merged);
                                                        handleSubmit(merged);
                                                    }}
                                                    onCanContinueChange={handleCanContinueChange}
                                                />
                                            )}
                                        </>
                                    )}

                                    {/* STUDENT FLOW */}
                                    {isStudent && (
                                        <>
                                            {step === 1 && (
                                                <ChooseSubjects
                                                    ref={stepRef}
                                                    title="Escoge las materias de tu interés"
                                                    minSelections={0}
                                                    maxSelections={10}
                                                    initialSelected={formData.subjectIds}
                                                    onNext={(data) => nextStep(data)}
                                                    onCanContinueChange={handleCanContinueChange}
                                                />
                                            )}
                                            {step === 2 && (
                                                <StudentAdditionalData
                                                    ref={stepRef}
                                                    initialModality={formData.preferredModality}
                                                    initialCareer={formData.career}
                                                    onNext={(data) => {
                                                        const merged = { ...formData, ...data };
                                                        setFormData(merged);
                                                        handleSubmit(merged);
                                                    }}
                                                    onCanContinueChange={handleCanContinueChange}
                                                />
                                            )}
                                        </>
                                    )}

                                    {/* FINISH STEP */}
                                    {isFinishStep && (
                                        <Finish onNext={() => {
                                            setIsOpen(false);
                                            if (!isStudent) {
                                                setTimeout(() => {
                                                    window.dispatchEvent(new CustomEvent('open-initial-config-dialog'));
                                                }, 20);
                                            }
                                        }} />
                                    )}
                                </div>
                            </div>
                        </div>
                        {!isFinishStep &&
                            <div className="drawer-fixed-footer" style={{ justifyContent: 'center' }}>
                                <div className="drawer-footer-step">
                                    <p className="drawer-footer-step-text">Paso</p>
                                    <div className="drawer-footer-step-img">
                                        <img
                                            src={[numberOne, numberTwo, numberThree][step - 1]?.src}
                                            alt={String(step)}
                                        />
                                    </div>
                                </div>
                                <Button className="next-button" style={{position: "absolute", right: "2rem"}} onClick={handleFooterContinue} disabled={!canContinue || isSubmitting}>
                                    {isSubmitting ? "Guardando..." : step === (isStudent ? 2 : 3) ? 'Guardar' : continueLabel}
                                </Button>
                            </div>
                        }
                    </Drawer.Content>
                </Drawer.Portal>
            </Drawer.Root>
        </div>
    );
}