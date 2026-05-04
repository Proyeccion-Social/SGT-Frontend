'use client';

import { Drawer } from 'vaul';
import helpIconTrigger from "@/features/tutorAvailability/assets/helpIconTrigger.svg"
import { useState } from 'react';
import styles from "@/features/tutorAvailability/css/HelpSideBar.module.css";
import closeIcon from "@/features/tutorAvailability/assets/closeHelpDialog.svg";

export default function VaulDrawer() {


    const [open, setOpen] = useState(false);

  return (
    <Drawer.Root open={open} onOpenChange={setOpen} direction="left"  modal={false}>
        <Drawer.Trigger asChild>
  <button
    className={`
      h-[52px] w-[52px]
      absolute z-20 top-6 left-6 flex items-center justify-center
      rounded-full bg-[#9F74FF] p-2
      transition-all duration-300
      cursor-pointer
      outline-none focus:outline-none active:outline-none
      ${open ? "opacity-0 pointer-events-none" : "opacity-100"}
    `}
  >
    <img src={helpIconTrigger.src} alt="" />
  </button>
</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[1040]" />
        <Drawer.Content
          className="left-6 top-6 bottom-6 fixed z-[1050] outline-none w-[378px]  h-[128px]"
          style={{ '--initial-transform': 'calc(100% + 50px)' } as React.CSSProperties}
        >
          <div className="bg-zinc-50 h-auto w-full grow flex flex-col rounded-[24px] border border-[#CFB9FF]">
            <div>
              <Drawer.Title className={styles.Title}>¿Cómo funciona?
                <Drawer.Close className={styles.CloseButton}>
                <img src={closeIcon.src} alt="" />
              </Drawer.Close>
              </Drawer.Title>
              <Drawer.Description className={styles.Description}>
                Haz clic y arrastra sobre el calendario para crear una franja horaria.
              </Drawer.Description>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}