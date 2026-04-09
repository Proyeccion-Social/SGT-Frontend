import closeIcon from "@/features/tutorAvailability/assets/close.svg"
import "@/features/tutorAvailability/css/HoursCardSTYLES.css";

interface HoursCardProps {
    day?: string;
    hours?: string;
    modality?: string;
}

export default function HoursCard({ 
    day = "Lunes", 
    hours = "08:00 - 10:00", 
    modality = "both" 
}: HoursCardProps) {
    return (
        <button onClick={openSpaceInfoDialog} className="HoursCard">
            <div className="LeftColor"></div>
            <div className="InfoContainer">
                <div className="DayAndHoursContainer">
                    <p className="day">{day} →</p>
                    <p className="hours">{hours}</p>
                </div>
                <div className="ModalityContainer">
                    <div className="modality">
                        {(modality === "presencial" || modality === "both") && (
                            <div className="presencial">Presencial</div>
                        )}
                        {(modality === "virtual" || modality === "both") && (
                            <div className="virtual">Virtual</div>
                        )}
                    </div>
                </div>
            </div>
            <button className="closeButton">
                <img className="closeIcon" src={closeIcon.src} alt="" />
            </button>
        </button>
    )
}
