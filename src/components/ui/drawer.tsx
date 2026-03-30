'use client';

import { Drawer } from 'vaul';
import React, { useEffect } from 'react';
import './styles/drawer.css';
import ChooseSubjects from '@/features/tutorProfile/components/ChooseSubjects';
import UploadProfileImage from '@/features/tutorProfile/components/UploadProfileImage';
import SetAvailabilityHours from '@/features/tutorProfile/components/SetAvailabilityHours';
import SetNewPassword from '@/features/tutorProfile/components/SetNewPassword';
import Finish from '@/features/tutorProfile/components/Finish';
import { useAuthStore } from '@/store/authStore';
import { completeTutorProfile, updateTutorProfile, type CompleteTutorProfileDto } from '@/features/tutorProfile/services/tutorService';
import { changePassword } from '@/features/auth/services/authService';
import { toast } from 'sonner';
import numberOne from "./images/number-one.png";
import numberTwo from "./images/number-two.png";
import numberThree from "./images/number-three.png";
import numberFour from "./images/number-four.png";

const STEPS = [
    { id: 1, label: 'Materias',          shortLabel: '01' },
    { id: 2, label: 'Foto de Perfil',    shortLabel: '02' },
    { id: 3, label: 'Disponibilidad',   shortLabel: '03' },
    { id: 4, label: 'Contraseña',        shortLabel: '04' },
];

