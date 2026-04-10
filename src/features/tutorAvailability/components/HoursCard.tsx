import closeIcon from "@/features/tutorAvailability/assets/close.svg"
import styles from "@/features/tutorAvailability/css/HoursCard.module.css";

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

    const openSpaceInfoDialog = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.dispatchEvent(new CustomEvent('open-space-info-dialog'));
    };

    return (
        <div onClick={openSpaceInfoDialog} className={styles.HoursCard}>
            <div className={styles.LeftColor}></div>
            <div className={styles.InfoContainer}>
                <div className={styles.DayAndHoursContainer}>
                    <p className={styles.day}>{day} →</p>
                    <p className={styles.hours}>{hours}</p>
                </div>
                <div className={styles.ModalityContainer}>
                    <div className={styles.modality}>
                        {(modality === "presencial" || modality === "both") && (
                            <div className={styles.presencial}>Presencial</div>
                        )}
                        {(modality === "virtual" || modality === "both") && (
                            <div className={styles.virtual}>Virtual</div>
                        )}
                    </div>
                </div>
            </div>
            <button className={styles.closeButton} onClick={(e) => e.stopPropagation()}>
                <img className={styles.closeIcon} src={closeIcon.src} alt="" />
            </button>
        </div>
    )
}
