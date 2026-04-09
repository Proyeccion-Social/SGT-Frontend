'use client';

import { Drawer } from 'vaul';
import sidebarLogo from "@/features/tutorAvailability/assets/sidebarLogo.svg"
import { useState } from 'react';
import "@/features/tutorAvailability/css/AvailabilitySideBarSTYLES.css";
import HoursCard from "@/features/tutorAvailability/components/HoursCard";

export default function VaulDrawer() {

    const [open, setOpen] = useState(false);

  return (
    <Drawer.Root open={open} onOpenChange={setOpen} direction="right">
        <Drawer.Trigger asChild>
  <button
    className={`
      ${open ? "h-10 w-10" : "h-12 w-12"}
      absolute z-20 top-2 right-2 flex items-center justify-center
      rounded-full border border-[#C6C6C6] bg-white p-2
      transition-all duration-300
    `}
  >
    <img src={sidebarLogo.src} alt="" />
  </button>
</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content
          className="right-6 top-6 bottom-6 fixed z-10 outline-none w-[380px]  "
          style={{ '--initial-transform': 'calc(100% + 8px)' } as React.CSSProperties}
        >
          <div className="bg-zinc-50 h-auto w-full grow  flex flex-col rounded-[16px] ">
            <div className="p-5">
              <Drawer.Title className="Title">Tus franjas</Drawer.Title>
              <Drawer.Description className="Description">
                Haz click en una franja para editarla
              </Drawer.Description>
            </div>
            <hr className="Separator"/>
            <div className="SlotsContainer">
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
            <hr className="Separator"/>
            <div className="CloseButtonContainer">
              <Drawer.Close className="CloseButton">
                Guardar disponibilidad
              </Drawer.Close>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}