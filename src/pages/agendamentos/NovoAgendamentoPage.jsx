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
    if (typeof data.mensagem === "string") {
      return `(${status}) ${data.mensagem}`;
    }
    if (typeof data === "string") return `(${status}) ${data}`;
  }

  if (status) return `(${status}) Erro ao criar agendamento.`;
  return "Erro ao criar agendamento.";
}

/* ===================== Page ===================== */

export default function NovoAgendamentoPage() {
  const navigate = useNavigate();
  const clienteId = getClienteId();

  const [step, setStep] = useState(1);

  const [servicos, setServicos] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);

  const [servico, setServico] = useState(null);
  const [barbeiro, setBarbeiro] = useState(null);
  const [dateISO, setDateISO] = useState("");
  const [timeHHmm, setTimeHHmm] = useState("");
  const [observacao, setObservacao] = useState("");

  const [dispData, setDispData] = useState(null);
  const [dispLoading, setDispLoading] = useState(false);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* ===== Load inicial ===== */
  useEffect(() => {
    async function load() {
      try {
        const respS = await api.get("/servicos");
        setServicos(Array.isArray(respS.data) ? respS.data : []);
      } catch {}

      try {
        const respB = await api.get("/barbeiros");
        setBarbeiros(Array.isArray(respB.data) ? respB.data : []);
      } catch {}
    }
    load();
  }, []);

  /* ===== Disponibilidade ===== */
  useEffect(() => {
    setTimeHHmm("");
    setDispData(null);

    async function fetchDisponibilidade() {
      if (!barbeiro?.id || !dateISO) return;

      setDispLoading(true);
      try {
        const resp = await api.get(
          `/agendamentos/disponibilidade?barbeiroId=${barbeiro.id}&data=${dateISO}`
        );
        setDispData(resp.data || null);
      } catch {
        setDispData(null);
      } finally {
        setDispLoading(false);
      }
    }

    fetchDisponibilidade();
  }, [barbeiro?.id, dateISO]);

  const slots = useMemo(() => {
    const entrada = dispData?.horaEntrada || "09:00";
    const saida = dispData?.horaSaida || "18:30";
    return gerarSlotsTrabalho(String(entrada).slice(0, 5), String(saida).slice(0, 5));
  }, [dispData]);

  const ocupadosSet = useMemo(() => {
    const arr = dispData?.ocupados;
    const set = new Set();
    if (Array.isArray(arr)) {
      for (const h of arr) {
        if (typeof h === "string") set.add(h.slice(0, 5));
      }
    }
    return set;
  }, [dispData]);

  const availabilityMap = useMemo(() => {
    const map = {};
    for (const t of slots) {
      const okFuturo = isSlotNoFuturo(dateISO, t);
      const ocupado = ocupadosSet.has(t);
      map[t] = okFuturo && !ocupado;
    }
    return map;
  }, [slots, ocupadosSet, dateISO]);

  function next() {
    setStep((s) => Math.min(5, s + 1));
  }

  function back() {
    setStep((s) => Math.max(1, s - 1));
  }

  async function onSubmit() {
    setErro("");
    if (!servico || !barbeiro || !dateISO || !timeHHmm) return;

    const payload = {
      clienteId: Number(clienteId),
      barbeiroId: Number(barbeiro.id),
      servicoId: Number(servico.id),
      dataHora: combineDateTimeISO(dateISO, timeHHmm),
      observacao: observacao?.trim() || null,
    };

    setSubmitting(true);
    try {
      await api.post("/agendamentos", payload);
      setSucesso("Agendamento criado com sucesso!");
      setTimeout(() => navigate("/agendamentos"), 800);
    } catch (e) {
      setErro(extrairMensagemErro(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="wizardWrap">
      <div className="wizard">

        {/* ===== STEPS ===== */}
        <div className="wizardSteps">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={`stepPill ${step === i + 1 ? "active" : ""}`}
            >
              {i + 1}. {label}
            </div>
          ))}
        </div>

        {/* ===== STEP 1 ===== */}
        {step === 1 && (
          <>
            <h2>Escolha o serviço</h2>
            <div className="pickGrid">
              {servicos.map((s) => (
                <button
                  key={s.id}
                  className={`pickCard ${servico?.id === s.id ? "selected" : ""}`}
                  onClick={() => {
                    setServico(s);
                    next();
                  }}
                >
                  <div className="pickTitle">{s.nome}</div>
                  <div className="pickSub">
                    {formatBRL(s.preco)} • {DURACAO_MIN} min
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ===== STEP 2 ===== */}
        {step === 2 && (
          <>
            <h2>Escolha o barbeiro</h2>
            <div className="pickGrid">
              {barbeiros.map((b) => (
                <button
                  key={b.id}
                  className={`pickCard ${barbeiro?.id === b.id ? "selected" : ""}`}
                  onClick={() => {
                    setBarbeiro(b);
                    next();
                  }}
                >
                  <div className="pickTitle">{b.nome}</div>
                  <div className="pickSub">
                    {b.horaEntrada || "09:00"} - {b.horaSaida || "18:30"}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ===== STEP 3 ===== */}
        {step === 3 && (
          <>
            <h2>Escolha a data</h2>
            <DayPicker
              selectedDate={dateISO}
              onSelectDate={(iso) => {
                setDateISO(iso);
                next();
              }}
            />
          </>
        )}

        {/* ===== STEP 4 ===== */}
        {step === 4 && (
          <>
            <h2>Escolha o horário</h2>
            {dispLoading ? (
              <div>Carregando horários...</div>
            ) : (
              <div className="slotsWrap">
                <div className="slotsGrid">
                  {slots.map((t) => {
                    const ok = availabilityMap[t];
                    return (
                      <button
                        key={t}
                        disabled={!ok}
                        className={`slotBtn ${
                          timeHHmm === t ? "selected" : ""
                        } ${!ok ? "disabled" : ""}`}
                        onClick={() => {
                          setTimeHHmm(t);
                          next();
                        }}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* ===== STEP 5 ===== */}
        {step === 5 && (
          <>
            <h2>Confirmar agendamento</h2>

            <div className="card">
              <div><b>Serviço:</b> {servico?.nome}</div>
              <div><b>Barbeiro:</b> {barbeiro?.nome}</div>
              <div><b>Data:</b> {formatBRDate(dateISO)}</div>
              <div><b>Hora:</b> {timeHHmm}</div>
            </div>

            <textarea
              className="input"
              placeholder="Observação (opcional)"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              style={{ marginTop: 12 }}
            />

            {erro && <div style={{ marginTop: 10 }}>{erro}</div>}
            {sucesso && <div style={{ marginTop: 10 }}>{sucesso}</div>}

            <button
              className="btn"
              onClick={onSubmit}
              disabled={submitting}
              style={{ marginTop: 14 }}
            >
              {submitting ? "Confirmando..." : "Confirmar"}
            </button>
          </>
        )}

        {/* ===== Navegação ===== */}
        <div className="wizardFooter">
          <button className="btn" onClick={back} disabled={step === 1}>
            Voltar
          </button>

          {step < 5 && (
            <button
              className="btn"
              onClick={next}
              disabled={
                (step === 1 && !servico) ||
                (step === 2 && !barbeiro) ||
                (step === 3 && !dateISO) ||
                (step === 4 && !timeHHmm)
              }
            >
              Avançar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ===== DayPicker isolado ===== */

function DayPicker({ selectedDate, onSelectDate, days = 14 }) {
  const today = new Date();
  const items = Array.from({ length: days }).map((_, i) => {
    const d = addDays(today, i);
    const iso = toISODate(d);
    return { iso, dow: weekdayShortPt(d), br: formatBRDate(iso) };
  });

  return (
    <div className="pickGrid">
      {items.map((it) => (
        <button
          key={it.iso}
          className={`pickCard ${selectedDate === it.iso ? "selected" : ""}`}
          onClick={() => onSelectDate(it.iso)}
        >
          <div className="pickTitle">{it.dow}</div>
          <div className="pickSub">{it.br}</div>
        </button>
      ))}
    </div>
  );
}