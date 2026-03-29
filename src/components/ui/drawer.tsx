'use client';

import { Drawer } from 'vaul';
import React from 'react';
import './styles/drawer.css';
import numberOne from './images/number-one.png';

export default function VaulDrawer() {
    const [ isOpen, setIsOpen ] = React.useState(false);
    const [ step, setStep ] = React.useState(1);
    
    return (
        <Drawer.Root dismissible={false} open={isOpen} onOpenChange={setIsOpen}>
            <Drawer.Trigger>Open</Drawer.Trigger>
            <Drawer.Portal>
                <Drawer.Overlay className="drawer-overlay" />
                <Drawer.Content className="drawer-content">
                    <div className="drawer-wrapper">
                        <div aria-hidden className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-8" />
                        <div className="drawer-header">
                            <Drawer.Title className="drawer-title">Completemos tu perfil</Drawer.Title>
                            <Drawer.Description className="drawer-description">Bienvenido userName</Drawer.Description>
                        </div>
                        {/* {step === 1 && <ChooseSubjects />}
                        {step === 2 && <UploadProfileImage />}
                        {step === 3 && <SetAvailabilityHours />}
                        {step === 4 && <SetNewPassword />}
                        {step === 5 && <Finish />} */}
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}