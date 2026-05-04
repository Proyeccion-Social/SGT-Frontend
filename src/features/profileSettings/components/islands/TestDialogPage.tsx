import { useState } from "react";
import { ProfileSettingsDialog } from "./ProfileSettingsDialog";

export default function TestDialogPage() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ padding: 40 }}>
      <button onClick={() => setOpen(true)}>Abrir dialog</button>
      <ProfileSettingsDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
