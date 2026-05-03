import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { StepHandle } from '@/features/tutorProfile/components/ChooseSubjects';
import '../styles/StudentAdditionalData.css';

import DesktopIcon from "@/features/studentProfile/assets/DesktopIcon.svg";
import HomeIcon from "@/features/studentProfile/assets/HomeIcon.svg";

interface StudentAdditionalDataProps {
    initialModality?: string;
    initialCareer?: string;
    onNext: (data: { preferredModality: string; career: string }) => void;
    onCanContinueChange?: (canContinue: boolean) => void;
}

const CAREERS = [
    "Ingeniería de Sistemas",
    "Ingeniería Electrónica",
    "Ingeniería Industrial",
    "Ingeniería Catastral y Geodesia",
    "Ingeniería Eléctrica"
];

const StudentAdditionalData = forwardRef<StepHandle, StudentAdditionalDataProps>(
    ({ initialModality = '', initialCareer = '', onNext, onCanContinueChange }, ref) => {
        const [modality, setModality] = useState(initialModality);
        const [career, setCareer] = useState(initialCareer);

        useImperativeHandle(ref, () => ({
            triggerContinue: () => {
                if (modality && career) {
                    onNext({ preferredModality: modality, career });
                }
            },
            getData: () => ({ preferredModality: modality, career }),
        }), [modality, career, onNext]);

        useEffect(() => {
            onCanContinueChange?.(!!modality && !!career);
        }, [modality, career, onCanContinueChange]);

        return (
            <div className="drawer-body">
                <div className="body-header-subjects">
                    <p className="body-header-title">Cuéntanos más sobre ti</p>
                    <p className="body-header-subtitle">Selecciona tu modalidad preferida y tu carrera</p>
                </div>

                <div className="student-form-container">
                    <div className="form-group">
                        <label className="form-label">Modalidad de preferencia</label>
                        <div className="modality-options">
                            <button
                                type="button"
                                className={`modality-card ${modality === 'PRES' ? 'active' : ''}`}
                                onClick={() => setModality('PRES')}
                            >
                                <img src={HomeIcon.src} alt="" width="70" height="70" />
                                <span>Presencial</span>
                            </button>
                            <button
                                type="button"
                                className={`modality-card ${modality === 'VIRT' ? 'active' : ''}`}
                                onClick={() => setModality('VIRT')}
                            >
                                <img src={DesktopIcon.src} alt="" width="70" height="70" />
                                <span>Virtual</span>
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="career-select">Tu Carrera</label>
                        <select
                            id="career-select"
                            className="career-select"
                            value={career}
                            onChange={(e) => setCareer(e.target.value)}
                        >
                            <option value="" disabled>Selecciona tu carrera</option>
                            {CAREERS.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        );
    }
);

export default StudentAdditionalData;
