'use client';

import { Drawer } from 'vaul';
import sidebarLogo from "@/features/tutorAvailability/assets/sidebarLogo.svg"
import { useState, useEffect, useCallback } from 'react';
import styles from "@/features/tutorAvailability/css/AvailabilitySideBar.module.css";
import HoursCard from "@/features/tutorAvailability/components/HoursCard";

export default function VaulDrawer({slots: initialSlots = []}: {slots?: any[]}) {

    const [open, setOpen] = useState(false);
    const [slots, setSlots] = useState<any[]>(Array.isArray(initialSlots) ? initialSlots : []);

    const fetchSlots = useCallback(async () => {
    try {
        const res = await fetch("/api/tutor-availability/get-my-availability");
        if (!res.ok) throw new Error("Failed to fetch slots");

        const data = await res.json();

        const dayMap: Record<string, string> = {
            MONDAY: "LUNES",
            TUESDAY: "MARTES",
            WEDNESDAY: "MIERCOLES",
            THURSDAY: "JUEVES",
            FRIDAY: "VIERNES",
            SATURDAY: "SABADO",
            SUNDAY: "DOMINGO",
        };

        const groupedByDay = data?.groupedByDay || {};
        const merged: any[] = [];

        // 1. Iterate through each day and merge contiguous slots
        Object.keys(groupedByDay).forEach((day) => {
            const daySlots = groupedByDay[day] || [];
            let currentMerged: any = null;

            for (const slot of daySlots) {
                const currentStart = slot.startTime.substring(0, 5);
                const lastEnd = currentMerged ? currentMerged.endTime.substring(0, 5) : "";

                if (currentMerged && 
                    currentMerged.modality === slot.modality && 
                    lastEnd === currentStart
                ) {
                    currentMerged.endTime = slot.endTime;
                } else {
                    if (currentMerged) merged.push(currentMerged);
                    currentMerged = { ...slot };
                }
            }
            if (currentMerged) merged.push(currentMerged);
        });

        const fetchedSlots = merged.map((slot: any) => ({
            ...slot,
            day: dayMap[slot.dayOfWeek] || slot.dayOfWeek,
            hours: `${slot.startTime.substring(0, 5)} → ${slot.endTime.substring(0, 5)}`
        }));

        setSlots(fetchedSlots);
        console.log("SLOTS COMBINADOS:", fetchedSlots);

    } catch (error) {
        console.error("Error al obtener los slots:", error);
        setSlots([]);
    }
}, []);

    useEffect(() => {
        // Cargar slots al montar para asegurar frescura
        fetchSlots();

        // Escuchar evento de refresco
        window.addEventListener("refresh-slots", fetchSlots);
        return () => {
            window.removeEventListener("refresh-slots", fetchSlots);
        };
    }, [fetchSlots]);

  return (
    <Drawer.Root open={open} onOpenChange={setOpen} direction="right" modal={true}>
        <Drawer.Trigger asChild>
  <button
    className={`
      ${open ? "h-10 w-10" : "h-14 w-14"}
      absolute z-[100] top-6 right-6 flex items-center justify-center
      rounded-full border border-[#C6C6C6] bg-white p-2
      transition-all duration-300
      cursor-pointer
    `}
  >
    <img src={sidebarLogo.src} alt="" />
  </button>
</Drawer.Trigger>
      <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Drawer.Content
          className="right-8 top-8 bottom-8 fixed z-50 outline-none w-[380px]"
          style={{ '--initial-transform': 'calc(100% + 50px)' } as React.CSSProperties}
        >
          <div className="bg-zinc-50 h-auto w-full grow flex flex-col rounded-[16px] border border-[#C6C6C6] z-20">
            <div className="p-5">
              <Drawer.Title className={styles.Title}>Tus franjas</Drawer.Title>
              <Drawer.Description className={styles.Description}>
                Haz click en una franja para editarla
              </Drawer.Description>
            </div>
            <hr className={styles.Separator}/>
            <div className={styles.SlotsContainer}>
              {slots.map((slot, index) => (
                <HoursCard key={index} slot={slot} />
              ))}
            </div>
            <hr className={styles.Separator}/>
            <div className={styles.CloseButtonContainer}>
              <Drawer.Close className={styles.CloseButton}>
                Guardar disponibilidad
              </Drawer.Close>
            </div>
          </div>
        </Drawer.Content>
    </Drawer.Root>
  );
}