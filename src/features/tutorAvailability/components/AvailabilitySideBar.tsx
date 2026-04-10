'use client';

import { Drawer } from 'vaul';
import sidebarLogo from "@/features/tutorAvailability/assets/sidebarLogo.svg"
import { useState } from 'react';
import styles from "@/features/tutorAvailability/css/AvailabilitySideBar.module.css";
import HoursCard from "@/features/tutorAvailability/components/HoursCard";

export default function VaulDrawer() {

    const [open, setOpen] = useState(false);

  return (
    <Drawer.Root open={open} onOpenChange={setOpen} direction="right" modal={false}>
        <Drawer.Trigger asChild>
  <button
    className={`
      ${open ? "h-10 w-10" : "h-14 w-14"}
      absolute z-20 top-6 right-6 flex items-center justify-center
      rounded-full border border-[#C6C6C6] bg-white p-2
      transition-all duration-300
      cursor-pointer
    `}
  >
    <img src={sidebarLogo.src} alt="" />
  </button>
</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content
          className="right-8 top-8 bottom-8 fixed z-10 outline-none w-[380px]"
          style={{ '--initial-transform': 'calc(100% + 50px)' } as React.CSSProperties}
        >
          <div className="bg-zinc-50 h-auto w-full grow flex flex-col rounded-[16px] border border-[#C6C6C6]">
            <div className="p-5">
              <Drawer.Title className={styles.Title}>Tus franjas</Drawer.Title>
              <Drawer.Description className={styles.Description}>
                Haz click en una franja para editarla
              </Drawer.Description>
            </div>
            <hr className={styles.Separator}/>
            <div className={styles.SlotsContainer}>
              <HoursCard />
              <HoursCard />
              <HoursCard />
              <HoursCard />
              <HoursCard />
              <HoursCard />
              <HoursCard />
              <HoursCard />
              <HoursCard />
              <HoursCard />
              <HoursCard />
              <HoursCard />
              <HoursCard />
              <HoursCard />
              <HoursCard />
              <HoursCard />
            </div>
            <hr className={styles.Separator}/>
            <div className={styles.CloseButtonContainer}>
              <Drawer.Close className={styles.CloseButton}>
                Guardar disponibilidad
              </Drawer.Close>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}