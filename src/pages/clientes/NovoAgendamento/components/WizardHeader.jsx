import React from "react";
import "./WizardPieces.css";

export default function WizardHeader({ step, steps, onBack, onReset }) {
  return (
    <div className="wizHeader">
      <div className="wizTop">
        <div>
          <h1 className="wizTitle">Novo Agendamento</h1>
          <p className="wizSubtitle">Siga os passos abaixo para marcar seu horário.</p>
        </div>

        <div className="wizActions">
          {step > 1 ? (
            <button className="btnGhost" onClick={onBack} type="button">
              Voltar
            </button>
          ) : (
            <button className="btnGhost" onClick={onReset} type="button">
              Reiniciar
            </button>
          )}
        </div>
      </div>

      <div className="wizSteps">
        {steps.map((s, idx) => {
          const num = idx + 1;
          const active = num === step;
          const done = num < step;
          return (
            <div
              key={s}
              className={`wizStep ${active ? "active" : ""} ${done ? "done" : ""}`}
              title={s}
            >
              <div className="wizDot">{num}</div>
              <div className="wizLabel">{s}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}