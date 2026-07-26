import { useState, useEffect } from 'react';
import { TutorProfileDialog } from '@/features/profileSettings/components/islands/TutorProfileDialog';

export default function SettingsOpener() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(true);
  }, []);

  if (!open) return null;

  return (
    <TutorProfileDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          window.location.href = '/dashboard';
        }
      }}
    />
  );
}
