  'use client';

  import { Drawer } from 'vaul';
  import sidebarLogo from "@/features/tutorAvailability/assets/sidebarLogo.svg"
  import { useState, useEffect, useCallback, useRef } from 'react';
  import { sileo } from 'sileo';
  import styles from "@/features/tutorAvailability/css/AvailabilitySideBar.module.css";
  import HoursCard from "@/features/tutorAvailability/components/HoursCard";

  export default function VaulDrawer({slots: initialSlots = []}: {slots?: any[]}) {

    

      const [open, setOpen] = useState(false);
      const [slots, setSlots] = useState<any[]>(Array.isArray(initialSlots) ? initialSlots : []);
      const isSpaceInfoDialogOpenRef = useRef(false);

      const fetchSlots = useCallback(async () => {
      try {
          const res = await fetch("/api/tutor-availability/get-my-availability");
          if (!res.ok) {
            // Backend puede responder 404/204 cuando aún no existen franjas.
            if (res.status === 404 || res.status === 204) {
              setSlots([]);
              return;
            }
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

          // 1. Iterate through each day and merge contiguous slots
          daysOrder.forEach((day) => {
              if (!groupedByDay[day]) return;
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
          const handleCloseAvailabilitySidebar = () => {
            setOpen(false);
          };

          const handleSpaceInfoDialogOpen = () => {
            isSpaceInfoDialogOpenRef.current = true;
          };

          const handleSpaceInfoDialogClose = () => {
            isSpaceInfoDialogOpenRef.current = false;
          };

          // Cargar slots al montar para asegurar frescura
          fetchSlots();

          // Escuchar evento de refresco
          window.addEventListener("refresh-slots", fetchSlots);
          window.addEventListener("close-availability-sidebar", handleCloseAvailabilitySidebar);
          window.addEventListener("space-info-dialog-open", handleSpaceInfoDialogOpen);
          window.addEventListener("space-info-dialog-close", handleSpaceInfoDialogClose);
          return () => {
              window.removeEventListener("refresh-slots", fetchSlots);
            window.removeEventListener("close-availability-sidebar", handleCloseAvailabilitySidebar);
            window.removeEventListener("space-info-dialog-open", handleSpaceInfoDialogOpen);
            window.removeEventListener("space-info-dialog-close", handleSpaceInfoDialogClose);
          };
      }, [fetchSlots]);




      const getDurationInHours = (start: string, end: string) => {
            const [sh, sm] = start.split(":").map(Number);
            const [eh, em] = end.split(":").map(Number);

            const startMinutes = sh * 60 + sm;
            const endMinutes = eh * 60 + em;

            return (endMinutes - startMinutes) / 60;
          };


          const openHoursConfigDialog = (e: React.MouseEvent) => {
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

          console.log("HORAS:", totalHours);
          // Cierra el drawer localmente antes de abrir el dialog.
          setOpen(false);
          
          // Abre el dialog en el siguiente tick cuando el drawer ya terminó de cerrar.
            window.dispatchEvent(new CustomEvent('open-hours-config-dialog', { detail: totalHours }));
          
      };

    return (
      <Drawer.Root open={open} onOpenChange={setOpen} direction="right" modal={false}>
        <button
      type="button"
          className={`
            ${open ? "h-10 w-10" : "h-14 w-14"}
            absolute z-[100] top-6 right-6 flex items-center justify-center
            rounded-full border border-[#C6C6C6] bg-white p-2
            transition-all duration-300
            cursor-pointer
          `}
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
        >
          <img src={sidebarLogo.src} alt="" />
        </button>
        <Drawer.Overlay
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => {
            if (!isSpaceInfoDialogOpenRef.current) {
              setOpen(false);
            }
          }}
        />
          <Drawer.Content
            className="right-8 top-8 bottom-8 fixed z-50 outline-none w-[380px]"
            style={{ '--initial-transform': 'calc(100% + 50px)' } as React.CSSProperties}
            onInteractOutside={(event) => {
              // Importante: NO hacer preventDefault aquí, porque bloquea clicks
              // del SpaceInfoDialog (que está fuera del drawer).
              if (!isSpaceInfoDialogOpenRef.current) setOpen(false);
            }}
            
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
                {slots.length === 0 ? (
                  <p className={styles.Description}>Ningún slot</p>
                ) : (
                  slots.map((slot, index) => (
                    <HoursCard key={index} slot={slot} />
                  ))
                )}
              </div>
              <hr className={styles.Separator}/>
              <div className={styles.CloseButtonContainer}>
                <button type="button" className={styles.CloseButton} onClick={openHoursConfigDialog}>
                  Guardar disponibilidad
                </button>
              </div>
            </div>
          </Drawer.Content>
          
      </Drawer.Root>
    );
  }