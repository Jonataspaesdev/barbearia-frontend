import React from "react";
import "./WizardPieces.css";

export default function TimeGrid({
  slots = [],
  availabilityMap = {},
  selectedTime,
  onPick,
}) {
  return (
    <div className="timeGrid">
      {slots.map((t) => {
        const disponivel = availabilityMap[t] !== false; // padrão: true
        const selected = selectedTime === t;

        return (
          <button
            key={t}
            type="button"
            className={`timeBtn ${selected ? "selected" : ""}`}
            disabled={!disponivel}
            onClick={() => disponivel && onPick?.(t)}
            title={!disponivel ? "Indisponível" : "Selecionar"}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}