import closeIcon from "@/features/tutorAvailability/assets/close.svg"
import styles from "@/features/tutorAvailability/css/HoursCard.module.css";

interface HoursCardProps {
    slot: any;
}

export default function HoursCard({ slot}: HoursCardProps) {

    const openSpaceInfoDialog = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.dispatchEvent(new CustomEvent('open-space-info-dialog', { detail: slot }));
    };

    const deleteSlot = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.dispatchEvent(new CustomEvent('delete-slot', { detail: slot }));
    };

    return (
        <div onClick={openSpaceInfoDialog} className={styles.HoursCard}>
            <div className={styles.LeftColor}></div>
            <div className={styles.InfoContainer}>
                <div className={styles.DayAndHoursContainer}>
                    <p className={styles.day}>{slot.day} →</p>
                    <p className={styles.hours}>{slot.hours}</p>
                </div>
                <div className={styles.ModalityContainer}>
                    <div className={styles.modality}>
                        {(slot.modality === "PRES") && (
                            <div className={styles.presencial}>Presencial</div>
                        )}
                        {(slot.modality === "VIRT") && (
                            <div className={styles.virtual}>Virtual</div>
                        )}
                    </div>
                </div>
            </div>
            <button className={styles.closeButton} onClick={deleteSlot}>
                <img className={styles.closeIcon} src={closeIcon.src} alt="" />
            </button>
        </div>
    )
}
