import React from "react";

const ADMIN_WA = "5561981854504";
const ENDERECO = "SRES Loja 121 - Cruzeiro Velho, Brasília - DF, 70640-515";
const ADMIN_PAINEL_URL = "https://barbearia-frontend-two.vercel.app/agendamentos-admin";

function buildWhatsUrl(phone, message) {
  const msg = encodeURIComponent(message || "");
  return `https://wa.me/${phone}?text=${msg}`;
}

function formatBR(dateISO) {
  const [y, m, d] = String(dateISO || "").split("-");
  if (!y || !m || !d) return dateISO || "-";
  return `${d}/${m}/${y}`;
}

export default function StepConfirmar({
  servico,
  barbeiro,
  dateISO,
  timeHHmm,
  observacao,
  setObservacao,
  submitting,
  onSubmit,
  error,
  success,
}) {
  const msgAdmin =
    `✅ *Novo agendamento*\n\n` +
    `✂️ *Serviço:* ${servico?.nome || "-"}\n` +
    `💈 *Barbeiro:* ${barbeiro?.nome || "-"}\n` +
    `📅 *Data/Hora:* ${formatBR(dateISO)} às ${timeHHmm}\n` +
    `📍 *Endereço:* ${ENDERECO}\n` +
    (String(observacao || "").trim() ? `📝 *Obs:* ${String(observacao).trim()}\n` : "") +
    `📌 *Status:* AGENDADO\n\n` +
    `🔎 Painel admin: ${ADMIN_PAINEL_URL}\n\n` +
    `Qualquer alteração responda esta mensagem.`;

  const whatsUrl = buildWhatsUrl(ADMIN_WA, msgAdmin);

  return (
    <div>
      <h2 style={{ margin: "0 0 10px 0" }}>5) Confirmar</h2>
      <p style={{ margin: "0 0 16px 0", opacity: 0.75 }}>
        Confira os dados antes de finalizar.
      </p>

      <div
        style={{
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 14,
          padding: 14,
          background: "rgba(255,255,255,0.02)",
          display: "grid",
          gap: 8,
          marginBottom: 14,
        }}
      >
        <div><strong>Serviço:</strong> {servico?.nome}</div>
        <div><strong>Barbeiro:</strong> {barbeiro?.nome}</div>
        <div><strong>Data:</strong> {dateISO}</div>
        <div><strong>Hora:</strong> {timeHHmm}</div>
        <div style={{ opacity: 0.7, fontSize: 13 }}>Duração: 30 min</div>
      </div>

      <label style={{ display: "grid", gap: 8 }}>
        <span style={{ fontSize: 13, opacity: 0.85 }}>Observação (opcional)</span>
        <textarea
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          rows={3}
          style={{
            width: "100%",
            borderRadius: 12,
            padding: 12,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.02)",
            color: "inherit",
            outline: "none",
            resize: "vertical",
          }}
          placeholder="Ex: quero degradê baixo, sem tirar muito em cima..."
        />
      </label>

      {error ? (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 12, border: "1px solid rgba(255,80,80,0.35)", background: "rgba(255,80,80,0.08)" }}>
          {error}
        </div>
      ) : null}

      {success ? (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 12, border: "1px solid rgba(80,255,160,0.25)", background: "rgba(80,255,160,0.08)" }}>
          {success}
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(255,255,255,0.06)",
            color: "inherit",
            cursor: submitting ? "not-allowed" : "pointer",
            fontWeight: 700,
          }}
        >
          {submitting ? "Confirmando..." : "Confirmar agendamento"}
        </button>

        <a
          href={whatsUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid rgba(37,211,102,0.55)",
            background: "rgba(37,211,102,0.12)",
            color: "inherit",
            textDecoration: "none",
            fontWeight: 900,
          }}
          title="Abre o WhatsApp com mensagem pronta"
        >
          WhatsApp (mensagem pronta)
        </a>
      </div>
    </div>
  );
}