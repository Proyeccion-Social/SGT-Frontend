import { useState, useEffect } from "react";
import { ProfileSettingsDialog } from "@/features/profileSettings/components/islands/ProfileSettingsDialog";

/**
 * Detects `?setup=preferences` in the URL (set by ConfirmEmailForm after
 * email verification) and automatically opens ProfileSettingsDialog on the
 * preferences tab. Cleans the query param so a page refresh won't re-open it.
 */
export default function FirstLoginSetup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("setup") === "preferences") {
      // Remove the param from the URL without a reload
      params.delete("setup");
      const newUrl =
        window.location.pathname + (params.toString() ? `?${params}` : "");
      window.history.replaceState({}, "", newUrl);
      setOpen(true);
    }
  }, []);

  if (!open) return null;

  return (
    <ProfileSettingsDialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen && open) {
          window.dispatchEvent(new CustomEvent("tutorial:start"));
        }
      }}
      initialView="preferences"
    />
  );
}
