import { useState } from "react";
import presencialIcon from "../../assets/presencial.svg";
import virtualIcon from "../../assets/virtual.svg";

interface Props {
  onNext: (modality: "VIRT" | "PRES") => void;
  onBack: () => void;
}

export default function ModalityStep({ onNext, onBack }: Props) {
  const [selected, setSelected] = useState<"VIRT" | "PRES" | null>(null);

  const options = [
    { value: "VIRT" as const, label: "Virtual", icon: virtualIcon },
    { value: "PRES" as const, label: "Presencial", icon: presencialIcon },
  ];

  return (
    <div>
      <h2 style={{ fontSize: "32px", fontWeight: 700, margin: "0 0 8px", lineHeight: 1.2 }}>
        <span style={{ background: "#ede9fe", borderRadius: "6px", padding: "0 4px" }}>
          Información
        </span>{" "}
        adicional
      </h2>
      <p style={{ color: "#6b7280", fontSize: "15px", margin: "0 0 32px" }}>
        Estás agendando un espacio nuevo
      </p>

      <div style={{
        border: "1px solid #e5e7eb", borderRadius: "16px",
        padding: "32px", background: "#fafafa"
      }}>
        <h3 style={{ textAlign: "center", fontSize: "18px", fontWeight: 700, margin: "0 0 4px" }}>
          Modalidad
        </h3>
        <p style={{ textAlign: "center", fontSize: "13px", color: "#6b7280", margin: "0 0 24px" }}>
          ¿Virtual o presencial?
        </p>

        <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
          {options.map(({ value, label, icon }) => (
            <button
              key={value}
              onClick={() => setSelected(value)}
              style={{
                position: "relative",
                overflow: "visible",
                width: "160px", height: "140px",
                border: "none",
                borderRadius: "14px",
                background: selected === value ? "#ede9fe" : "#f3f4f6",
                cursor: "pointer",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: "12px", fontSize: "14px",
                color: "#7c3aed", fontWeight: 500,
              }}
            >
              {selected === value && (
                <div style={{
                    position: "absolute",
                    top: "-10px",
                    left: "-10px",
                    width: "24px",
                    height: "24px",
                    background: "#CFB9FF",
                    borderRadius: "100px",
                    transform: "rotate(20deg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 2,
                }}>
                <svg
                width="10"
                height="8"
                viewBox="0 0 10 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                >
                <path
                    d="M1 3.5L3.5 6.5L9 1"
                    stroke="#3C3C3C"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                </svg>
            </div>
            )}
              <img src={icon.src} alt={label} style={{ width: "48px", height: "48px" }} />
              {label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
          <button
            disabled={!selected}
            onClick={() => selected && onNext(selected)}
            style={{
              background: selected ? "#7c3aed" : "#c4b5fd",
              color: "#fff", border: "none",
              borderRadius: "10px", padding: "12px 28px",
              fontSize: "15px", fontWeight: 600,
              cursor: selected ? "pointer" : "not-allowed",
            }}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}