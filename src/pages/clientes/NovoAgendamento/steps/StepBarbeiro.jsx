import React from "react";
import CardSelect from "../components/CardSelect";

export default function StepBarbeiro({ barbeiros, selected, onSelect, onNext }) {
  return (
    <div>
      <h2 style={{ margin: "0 0 10px 0" }}>2) Escolha o barbeiro</h2>
      <p style={{ margin: "0 0 16px 0", opacity: 0.75 }}>
        Horário de trabalho padrão: 09:00 às 18:30.
      </p>

      <div style={{ display: "grid", gap: 10 }}>
        {barbeiros.map((b) => (
          <CardSelect
            key={b.id}
            title={b.nome}
            subtitle={`Trabalha: ${b.horaEntrada || "09:00"} - ${b.horaSaida || "18:30"}`}
            selected={selected?.id === b.id}
            onClick={() => {
              onSelect(b);
              onNext();
            }}
          />
        ))}
      </div>
    </div>
  );
}