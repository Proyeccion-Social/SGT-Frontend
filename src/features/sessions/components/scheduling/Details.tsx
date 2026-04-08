import { useState } from "react";

interface Props {
  onNext: (title: string, description: string) => void;
  onBack: () => void;
}

export default function DetailsStep({ onNext, onBack }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

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
        <div style={{ marginBottom: "28px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 4px" }}>Tema</h3>
          <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 12px" }}>
            Escribe el tema que quieres que sea tratado en la tutoría
          </p>
          <input
            type="text"
            placeholder="Introducción a derivadas parciales"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: "100%", padding: "12px 14px",
              border: "1.5px solid #d1d5db", borderRadius: "10px",
              fontSize: "14px", outline: "none", boxSizing: "border-box",
              background: "#fff"
            }}
          />
        </div>

        <div>
          <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 4px" }}>Descripción</h3>
          <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 12px" }}>
            Describe de una manera clara y concisa el objetivo del espacio
          </p>
          <textarea
            placeholder="Introducción a derivadas parciales"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            style={{
              width: "100%", padding: "12px 14px",
              border: "1.5px solid #d1d5db", borderRadius: "10px",
              fontSize: "14px", outline: "none", resize: "none",
              boxSizing: "border-box", background: "#fff"
            }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
          <button
            disabled={!title || !description}
            onClick={() => onNext(title, description)}
            style={{
              background: title && description ? "#7c3aed" : "#c4b5fd",
              color: "#fff", border: "none",
              borderRadius: "10px", padding: "12px 28px",
              fontSize: "15px", fontWeight: 600,
              cursor: title && description ? "pointer" : "not-allowed",
            }}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}