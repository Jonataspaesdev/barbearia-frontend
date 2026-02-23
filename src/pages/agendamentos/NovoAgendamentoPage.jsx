import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

const DURACAO_MIN = 30;
const STEPS = ["Serviço", "Barbeiro", "Data", "Horário", "Confirmar"];

/* ===================== Utils ===================== */

function getClienteId() {
  const v = localStorage.getItem("clienteId");
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function toISODate(dateObj) {
  const y = dateObj.getFullYear();
  const m = pad2(dateObj.getMonth() + 1);
  const d = pad2(dateObj.getDate());
  return `${y}-${m}-${d}`;
}

function formatBRDate(isoDate) {
  const [y, m, d] = String(isoDate).split("-");
  if (!y || !m || !d) return isoDate;
  return `${d}/${m}/${y}`;
}

function weekdayShortPt(dateObj) {
  const map = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  return map[dateObj.getDay()];
}

function addDays(dateObj, days) {
  const d = new Date(dateObj);
  d.setDate(d.getDate() + days);
  return d;
}

function parseTimeToMinutes(hhmm) {
  const [h, m] = String(hhmm).split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${pad2(h)}:${pad2(m)}`;
}

function combineDateTimeISO(dateISO, timeHHmm) {
  return `${dateISO}T${timeHHmm}:00`;
}

function isSlotNoFuturo(dateISO, timeHHmm) {
  if (!dateISO || !timeHHmm) return true;
  const dt = new Date(`${dateISO}T${timeHHmm}:00`);
  if (Number.isNaN(dt.getTime())) return true;
  return dt.getTime() > Date.now();
}

function gerarSlotsTrabalho(horaEntrada = "09:00", horaSaida = "18:30") {
  const start = parseTimeToMinutes(horaEntrada);
  const end = parseTimeToMinutes(horaSaida);

  const slots = [];
  for (let t = start; t <= end - DURACAO_MIN; t += DURACAO_MIN) {
    slots.push(minutesToTime(t));
  }
  return slots;
}

function formatBRL(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function extrairMensagemErro(err) {
  const status = err?.response?.status;
  const data = err?.response?.data;

  if (data) {
    if (typeof data.mensagem === "object" && data.mensagem !== null) {
      const msgs = Object.entries(data.mensagem)
        .map(([campo, msg]) => `${campo}: ${msg}`)
        .join(" | ");
      return `(${status}) ${data.erro || "Erro"}: ${msgs}`;
    }

    if (typeof data.mensagem === "string") {
      return `(${status}) ${data.erro || "Erro"}: ${data.mensagem}`;
    }

    if (typeof data === "string" && data.trim()) return `(${status}) ${data}`;
    if (data.erro) return `(${status}) ${data.erro}`;
    if (data.message) return `(${status}) ${data.message}`;
  }

  if (status) return `(${status}) Erro ao criar agendamento.`;
  return "Erro ao criar agendamento.";
}

/* ===================== UI ===================== */

function WizardHeader({ step, onBack, onReset }) {
  return (
    <div style={styles.wizHeader}>
      <div style={styles.wizTop}>
        <div>
          <h1 style={styles.wizTitle}>Novo Agendamento</h1>
          <p style={styles.wizSubtitle}>Siga os passos e escolha um horário disponível.</p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {step > 1 ? (
            <button style={styles.btnGhost} type="button" onClick={onBack}>
              Voltar
            </button>
          ) : (
            <button style={styles.btnGhost} type="button" onClick={onReset}>
              Reiniciar
            </button>
          )}
        </div>
      </div>

      <div style={styles.wizSteps}>
        {STEPS.map((label, idx) => {
          const num = idx + 1;
          const active = num === step;
          const done = num < step;

          return (
            <div
              key={label}
              style={{
                ...styles.wizStep,
                ...(active ? styles.wizStepActive : null),
                ...(done ? styles.wizStepDone : null),
              }}
              title={label}
            >
              <div style={styles.wizDot}>{num}</div>
              <div style={styles.wizLabel}>{label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CardSelect({ title, subtitle, right, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...styles.cardSelect,
        ...(selected ? styles.cardSelectSelected : null),
      }}
    >
      <div>
        <div style={styles.cardTitle}>{title}</div>
        {subtitle ? <div style={styles.cardSubtitle}>{subtitle}</div> : null}
      </div>
      {right ? <div style={styles.cardRight}>{right}</div> : null}
    </button>
  );
}

function DayPicker({ selectedDate, onSelectDate, days = 14 }) {
  const today = new Date();
  const items = Array.from({ length: days }).map((_, i) => {
    const d = addDays(today, i);
    const iso = toISODate(d);
    return { iso, dow: weekdayShortPt(d), br: formatBRDate(iso) };
  });

  return (
    <div style={styles.dayGrid}>
      {items.map((it) => (
        <button
          key={it.iso}
          type="button"
          onClick={() => onSelectDate(it.iso)}
          style={{
            ...styles.dayBtn,
            ...(selectedDate === it.iso ? styles.dayBtnSelected : null),
          }}
        >
          <div style={styles.dayDow}>{it.dow}</div>
          <div style={styles.dayDate}>{it.br}</div>
        </button>
      ))}
    </div>
  );
}

function TimeGrid({ slots, availabilityMap, selectedTime, onPick }) {
  return (
    <div style={styles.timeGrid}>
      {slots.map((t) => {
        const ok = availabilityMap?.[t] === true;
        const disabled = !ok;

        return (
          <button
            key={t}
            type="button"
            disabled={disabled}
            onClick={() => onPick(t)}
            title={disabled ? "Indisponível" : "Selecionar horário"}
            style={{
              ...styles.timeBtn,
              ...(selectedTime === t ? styles.timeBtnSelected : null),
              ...(disabled ? styles.timeBtnDisabled : null),
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
              <div style={{ fontWeight: 900 }}>{t}</div>
              <div style={{ fontSize: 11, opacity: disabled ? 0.65 : 0.85 }}>
                {disabled ? "Indisponível" : "Disponível"}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ===================== Page ===================== */

export default function NovoAgendamentoPage() {
  const navigate = useNavigate();
  const clienteId = getClienteId();

  const [step, setStep] = useState(1);

  const [loadingInit, setLoadingInit] = useState(true);
  const [errorInit, setErrorInit] = useState("");

  const [servicos, setServicos] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);

  // ✅ disponibilidade real do backend
  const [dispLoading, setDispLoading] = useState(false);
  const [dispError, setDispError] = useState("");
  const [dispData, setDispData] = useState(null); // { horaEntrada, horaSaida, ocupados: [] }

  const [servico, setServico] = useState(null);
  const [barbeiro, setBarbeiro] = useState(null);
  const [dateISO, setDateISO] = useState("");
  const [timeHHmm, setTimeHHmm] = useState("");
  const [observacao, setObservacao] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const servicosAtivos = useMemo(() => {
    const lista = Array.isArray(servicos) ? servicos : [];
    const temAtivo = lista.some((s) => typeof s?.ativo === "boolean");
    return temAtivo ? lista.filter((s) => s?.ativo === true) : lista;
  }, [servicos]);

  // Load inicial (servicos e barbeiros)
  useEffect(() => {
    let alive = true;

    async function load() {
      setLoadingInit(true);
      setErrorInit("");
      setErro("");
      setSucesso("");

      if (!clienteId) {
        setErrorInit("Não achei seu clienteId. Faça login novamente como CLIENTE.");
        setLoadingInit(false);
        return;
      }

      try {
        const respS = await api.get("/servicos");
        if (!alive) return;
        setServicos(Array.isArray(respS.data) ? respS.data : []);
      } catch (e) {
        if (!alive) return;
        setErrorInit("Não consegui carregar serviços (GET /servicos).");
        setLoadingInit(false);
        return;
      }

      try {
        const respB = await api.get("/barbeiros");
        if (!alive) return;
        const lista = Array.isArray(respB.data) ? respB.data : [];
        setBarbeiros(lista);

        const barbeiroPadrao = localStorage.getItem("barbeiroIdPadrao");
        if (barbeiroPadrao) {
          const found = lista.find((b) => String(b.id) === String(barbeiroPadrao));
          if (found) setBarbeiro(found);
        }
      } catch (e) {
        if (!alive) return;
        setErrorInit("Não consegui carregar barbeiros (GET /barbeiros).");
        setLoadingInit(false);
        return;
      } finally {
        if (alive) setLoadingInit(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [clienteId]);

  // sempre que trocar barbeiro ou data: reseta horário e busca disponibilidade
  useEffect(() => {
    setTimeHHmm("");
    setDispData(null);
    setDispError("");

    async function fetchDisponibilidade() {
      if (!barbeiro?.id || !dateISO) return;

      setDispLoading(true);
      setDispError("");

      try {
        const resp = await api.get(
          `/agendamentos/disponibilidade?barbeiroId=${barbeiro.id}&data=${dateISO}`
        );
        setDispData(resp.data || null);
      } catch (e) {
        setDispError("Não consegui carregar disponibilidade. Tente novamente.");
        setDispData(null);
      } finally {
        setDispLoading(false);
      }
    }

    fetchDisponibilidade();
  }, [barbeiro?.id, dateISO]);

  const slots = useMemo(() => {
    const entrada = dispData?.horaEntrada || barbeiro?.horaEntrada || "09:00";
    const saida = dispData?.horaSaida || barbeiro?.horaSaida || "18:30";
    return gerarSlotsTrabalho(String(entrada).slice(0, 5), String(saida).slice(0, 5));
  }, [dispData?.horaEntrada, dispData?.horaSaida, barbeiro?.horaEntrada, barbeiro?.horaSaida]);

  const ocupadosSet = useMemo(() => {
    const arr = dispData?.ocupados;
    const set = new Set();
    if (Array.isArray(arr)) {
      for (const h of arr) {
        if (typeof h === "string" && h.includes(":")) set.add(h.slice(0, 5));
      }
    }
    return set;
  }, [dispData]);

  const availabilityMap = useMemo(() => {
    if (!barbeiro?.id || !dateISO) return {};
    const map = {};
    for (const t of slots) {
      const okFuturo = isSlotNoFuturo(dateISO, t);
      const ocupado = ocupadosSet.has(t);
      map[t] = okFuturo && !ocupado;
    }
    return map;
  }, [slots, ocupadosSet, barbeiro?.id, dateISO]);

  const resumoBadges = useMemo(() => {
    const arr = [];
    if (servico?.nome) arr.push(`Serviço: ${servico.nome}`);
    if (barbeiro?.nome) arr.push(`Barbeiro: ${barbeiro.nome}`);
    if (dateISO) arr.push(`Data: ${formatBRDate(dateISO)}`);
    if (timeHHmm) arr.push(`Hora: ${timeHHmm}`);
    return arr;
  }, [servico, barbeiro, dateISO, timeHHmm]);

  function resetAll() {
    setStep(1);
    setServico(null);
    setDateISO("");
    setTimeHHmm("");
    setObservacao("");
    setErro("");
    setSucesso("");
    setDispData(null);
    setDispError("");
  }

  function back() {
    setErro("");
    setSucesso("");
    setStep((s) => Math.max(1, s - 1));
  }

  function next() {
    setErro("");
    setSucesso("");
    setStep((s) => Math.min(5, s + 1));
  }

  async function onSubmit() {
    setErro("");
    setSucesso("");

    if (!clienteId) return setErro("Sem clienteId. Faça login novamente.");
    if (!servico?.id) return setErro("Selecione um serviço.");
    if (!barbeiro?.id) return setErro("Selecione um barbeiro.");
    if (!dateISO) return setErro("Selecione uma data.");
    if (!timeHHmm) return setErro("Selecione um horário.");

    const payload = {
      clienteId: Number(clienteId),
      barbeiroId: Number(barbeiro.id),
      servicoId: Number(servico.id),
      dataHora: combineDateTimeISO(dateISO, timeHHmm),
      observacao: observacao?.trim() ? observacao.trim() : null,
    };

    setSubmitting(true);
    try {
      await api.post("/agendamentos", payload);

      localStorage.setItem("barbeiroIdPadrao", String(barbeiro.id));

      setSucesso("Agendamento criado! Indo para Meus Agendamentos...");
      setTimeout(() => navigate("/agendamentos"), 900);
    } catch (e) {
      setErro(extrairMensagemErro(e));
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingInit) {
    return <div style={{ padding: 20, opacity: 0.8 }}>Carregando...</div>;
  }

  if (errorInit) {
    return (
      <div style={{ padding: 20 }}>
        <div style={styles.alertError}>
          <b>Erro:</b> {errorInit}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageWrap}>
      <WizardHeader step={step} onBack={back} onReset={resetAll} />

      <div style={styles.panel}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {resumoBadges.length ? (
            resumoBadges.map((b, i) => (
              <span key={i} style={styles.badge}>
                {b}
              </span>
            ))
          ) : (
            <span style={{ ...styles.badge, opacity: 0.65 }}>
              Monte seu agendamento escolhendo as opções
            </span>
          )}

          <span style={{ ...styles.badge, opacity: 0.9 }}>
            Cliente ID: <b>{clienteId ?? "-"}</b>
          </span>

          {dispLoading && step >= 4 ? (
            <span style={{ ...styles.badge, opacity: 0.85 }}>Carregando disponibilidade...</span>
          ) : null}
        </div>

        {dispError ? (
          <div style={{ marginTop: 10, ...styles.alertError }}>
            <b>Erro:</b> {dispError}
          </div>
        ) : null}

        <div style={styles.hr} />

        {step === 1 && (
          <div>
            <h2 style={styles.h2}>1) Escolha o serviço</h2>
            <p style={styles.p}>Clique em um serviço para continuar.</p>

            {servicosAtivos.length === 0 ? (
              <div style={styles.alertError}>Nenhum serviço disponível no momento.</div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {servicosAtivos.map((s) => (
                  <CardSelect
                    key={s.id}
                    title={s.nome}
                    subtitle={`Duração: ${DURACAO_MIN} min`}
                    right={s.preco != null ? formatBRL(s.preco) : ""}
                    selected={servico?.id === s.id}
                    onClick={() => {
                      setServico(s);
                      next();
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={styles.h2}>2) Escolha o barbeiro</h2>
            <p style={styles.p}>Depois você escolhe a data e o horário.</p>

            {barbeiros.length === 0 ? (
              <div style={styles.alertError}>
                Nenhum barbeiro encontrado. Cadastre no backend primeiro.
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {barbeiros.map((b) => (
                  <CardSelect
                    key={b.id}
                    title={b.nome}
                    subtitle={`Trabalha: ${b.horaEntrada || "09:00"} - ${b.horaSaida || "18:30"}`}
                    selected={barbeiro?.id === b.id}
                    onClick={() => {
                      setBarbeiro(b);
                      next();
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={styles.h2}>3) Escolha a data</h2>
            <p style={styles.p}>Mostrando os próximos 14 dias.</p>

            <DayPicker
              selectedDate={dateISO}
              onSelectDate={(iso) => {
                setDateISO(iso);
                next();
              }}
            />
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 style={styles.h2}>4) Escolha o horário</h2>
            <p style={styles.p}>
              Horários ocupados ficam desabilitados automaticamente.
            </p>

            <div style={styles.legendRow}>
              <span style={{ ...styles.legend, ...styles.legendOk }}>Disponível</span>
              <span style={{ ...styles.legend, ...styles.legendBad }}>Indisponível</span>
            </div>

            {dispLoading ? (
              <div style={{ opacity: 0.75 }}>Carregando horários...</div>
            ) : (
              <TimeGrid
                slots={slots}
                availabilityMap={availabilityMap}
                selectedTime={timeHHmm}
                onPick={(t) => {
                  setTimeHHmm(t);
                  next();
                }}
              />
            )}
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 style={styles.h2}>5) Confirmar</h2>
            <p style={styles.p}>Confira os dados antes de finalizar.</p>

            <div style={styles.resumeBox}>
              <div><b>Serviço:</b> {servico?.nome || "-"}</div>
              <div><b>Barbeiro:</b> {barbeiro?.nome || "-"}</div>
              <div><b>Data:</b> {dateISO ? formatBRDate(dateISO) : "-"}</div>
              <div><b>Hora:</b> {timeHHmm || "-"}</div>
              <div style={{ opacity: 0.7, fontSize: 13 }}>Duração: {DURACAO_MIN} min</div>
            </div>

            <label style={{ display: "grid", gap: 8 }}>
              <span style={{ fontSize: 13, opacity: 0.85 }}>Observação (opcional)</span>
              <textarea
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                rows={3}
                style={styles.textarea}
                placeholder="Ex: quero degradê baixo, sem tirar muito em cima..."
              />
            </label>

            {erro ? (
              <div style={{ ...styles.alertError, marginTop: 12 }}>
                <b>Erro:</b> {erro}
              </div>
            ) : null}

            {sucesso ? (
              <div style={{ ...styles.alertSuccess, marginTop: 12 }}>{sucesso}</div>
            ) : null}

            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button
                type="button"
                onClick={onSubmit}
                disabled={submitting}
                style={{ ...styles.btnPrimary, ...(submitting ? styles.btnDisabled : null) }}
              >
                {submitting ? "Confirmando..." : "Confirmar agendamento"}
              </button>
            </div>
          </div>
        )}

        <div style={styles.footerNav}>
          <button type="button" onClick={() => navigate("/agendamentos")} style={styles.btnGhost}>
            Voltar para meus agendamentos
          </button>

          <button
            type="button"
            onClick={back}
            disabled={step === 1}
            style={{ ...styles.btn, ...(step === 1 ? styles.btnDisabled : null) }}
          >
            Voltar
          </button>

          <button
            type="button"
            onClick={next}
            disabled={
              (step === 1 && !servico) ||
              (step === 2 && !barbeiro) ||
              (step === 3 && !dateISO) ||
              (step === 4 && !timeHHmm) ||
              step === 5
            }
            style={{
              ...styles.btn,
              ...styles.btnPrimary,
              ...(
                (step === 1 && !servico) ||
                (step === 2 && !barbeiro) ||
                (step === 3 && !dateISO) ||
                (step === 4 && !timeHHmm) ||
                step === 5
                  ? styles.btnDisabled
                  : null
              ),
            }}
          >
            Avançar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===================== Styles ===================== */

const styles = {
  pageWrap: { padding: 18, color: "#fff" },

  wizHeader: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    padding: 18,
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
    background: "rgba(255,255,255,0.03)",
  },
  wizTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  wizTitle: { margin: 0, fontSize: 20, letterSpacing: 0.2 },
  wizSubtitle: { margin: "6px 0 0 0", opacity: 0.75, fontSize: 13 },

  wizSteps: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 },
  wizStep: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    padding: "10px 10px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.08)",
    opacity: 0.65,
  },
  wizStepActive: { opacity: 1, borderColor: "rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.04)" },
  wizStepDone: { opacity: 0.9 },
  wizDot: {
    width: 26,
    height: 26,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    border: "1px solid rgba(255,255,255,0.14)",
    fontSize: 12,
  },
  wizLabel: { fontSize: 12, opacity: 0.9, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },

  panel: {
    marginTop: 14,
    padding: 18,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
  },

  badge: {
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.03)",
    opacity: 0.9,
  },

  hr: { height: 1, background: "rgba(255,255,255,0.08)", margin: "14px 0" },
  h2: { margin: "0 0 10px 0" },
  p: { margin: "0 0 16px 0", opacity: 0.75 },

  cardSelect: {
    width: "100%",
    textAlign: "left",
    display: "flex",
    gap: 12,
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.02)",
    color: "inherit",
    cursor: "pointer",
  },
  cardSelectSelected: { borderColor: "rgba(255,255,255,0.28)", background: "rgba(255,255,255,0.06)" },
  cardTitle: { fontSize: 14, fontWeight: 800 },
  cardSubtitle: { marginTop: 4, fontSize: 12, opacity: 0.7 },
  cardRight: { fontSize: 13, opacity: 0.9, whiteSpace: "nowrap" },

  dayGrid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 },
  dayBtn: {
    borderRadius: 14,
    padding: "12px 10px",
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.02)",
    color: "inherit",
    cursor: "pointer",
    textAlign: "left",
  },
  dayBtnSelected: { borderColor: "rgba(255,255,255,0.28)", background: "rgba(255,255,255,0.06)" },
  dayDow: { fontSize: 12, opacity: 0.75 },
  dayDate: { marginTop: 4, fontSize: 13, fontWeight: 900 },

  legendRow: { display: "flex", gap: 10, alignItems: "center", marginBottom: 10 },
  legend: {
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.02)",
  },
  legendOk: { opacity: 0.9 },
  legendBad: { opacity: 0.55 },

  timeGrid: { display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 },
  timeBtn: {
    borderRadius: 12,
    padding: "10px 10px",
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.02)",
    color: "inherit",
    cursor: "pointer",
  },
  timeBtnSelected: { borderColor: "rgba(255,255,255,0.28)", background: "rgba(255,255,255,0.06)" },
  timeBtnDisabled: { opacity: 0.35, cursor: "not-allowed" },

  resumeBox: {
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 14,
    padding: 14,
    background: "rgba(255,255,255,0.02)",
    display: "grid",
    gap: 8,
    marginBottom: 14,
  },

  textarea: {
    width: "100%",
    borderRadius: 12,
    padding: 12,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.02)",
    color: "inherit",
    outline: "none",
    resize: "vertical",
  },

  alertError: {
    background: "rgba(255,80,80,0.10)",
    border: "1px solid rgba(255,80,80,0.35)",
    padding: 12,
    borderRadius: 12,
  },
  alertSuccess: {
    background: "rgba(80,255,160,0.10)",
    border: "1px solid rgba(80,255,160,0.25)",
    padding: 12,
    borderRadius: 12,
  },

  footerNav: { display: "flex", justifyContent: "space-between", gap: 12, marginTop: 14, flexWrap: "wrap" },

  btn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "inherit",
    cursor: "pointer",
    fontWeight: 900,
  },
  btnPrimary: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.10)",
    color: "inherit",
    cursor: "pointer",
    fontWeight: 900,
  },
  btnGhost: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "transparent",
    color: "inherit",
    cursor: "pointer",
    fontWeight: 900,
  },
  btnDisabled: { opacity: 0.5, cursor: "not-allowed" },
};