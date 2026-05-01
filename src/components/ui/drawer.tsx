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

const STEPS = [
    { id: 1, label: 'Materias', shortLabel: '01' },
    { id: 2, label: 'Foto de Perfil', shortLabel: '02' },
    { id: 3, label: 'Datos personales', shortLabel: '03' },
];

export default function VaulDrawer() {
    const { user, requiresProfileCompletion } = useAuthStore();
    const [isOpen, setIsOpen] = React.useState(false);
    const [step, setStep] = React.useState(1);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const [formData, setFormData] = React.useState<Partial<CompleteTutorProfileDto>>({
        phone: '',
        url_image: 'https://avatars.githubusercontent.com/u/150485576?v=4',
        max_weekly_hours: 8,
        subject_ids: [],
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
                console.log("Manteniendo drawer abierto tras transición");
            }
        };

        document.addEventListener('astro:after-swap', handlePageTransition);
        return () => document.removeEventListener('astro:after-swap', handlePageTransition);
    }, [isOpen]);

    const nextStep = (newData?: Partial<CompleteTutorProfileDto>) => {
        const merged = newData ? { ...formData, ...newData } : formData;
        if (newData) {
            setFormData(merged);
        }

        console.log("Datos recibidos del paso actual:", newData);
        console.log("Datos acumulados hasta ahora:", merged);

        setCanContinue(false);
        setContinueLabel('Continuar');
        setStep((prev) => Math.min(prev + 1, 4));
    };

    const handleSubmit = async (dataOverride?: Partial<CompleteTutorProfileDto>) => {
        if (!user || isSubmitting) return;
        setIsSubmitting(true);
        const submitData = dataOverride || formData;

        try {
            // Complete Profile via BFF route
            console.log("Datos enviados para completar perfil:", submitData);
            const res = await fetch('/api/tutor/complete-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => null);
                throw new Error(err?.message ?? 'Profile completion failed');
            }
            sileo.success({ title: '¡Perfil completado con éxito!', fill: '#58d68d' });
            useAuthStore.setState({ requiresProfileCompletion: false });

            // Go to finish step
            setStep(4);
        } catch (error: any) {
            sileo.error({ title: 'Error', description: error.message, fill: '#f35761' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFinishStep = step === 4;

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
            setFormData(prev => ({ ...prev, ...data }));
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
                    <Drawer.Content className="drawer-content">
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
                                {!isFinishStep && (
                                    <nav className="drawer-step-nav">
                                        <div className="drawer-step-nav-header">
                                            <Drawer.Description className="drawer-description">
                                                Bienvenido, sigue los pasos para configurar tu cuenta.
                                            </Drawer.Description>
                                        </div>
                                        <ul className="drawer-step-list">
                                            {STEPS.map((s) => (
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
                                <div className={`drawer-main${isFinishStep ? ' drawer-main--full' : ''}`}>
                                    {step === 1 && (
                                        <ChooseSubjects
                                            ref={stepRef}
                                            initialSelected={formData.subject_ids}
                                            onNext={(data) => nextStep(data)}
                                            onCanContinueChange={handleCanContinueChange}
                                        />
                                    )}
                                    {step === 2 && (
                                        <UploadProfileImage
                                            ref={stepRef}
                                            onNext={(blob) => {
                                                if (blob) {
                                                    // TODO: Implement actual image upload
                                                    nextStep();
                                                } else {
                                                    nextStep();
                                                }
                                            }}
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
                                    {step === 4 && (
                                        <Finish onNext={() => {
                                            setIsOpen(false);
                                            setTimeout(() => {
                                                window.dispatchEvent(new CustomEvent('open-initial-config-dialog'));
                                            }, 20);
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
                                    {isSubmitting ? "Guardando..." : step === 3 ? 'Guardar' : continueLabel}
                                </Button>
                            </div>
                        }
                    </Drawer.Content>
                </Drawer.Portal>
            </Drawer.Root>
        </div>
    );
}