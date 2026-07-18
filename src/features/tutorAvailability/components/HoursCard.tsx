import { DAY_COLORS } from "@/features/tutorAvailability/utils/calendarConstants";
import closeIcon from "@/features/tutorAvailability/assets/close.svg"
import styles from "@/features/tutorAvailability/css/HoursCard.module.css";

interface HoursCardProps {
    slot: any;
}

export default function HoursCard({ slot}: HoursCardProps) {

    const dayMap: Record<string, string> = {
        LUNES: "MONDAY",
        MARTES: "TUESDAY",
        MIERCOLES: "WEDNESDAY",
        JUEVES: "THURSDAY",
        VIERNES: "FRIDAY",
        SABADO: "SATURDAY",
        DOMINGO: "SUNDAY",
    };

    const openSpaceInfoDialog = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Cierra el drawer (Vaul) primero para que no bloquee los clicks del dialog.
        window.dispatchEvent(new CustomEvent('close-availability-sidebar'));

        // Abre el dialog en el siguiente tick.
        window.setTimeout(() => {
            window.dispatchEvent(new CustomEvent('open-space-info-dialog', { detail: slot }));
        }, 0);
    };

    const normalizeModality = (modality: any): string[] => {
        if (!modality) return [];
        if (Array.isArray(modality)) return modality;
        if (modality === 'BOTH') return ['PRES', 'VIRT'];
        return [modality];
    };

    const deleteSlot = (e: React.MouseEvent) => {
        e.stopPropagation();

        const body = {
            dayOfWeek: slot.dayOfWeek || dayMap[slot.day] || slot.day,
            startTime: slot.startTime?.substring(0, 5) || "",
            endTime: slot.endTime?.substring(0, 5) || "",
            modality: normalizeModality(slot.modality),
        };

        window.dispatchEvent(new CustomEvent('delete-slot', { detail: body }));
    };

    const color = DAY_COLORS[slot.day];
    // Algunos colores ya incluyen alpha (p.ej. "#RRGGBBAA"). Evita duplicarlo.

    return (
        <div onClick={openSpaceInfoDialog} className={styles.HoursCard}>
            <div className={styles.LeftColor} style={{ backgroundColor: color }}></div>
            <div className={styles.InfoContainer}>
                <div className={styles.DayAndHoursContainer}>
                    <p className={styles.day}>{slot.day} →</p>
                    <p className={styles.hours}>{slot.hours}</p>
                </div>
                <div className={styles.ModalityContainer}>
                    <div className={styles.modality}>
                        {normalizeModality(slot.modality).includes("PRES") && (
                            <div className={styles.presencial}>Presencial</div>
                        )}
                        {normalizeModality(slot.modality).includes("VIRT") && (
                            <div className={styles.virtual}>Virtual</div>
                        )}
                    </div>
                </div>
            </div>
            <button type="button" className={styles.closeButton} onClick={deleteSlot}>
                <img className={styles.closeIcon} src={closeIcon.src} alt="" />
            </button>
        </div>
    )
}