export default function VaulDrawer() {
    const { user, requiresProfileCompletion } = useAuthStore();
    const [isOpen, setIsOpen] = React.useState(false);
    const [step, setStep] = React.useState(1);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    
    // Data collection state
    const [formData, setFormData] = React.useState<Partial<CompleteTutorProfileDto>>({
        phone: '',
        url_image: '',
        max_weekly_hours: 8, // Default
        subject_ids: [],
        availabilities: [],
    });

    // Initial check for profile completion
    useEffect(() => {
        if (requiresProfileCompletion) {
            setIsOpen(true);
        }
    }, [requiresProfileCompletion]);

    // Listen for the sidebar config button event
    useEffect(() => {
        const handler = () => setIsOpen(true);
        window.addEventListener('open-profile-drawer', handler);
        return () => window.removeEventListener('open-profile-drawer', handler);
    }, []);

    const goToStep = (s: number) => {
        setStep(s);
    };
    
    const nextStep = (newData?: Partial<CompleteTutorProfileDto>) => {
        if (newData) {
            setFormData(prev => ({ ...prev, ...newData }));
        }
        setStep((prev) => Math.min(prev + 1, 5));
    };

    const skipStep = () => setStep((prev) => Math.min(prev + 1, 5));

    const handleSubmit = async (newPassword?: string) => {
        if (!user || isSubmitting) return;
        setIsSubmitting(true);
        
        try {
            const tokenArr = document.cookie.split('; ').find(row => row.startsWith('access_token='));
            const token = tokenArr ? tokenArr.split('=')[1] : null;
            if (!token) throw new Error("No access token found");

            // 1. If password provided, change it first (optional step)
            if (newPassword && newPassword.length >= 8) {
                await changePassword({ password: newPassword, confirmPassword: newPassword }, token);
                toast.success("Contraseña actualizada");
            }

            // 2. Complete or Update Profile
            if (requiresProfileCompletion) {
                await completeTutorProfile(formData as CompleteTutorProfileDto, token);
                toast.success("¡Perfil completado con éxito!");
                
                // Update local store state to reflect completion
                useAuthStore.setState({ requiresProfileCompletion: false });
            } else {
                await updateTutorProfile(formData, token);
                toast.success("¡Perfil actualizado!");
            }
            
            // On success, go to finish step
            setStep(5);
        } catch (error: any) {
            toast.error(`Error: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFinishStep = step === 5;

    return (
        <Drawer.Root
            dismissible={!requiresProfileCompletion}
            open={isOpen}
            onOpenChange={(open) => {
                if (requiresProfileCompletion && !open) return;
                setIsOpen(open);
            }}
        >
            <Drawer.Portal>
                <Drawer.Overlay className="drawer-overlay" />
                <Drawer.Content className="drawer-content">
                    {/* Drag handle */}
                    <div aria-hidden className="drawer-handle" />

                    {/* Header */}
                    <div className="drawer-header">
                        <Drawer.Title className="drawer-title">
                            {requiresProfileCompletion ? 'Completemos tu perfil' : 'Actualizar perfil'}
                        </Drawer.Title>
                        <Drawer.Description className="drawer-description">
                            {requiresProfileCompletion 
                                ? (user?.name ? `Bienvenido ${user.name}` : 'Bienvenido')
                                : 'Modifica la información de tu perfil'}
                        </Drawer.Description>
                    </div>

                    <div className="drawer-layout">
                        <div className='drawer-content-container'>
                            {/* Internal step sidebar */}
                            {!isFinishStep && (
                                <nav className="drawer-step-nav">
                                    <div className="drawer-step-nav-header">
                                        <Drawer.Description className="drawer-description">
                                            {requiresProfileCompletion 
                                                ? 'Bienvenido, sigue los pasos para configurar tu cuenta.'
                                                : 'Actualiza los datos de tu cuenta a continuación.'}
                                        </Drawer.Description>
                                    </div>
                                    <ul className="drawer-step-list">
                                        {STEPS.map((s) => (
                                            <li key={s.id}>
                                                <button
                                                    className={`drawer-step-item${step === s.id ? ' drawer-step-item--active' : ''}${step > s.id ? ' drawer-step-item--done' : ''}`}
                                                    onClick={() => goToStep(s.id)}
                                                    type="button"
                                                >
                                                    <span className="drawer-step-number">{s.shortLabel}</span>
                                                    <span className="drawer-step-label">{s.label}</span>
                                                    {step > s.id && (
                                                        <span className="drawer-step-check">✓</span>
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
                                        onNext={(data) => nextStep(data)}
                                        onSkip={skipStep}
                                        isMandatory={requiresProfileCompletion}
                                        isSubmitting={isSubmitting}
                                    />
                                )}
                                {step === 2 && (
                                    <UploadProfileImage
                                        onNext={(blob) => {
                                            if (blob) {
                                                // TODO: Implement actual image upload
                                                // For now using a placeholder to allow profile completion
                                                nextStep({ url_image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" });
                                            } else {
                                                nextStep();
                                            }
                                        }}
                                        onSkip={skipStep}
                                        isMandatory={requiresProfileCompletion}
                                        isSubmitting={isSubmitting}
                                    />
                                )}
                                {step === 3 && (
                                    <SetAvailabilityHours
                                        onNext={(data) => nextStep(data)}
                                        onSkip={skipStep}
                                        isMandatory={requiresProfileCompletion}
                                        isSubmitting={isSubmitting}
                                    />
                                )}
                                {step === 4 && (
                                    <SetNewPassword
                                        onNext={(pwd) => handleSubmit(pwd)}
                                        onSkip={() => handleSubmit()}
                                        isMandatory={requiresProfileCompletion}
                                        isSubmitting={isSubmitting}
                                    />
                                )}
                                {step === 5 && (
                                    <Finish onNext={() => setIsOpen(false)} />
                                )}
                            </div>
                        </div>
                    </div>
                    {!isFinishStep && 
                        <div className="drawer-fixed-footer">
                            <p className="drawer-footer-step-text">
                                Paso
                            </p>
                            <div className="drawer-footer-step-img">
                                {
                                    step === 1 && <img src={numberOne.src} alt="1" />
                                }
                                {
                                    step === 2 && <img src={numberTwo.src} alt="2" />
                                }
                                {
                                    step === 3 && <img src={numberThree.src} alt="3" />
                                }
                                {
                                    step === 4 && <img src={numberFour.src} alt="4" />
                                }
                            </div>
                        </div>
                    }
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}