import { useState, useEffect } from "react";
import { ProfileSettingsDialog } from "@/features/profileSettings/components/islands/ProfileSettingsDialog";

/**
 * Detects `openProfileDrawer` in sessionStorage (set by ConfirmEmailForm after
 * email verification) and automatically opens ProfileSettingsDialog on the
 * preferences tab. Cleans the sessionStorage so a page refresh won't re-open it.
 */
export default function FirstLoginSetup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("openProfileDrawer") === "true") {
      sessionStorage.removeItem("openProfileDrawer");
      setOpen(true);
    }
  }, []);

  if (!open) return null;

  return (
    <ProfileSettingsDialog
      open={open}
      onOpenChange={setOpen}
      initialView="preferences"
    />
  );
}
