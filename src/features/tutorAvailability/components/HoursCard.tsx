import closeIcon from "@/features/tutorAvailability/assets/close.png"
import "@/features/tutorAvailability/css/HoursCardSTYLES.css";

export default function HoursCard() {
    return (
        <div className="HoursCard">
            <div className="LeftColor"></div>
            <div className="InfoContainer">
                <div className="DayAndHoursContainer">
                    <p className="day">Lunes</p>
                    <p className="hours">08:00 - 10:00</p>
                </div>
                <div className="ModalityContainer">
                    <p className="modality">Presencial</p>
                </div>
            </div>
            <button className="closeButton">
                <img src={closeIcon.src} alt="" />
            </button>
        </div>
    )
}
