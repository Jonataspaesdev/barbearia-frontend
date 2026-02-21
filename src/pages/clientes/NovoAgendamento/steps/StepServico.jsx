import React from "react";
import CardSelect from "../components/CardSelect";

export default function StepServico({ servicos, selected, onSelect, onNext }) {
  return (
    <div>
      <h2 style={{ margin: "0 0 10px 0" }}>1) Escolha o serviço</h2>
      <p style={{ margin: "0 0 16px 0", opacity: 0.75 }}>
        Clique em um serviço para continuar.
      </p>

      <div style={{ display: "grid", gap: 10 }}>
        {servicos.map((s) => (
          <CardSelect
            key={s.id}
            title={s.nome}
            subtitle="Duração: 30 min"
            right={typeof s.preco !== "undefined" ? `R$ ${Number(s.preco).toFixed(2)}` : ""}
            selected={selected?.id === s.id}
            onClick={() => {
              onSelect(s);
              onNext();
            }}
          />
        ))}
      </div>
    </div>
  );
}