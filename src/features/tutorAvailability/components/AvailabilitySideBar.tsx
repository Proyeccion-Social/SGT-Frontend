  'use client';

  import { Drawer } from 'vaul';
  import sidebarLogo from "@/features/tutorAvailability/assets/sidebarLogo.svg"
  import { useState, useEffect, useCallback, useRef } from 'react';
  import { sileo } from 'sileo';
  import styles from "@/features/tutorAvailability/css/AvailabilitySideBar.module.css";
  import HoursCard from "@/features/tutorAvailability/components/HoursCard";
  import { timeToMinutes } from "@/features/tutorAvailability/utils/calendarUtils";

  export default function VaulDrawer({slots: initialSlots = []}: {slots?: any[]}) {

    

      const [open, setOpen] = useState(false);
      const [slots, setSlots] = useState<any[]>(Array.isArray(initialSlots) ? initialSlots : []);
      const [mode, setMode] = useState<'onboarding' | 'edit'>('onboarding');
      const isSpaceInfoDialogOpenRef = useRef(false);

      const fetchSlots = useCallback(async () => {
      try {
          const res = await fetch("/api/tutor-availability/get-my-availability");
          if (res.status === 401) {
            window.location.replace("/");
            return;
          }
          if (!res.ok) {
            // Backend puede responder 404/204 cuando aún no existen franjas.
            /* if (res.status === 404 || res.status === 204) {
              setSlots([]);
              return;
            } */
            throw new Error("Failed to fetch slots");
          }

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

          const daysOrder = [
              "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"
          ];

          // Normaliza modality a array ordenado (soporta string legacy y arrays del backend)
          function normalizeModalityLocal(modality: any): string[] {
              if (!modality) return [];
              if (Array.isArray(modality)) return [...modality].sort();
              if (modality === 'BOTH') return ['PRES', 'VIRT'];
              return [modality];
          }

          // 1. Iterate through each day and merge contiguous slots
          daysOrder.forEach((day) => {
              if (!groupedByDay[day]) return;
              const daySlots = [...(groupedByDay[day] || [])]
                  .map((s: any) => ({
                      ...s,
                      startTime: s.startTime?.substring(0, 5) || s.startTime,
                      endTime: s.endTime?.substring(0, 5) || s.endTime,
                  }))
                  .sort(
                      (a: any, b: any) =>
                          timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
                  );

              let currentMerged: any = null;

              for (const slot of daySlots) {
                  const currentStart = slot.startTime || "";
                  const lastEnd = currentMerged?.endTime || "";
                  const sameModality =
                      JSON.stringify(normalizeModalityLocal(currentMerged?.modality)) ===
                      JSON.stringify(normalizeModalityLocal(slot.modality));
                  const sameStatus =
                      (currentMerged?.isAvailable === false ? true : Boolean(currentMerged?.isBooked)) ===
                      (slot.isAvailable === false ? true : Boolean(slot.isBooked));

                  if (currentMerged && sameModality && sameStatus && lastEnd === currentStart) {
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
              hours: `${slot.startTime?.substring(0, 5) || slot.startTime} → ${slot.endTime?.substring(0, 5) || slot.endTime}`
          }));

          setSlots(fetchedSlots);

      } catch (error) {
          console.error("Error al obtener los slots:", error);
          setSlots([]);
      }
  }, []);

      useEffect(() => {
          const handleCloseAvailabilitySidebar = () => {
            setOpen(false);
          };

          const handleSpaceInfoDialogOpen = () => {
            isSpaceInfoDialogOpenRef.current = true;
          };

          const handleSpaceInfoDialogClose = () => {
            isSpaceInfoDialogOpenRef.current = false;
          };

          const handleModeChanged = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            setMode(detail?.mode === 'edit' ? 'edit' : 'onboarding');
          };

          const syncModeFromDialog = () => {
            const dialog = document.getElementById('tutor-calendar-dialog');
            const dataMode = dialog?.dataset.mode;
            setMode(dataMode === 'edit' ? 'edit' : 'onboarding');
          };

          // Cargar slots al montar para asegurar frescura
          fetchSlots();
          syncModeFromDialog();

          // Escuchar evento de refresco
          window.addEventListener("refresh-slots", fetchSlots);
          window.addEventListener("close-availability-sidebar", handleCloseAvailabilitySidebar);
          window.addEventListener("space-info-dialog-open", handleSpaceInfoDialogOpen);
          window.addEventListener("space-info-dialog-close", handleSpaceInfoDialogClose);
          window.addEventListener("tutor-availability-mode-changed", handleModeChanged);
          window.addEventListener("open-tutor-calendar-dialog", handleModeChanged);
          return () => {
              window.removeEventListener("refresh-slots", fetchSlots);
            window.removeEventListener("close-availability-sidebar", handleCloseAvailabilitySidebar);
            window.removeEventListener("space-info-dialog-open", handleSpaceInfoDialogOpen);
            window.removeEventListener("space-info-dialog-close", handleSpaceInfoDialogClose);
            window.removeEventListener("tutor-availability-mode-changed", handleModeChanged);
            window.removeEventListener("open-tutor-calendar-dialog", handleModeChanged);
          };
      }, [fetchSlots]);




      const getDurationInHours = (start: string, end: string) => {
            const [sh, sm] = start.split(":").map(Number);
            const [eh, em] = end.split(":").map(Number);

            const startMinutes = sh * 60 + sm;
            const endMinutes = eh * 60 + em;

            return (endMinutes - startMinutes) / 60;
          };


        const handleSaveAvailability = (e: React.MouseEvent) => {
          e.stopPropagation();
          const totalHours = slots.reduce((acc, slot) => {
            return acc + getDurationInHours(slot.startTime, slot.endTime);
          }, 0);

          if (totalHours < 1) {
            sileo.error({
              title: "No se puede guardar",
              description: "Debes tener al menos 1 hora total en tus franjas.",
              fill: "#f35761",
              duration: 3500,
            });
            return;
          }

          sileo.success({
            title: mode === 'edit' ? "Disponibilidad actualizada" : "Disponibilidad validada",
            fill: "#58d68d",
            duration: 3000
          });

          setOpen(false);

          // En modo edición: cerrar sin dialog de límite ni tutorial.
          if (mode === 'edit') {
            window.dispatchEvent(new CustomEvent('close-tutor-calendar-dialog'));
            window.dispatchEvent(new CustomEvent('refresh-slots'));
            return;
          }

          window.dispatchEvent(new CustomEvent('open-hours-config-dialog', { detail: totalHours }));
      };

    return (
      <Drawer.Root open={open} onOpenChange={setOpen} direction="right" modal={false}>
        <Drawer.Trigger asChild>
          <button
            type="button"
            className={`
              ${open ? "h-10 w-10 opacity-0 pointer-events-none" : "h-14 w-14 opacity-100"}
              absolute z-[100] top-6 right-6 flex items-center justify-center
              rounded-full border border-[#C6C6C6] bg-white p-2
              transition-all duration-300
              cursor-pointer
            `}
          >
            <img src={sidebarLogo.src} alt="" />
          </button>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay
            className="fixed inset-0 bg-black/40 z-[1040]"
            onClick={() => {
              if (!isSpaceInfoDialogOpenRef.current) {
                setOpen(false);
              }
            }}
          />
          <Drawer.Content
            className="right-8 top-8 bottom-8 fixed z-[1050] outline-none w-[380px]"
            style={{ '--initial-transform': 'calc(100% + 50px)' } as React.CSSProperties}
            onInteractOutside={() => {
              // Importante: NO hacer preventDefault aquí, porque bloquea clicks
              // del SpaceInfoDialog (que está fuera del drawer).
              if (!isSpaceInfoDialogOpenRef.current) setOpen(false);
            }}
          >
            <div className="bg-zinc-50 w-full max-h-[600px] flex flex-col rounded-[16px] border border-[#C6C6C6] z-20">
              <div className="p-6 border-b border-[#C6C6C6]">
                <Drawer.Title className={styles.Title}>Tus franjas</Drawer.Title>
                <Drawer.Description className={styles.Description}>
                  Haz click en una franja para editarla
                </Drawer.Description>
              </div>
              <div className={styles.SlotsContainer}>
                {slots.length === 0 ? (
                  <p className={styles.Description}>Ningún slot</p>
                ) : (
                  slots.map((slot, index) => (
                    <HoursCard key={index} slot={slot} />
                  ))
                )}
              </div>
              {mode !== 'edit' && (
                <>
                  <hr className={styles.Separator}/>
                  <div className={styles.CloseButtonContainer}>
                    <button type="button" className={styles.CloseButton} onClick={handleSaveAvailability}>
                      Guardar disponibilidad
                    </button>
                  </div>
                </>
              )}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }