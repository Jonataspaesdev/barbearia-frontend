import React from "react";
import { addDays, toISODate, weekdayShortPt, formatBRDate } from "../utils/dateUtils";
import "./WizardPieces.css";

export default function DayPicker({ selectedDate, onSelectDate, days = 14 }) {
  const today = new Date();

  const items = Array.from({ length: days }).map((_, i) => {
    const d = addDays(today, i);
    const iso = toISODate(d);
    return { iso, label: weekdayShortPt(d), br: formatBRDate(iso) };
  });

  return (
    <div className="dayGrid">
      {items.map((it) => (
        <button
          key={it.iso}
          type="button"
          className={`dayBtn ${selectedDate === it.iso ? "selected" : ""}`}
          onClick={() => onSelectDate(it.iso)}
        >
          <div className="dayDow">{it.label}</div>
          <div className="dayDate">{it.br}</div>
        </button>
      ))}
    </div>
  );
}