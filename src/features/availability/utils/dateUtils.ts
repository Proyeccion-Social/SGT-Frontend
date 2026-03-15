/**
 * Calculates current week Monday to Saturday dates based on an offset.
 */
export function getWeekRangeFromOffset(offset: number = 0) {
    const today = new Date();
    today.setDate(today.getDate() + offset * 6);

    const currentDay = today.getDay() === 0 ? 6 : today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (currentDay - 1));

    const saturday = new Date(monday);
    saturday.setDate(monday.getDate() + 5);

    const prevOffset = offset - 1;
    const nextOffset = offset + 1;

    const formatter = new Intl.DateTimeFormat("es-ES", { month: "long" });
    const startMonth = formatter.format(monday);
    const endMonth = formatter.format(saturday);

    const startStr = monday.getDate().toString().padStart(2, "0");
    const endStr = saturday.getDate().toString().padStart(2, "0");

    const weekRangeStr = `${startStr} de ${startMonth} - ${endStr} de ${endMonth}`;

    return {
        today,
        monday,
        saturday,
        prevOffset,
        nextOffset,
        weekRangeStr
    };
}
