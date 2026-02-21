import React from "react";
import TimeGrid from "../components/TimeGrid";

export default function StepHorario({
  loading,
  slots,
  availabilityMap,
  selectedTime,
  onPickTime,
  onNext,
}) {
  return (
    <div>
      <h2 style={{ margin: "0 0 10px 0" }}>4) Escolha o horário</h2>
      <p style={{ margin: "0 0 16px 0", opacity: 0.75 }}>
        Horários indisponíveis ficam desabilitados.
      </p>

      {loading ? (
        <div style={{ opacity: 0.75 }}>Carregando horários...</div>
      ) : (
        <TimeGrid
          slots={slots}
          availabilityMap={availabilityMap}
          selectedTime={selectedTime}
          onPick={(t) => {
            onPickTime(t);
            onNext();
          }}
        />
      )}
    </div>
  );
}