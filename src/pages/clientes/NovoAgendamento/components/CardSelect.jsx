import React from "react";
import "./WizardPieces.css";

export default function CardSelect({
  title,
  subtitle,
  selected,
  onClick,
  right,
}) {
  return (
    <button
      className={`cardSelect ${selected ? "selected" : ""}`}
      onClick={onClick}
      type="button"
    >
      <div className="cardText">
        <div className="cardTitle">{title}</div>
        {subtitle ? <div className="cardSubtitle">{subtitle}</div> : null}
      </div>
      {right ? <div className="cardRight">{right}</div> : null}
    </button>
  );
}