import React from "react";
import DayPicker from "../components/DayPicker";

export default function StepData({ selectedDate, onSelectDate, onNext }) {
  return (
    <div>
      <h2 style={{ margin: "0 0 10px 0" }}>3) Escolha a data</h2>
      <p style={{ margin: "0 0 16px 0", opacity: 0.75 }}>
        Mostrando os próximos 14 dias.
      </p>

      <DayPicker
        selectedDate={selectedDate}
        onSelectDate={(iso) => {
          onSelectDate(iso);
          onNext();
        }}
      />
    </div>
  );
}