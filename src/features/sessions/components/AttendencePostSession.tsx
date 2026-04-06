import "@/features/sessions/styles/AttendancePostSession.css";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import CloseIcon from "@/features/sessions/images/CloseIcon.svg";

export default function AttendencePostSession() {
    const [isOpen, setIsOpen] = useState(true);

    const handleAttendanceClose = () => {
        setIsOpen(false);
    };

    const handleAttendanceOpen = () => {
        setIsOpen(true);
    };

    //Información mockeada, cambiar por consumo de la API
    const attendanceData = [
        {
            name: "Johan Sebastian",
        },
        {
            name: "Luna Maria",
        },
        {
            name: "Juan David",
        },
        {
            name: "Juan David",
        },
        {
            name: "Juan David",
        },
        {
            name: "Juan David",
        },
    ];

    if (!isOpen) return null;
    
    return (
        <>
            <div className="attendance-overlay"></div>
            <div className="attendance-container">
                <Button className="attendance-close" onClick={handleAttendanceClose}><img src={CloseIcon.src} alt="Close" /></Button>
                <div className="attendance-header">
                    <h6>Nombre</h6>
                    <h6>Asistió</h6>
                </div>
                <div className="attendance-content">
                    <div className="attendance-content-item">
                        {attendanceData.map((item, index) => (
                            <div className="attendance-content-item-name" key={index}>
                                <p>{item.name}</p>
                                <input className="attendance-checkbox" type="checkbox" />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="attendance-footer">
                    <Button className="attendance-button" variant="default">Guardar</Button>
                </div>
            </div>
        </>
    )
}