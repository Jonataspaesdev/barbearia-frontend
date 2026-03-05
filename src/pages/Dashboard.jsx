// src/pages/Dashboard.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

/* =========================
   Helpers (usuário / front)
========================= */
function getUserInfo() {
  return {
    nome: localStorage.getItem("nome") || "Usuário",
    email: localStorage.getItem("email") || "",
    role: (localStorage.getItem("role") || "").toUpperCase(),
    clienteId: localStorage.getItem("clienteId") || "",
  };
}

function isAdmin(role) {
  return (role || "").includes("ADMIN");
}

function formatRole(role) {
  if (!role) return "-";
  return role.replace("ROLE_", "");
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function toISODate(d) {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = pad2(dt.getMonth() + 1);
  const day = pad2(dt.getDate());
  return `${y}-${m}-${day}`;
}

function startOfWeekISO(date = new Date()) {
  // semana começando na SEGUNDA (padrão BR)
  const d = new Date(date);
  const day = d.getDay(); // 0 dom ... 6 sab
  const diff = day === 0 ? -6 : 1 - day; // volta pra segunda
  d.setDate(d.getDate() + diff);
  return toISODate(d);
}

function endOfWeekISO(date = new Date()) {
  const start = new Date(`${startOfWeekISO(date)}T00:00:00`);
  start.setDate(start.getDate() + 6);
  return toISODate(start);
}

function startOfMonthISO(date = new Date()) {
  const d = new Date(date);
  d.setDate(1);
  return toISODate(d);
}

function endOfMonthISO(date = new Date()) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  return toISODate(d);
}

function formatCurrency(v) {
  const n = Number(v || 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function safeErrMsg(e) {
  const data = e?.response?.data;
  if (!data) return e?.message || "Erro inesperado.";
  if (typeof data === "string") return data;
  if (data?.mensagem) return data.mensagem;
  if (data?.message) return data.message;
  if (data?.erro) return data.erro;
  try {
    return JSON.stringify(data);
  } catch {
    return "Erro inesperado.";
  }
}

function dtToBR(dt) {
  if (!dt) return "-";
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function dtToOnlyHour(dt) {
  if (!dt) return "-";
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function isSameISODateFromDateTime(dateISO, dt) {
  if (!dateISO || !dt) return false;
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return false;
  const iso = toISODate(d);
  return iso === dateISO;
}

function clampStatus(s) {
  return String(s || "").toUpperCase();
}

function isSunday(isoDate) {
  const d = new Date(`${isoDate}T00:00:00`);
  return d.getDay() === 0;
}

/* =========================
   Modal simples (sem libs)
========================= */
function Modal({ open, title, onClose, children, footer }) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 14,
        zIndex: 9999,
      }}
    >
      <div className="card" style={{ width: "min(720px, 100%)", padding: 16 }}>
        <div className="spread" style={{ gap: 12 }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button className="btn" onClick={onClose}>
            Fechar
          </button>
        </div>

        <div style={{ marginTop: 12 }}>{children}</div>

        {footer ? <div style={{ marginTop: 14 }}>{footer}</div> : null}
      </div>
    </div>
  );
}

/* =========================
   COMPONENTE PRINCIPAL
========================= */
export default function Dashboard() {
  const navigate = useNavigate();
  const user = getUserInfo();
  const isAdminUser = isAdmin(user.role);

  /* ==========================================================
     ✅ CLIENTE (mantém simples como você já tinha)
  ========================================================== */
  if (!isAdminUser) {
    return (
      <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
        <div className="spread" style={{ marginBottom: 14 }}>
          <div>
            <h1 style={{ margin: 0 }}>👋 Olá, {user.nome}</h1>
            <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 13 }}>
              Acesse seus agendamentos ou marque um novo horário.
            </div>
          </div>

          <div className="badge" title={user.role || ""}>
            <span style={{ opacity: 0.9, fontWeight: 800 }}>{formatRole(user.role)}</span>
            {user.clienteId ? <span>• ID {user.clienteId}</span> : null}
          </div>
        </div>

        <div className="row" style={{ gap: 12, flexWrap: "wrap" }}>
          <div className="card" style={{ minWidth: 280, flex: "1 1 320px" }}>
            <h3 style={{ marginTop: 0 }}>⚡ Atalhos</h3>

            <div className="stack" style={{ marginTop: 10 }}>
              <button
                className="btn"
                onClick={() => navigate("/agendamentos")}
                style={{ width: "100%", textAlign: "left" }}
              >
                <b>📅 Meus agendamentos</b>
                <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>
                  Ver status, datas e horários
                </div>
              </button>

              <button
                className="btn primary"
                onClick={() => navigate("/agendamentos/novo")}
                style={{ width: "100%", textAlign: "left" }}
              >
                <b>➕ Marcar horário</b>
                <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
                  Escolha serviço, barbeiro, dia e horário
                </div>
              </button>
            </div>
          </div>

          <div className="card" style={{ minWidth: 280, flex: "2 1 520px" }}>
            <h3 style={{ marginTop: 0 }}>💡 Dica rápida</h3>
            <div style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.5 }}>
              Dica: horários de sábado lotam rápido. Se puder, marque com antecedência 🙂
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================
     ✅ ADMIN DASHBOARD (operacional, simples e correto)
  ========================================================== */

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const [barbeiros, setBarbeiros] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);

  // filtros de período (pra indicadores)
  const [periodo, setPeriodo] = useState("HOJE"); // HOJE | SEMANA | MES | CUSTOM
  const [dataInicio, setDataInicio] = useState(toISODate(new Date()));
  const [dataFim, setDataFim] = useState(toISODate(new Date()));

  // agenda do dia (tela operacional)
  const [diaAgenda, setDiaAgenda] = useState(toISODate(new Date()));

  // filtro por barbeiro (opcional)
  const [barbeiroId, setBarbeiroId] = useState("TODOS");

  // modal remarcar
  const [modalOpen, setModalOpen] = useState(false);
  const [alvoRemarcar, setAlvoRemarcar] = useState(null);
  const [novaData, setNovaData] = useState(toISODate(new Date()));
  const [novoHorario, setNovoHorario] = useState("");
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [modalErro, setModalErro] = useState("");

  // atualiza intervalo quando troca período
  useEffect(() => {
    const now = new Date();
    if (periodo === "HOJE") {
      const iso = toISODate(now);
      setDataInicio(iso);
      setDataFim(iso);
    } else if (periodo === "SEMANA") {
      setDataInicio(startOfWeekISO(now));
      setDataFim(endOfWeekISO(now));
    } else if (periodo === "MES") {
      setDataInicio(startOfMonthISO(now));
      setDataFim(endOfMonthISO(now));
    }
  }, [periodo]);

  async function carregarTudo() {
    try {
      setErro("");
      setLoading(true);

      const [bRes, aRes] = await Promise.all([api.get("/barbeiros"), api.get("/agendamentos")]);

      setBarbeiros(Array.isArray(bRes.data) ? bRes.data : []);
      setAgendamentos(Array.isArray(aRes.data) ? aRes.data : []);
    } catch (e) {
      setErro(safeErrMsg(e) || "Erro ao carregar dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarTudo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =========================
     Dados filtrados por período
  ========================= */
  const agPeriod = useMemo(() => {
    const ini = new Date(`${dataInicio}T00:00:00`).getTime();
    const fim = new Date(`${dataFim}T23:59:59`).getTime();

    return agendamentos.filter((a) => {
      const t = new Date(a?.dataHora || 0).getTime();
      if (Number.isNaN(t)) return false;
      if (t < ini || t > fim) return false;

      if (barbeiroId !== "TODOS") {
        return String(a?.barbeiroId) === String(barbeiroId);
      }
      return true;
    });
  }, [agendamentos, dataInicio, dataFim, barbeiroId]);

  const contadores = useMemo(() => {
    let agendados = 0;
    let concluidos = 0;
    let cancelados = 0;

    for (const a of agPeriod) {
      const st = clampStatus(a?.status);
      if (st === "CONCLUIDO") concluidos++;
      else if (st === "CANCELADO") cancelados++;
      else agendados++; // AGENDADO ou qualquer outro vira "pendente"
    }
    return { agendados, concluidos, cancelados, total: agPeriod.length };
  }, [agPeriod]);

  const faturamentoConcluidos = useMemo(() => {
    // ✅ Aqui é onde corrige seu problema:
    // faturamento só soma CONCLUÍDOS, então CANCELADO nunca entra.
    return agPeriod.reduce((acc, a) => {
      const st = clampStatus(a?.status);
      if (st !== "CONCLUIDO") return acc;
      return acc + (Number(a?.preco || 0) || 0);
    }, 0);
  }, [agPeriod]);

  const ticketMedio = useMemo(() => {
    if (!contadores.concluidos) return 0;
    return faturamentoConcluidos / contadores.concluidos;
  }, [faturamentoConcluidos, contadores.concluidos]);

  /* =========================
     Agenda do dia (operacional)
  ========================= */
  const agendaDoDia = useMemo(() => {
    const list = agendamentos
      .filter((a) => {
        if (!isSameISODateFromDateTime(diaAgenda, a?.dataHora)) return false;
        if (barbeiroId !== "TODOS" && String(a?.barbeiroId) !== String(barbeiroId)) return false;
        return true;
      })
      .sort((x, y) => new Date(x?.dataHora || 0).getTime() - new Date(y?.dataHora || 0).getTime());

    return list;
  }, [agendamentos, diaAgenda, barbeiroId]);

  /* =========================
     Ranking por barbeiro (só CONCLUÍDOS no período)
  ========================= */
  const rankingBarbeiros = useMemo(() => {
    const map = new Map(); // barbeiroId => { barbeiroId, nome, total, qtd }
    for (const a of agPeriod) {
      const st = clampStatus(a?.status);
      if (st !== "CONCLUIDO") continue;

      const id = String(a?.barbeiroId ?? "");
      if (!id) continue;
      const nome = a?.barbeiroNome || `Barbeiro #${id}`;
      const preco = Number(a?.preco || 0) || 0;

      const cur = map.get(id) || { barbeiroId: id, nome, total: 0, qtd: 0 };
      cur.total += preco;
      cur.qtd += 1;
      map.set(id, cur);
    }
    const arr = Array.from(map.values());
    arr.sort((x, y) => y.total - x.total);
    return arr;
  }, [agPeriod]);

  /* =========================
     Ações (Compareceu / Cancelar / Remarcar)
  ========================= */
  async function marcarCompareceu(ag) {
    if (!ag?.id) return;
    try {
      setLoading(true);
      setErro("");
      // Backend: PUT /agendamentos/{id} atualiza status
      await api.put(`/agendamentos/${ag.id}`, { status: "CONCLUIDO" });
      await carregarTudo();
    } catch (e) {
      setErro(safeErrMsg(e));
    } finally {
      setLoading(false);
    }
  }

  async function cancelarAgendamento(ag) {
    if (!ag?.id) return;
    const ok = window.confirm("Cancelar este agendamento?");
    if (!ok) return;

    try {
      setLoading(true);
      setErro("");
      await api.delete(`/agendamentos/${ag.id}/cancelar`);
      await carregarTudo();
    } catch (e) {
      setErro(safeErrMsg(e));
    } finally {
      setLoading(false);
    }
  }

  function abrirRemarcar(ag) {
    setModalErro("");
    setAlvoRemarcar(ag || null);

    // sugere data atual do agendamento
    const iso = ag?.dataHora ? toISODate(new Date(ag.dataHora)) : toISODate(new Date());
    setNovaData(iso);
    setNovoHorario("");
    setSlots([]);

    setModalOpen(true);
  }

  async function carregarSlotsDisponiveis(barbeiroIdParam, dataISO) {
    if (!barbeiroIdParam || !dataISO) return;
    if (isSunday(dataISO)) {
      setSlots([]);
      return;
    }

    try {
      setSlotsLoading(true);
      setModalErro("");

      const res = await api.get("/agendamentos/disponibilidade", {
        params: { barbeiroId: barbeiroIdParam, data: dataISO },
      });

      const info = res.data;
      const duracaoMin = Number(info?.duracaoMin || 30) || 30;
      const horaEntrada = String(info?.horaEntrada || "09:00");
      const horaSaida = String(info?.horaSaida || "18:00");
      const ocupados = new Set((info?.ocupados || []).map(String));

      // gerar slots do dia
      const [eh, em] = horaEntrada.split(":").map((x) => Number(x));
      const [sh, sm] = horaSaida.split(":").map((x) => Number(x));

      const start = new Date(`${dataISO}T00:00:00`);
      start.setHours(eh, em, 0, 0);

      const end = new Date(`${dataISO}T00:00:00`);
      end.setHours(sh, sm, 0, 0);

      const now = new Date();
      const isHoje = toISODate(now) === dataISO;

      const gen = [];
      for (let t = new Date(start); t <= end; t = new Date(t.getTime() + duracaoMin * 60_000)) {
        const hh = pad2(t.getHours());
        const mm = pad2(t.getMinutes());
        const label = `${hh}:${mm}`;

        // bloqueia ocupados
        if (ocupados.has(label)) continue;

        // bloqueia passado se for hoje
        if (isHoje) {
          if (t.getTime() <= now.getTime()) continue;
        }

        gen.push(label);
      }

      setSlots(gen);
    } catch (e) {
      setModalErro(safeErrMsg(e));
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }

  // quando abrir modal ou mudar data, carrega slots
  useEffect(() => {
    if (!modalOpen) return;
    const bId = alvoRemarcar?.barbeiroId;
    if (!bId) return;
    carregarSlotsDisponiveis(bId, novaData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen, alvoRemarcar?.barbeiroId, novaData]);

  async function confirmarRemarcacao() {
    if (!alvoRemarcar?.id) return;
    if (!alvoRemarcar?.barbeiroId) {
      setModalErro("Agendamento sem barbeiroId.");
      return;
    }
    if (!novaData) {
      setModalErro("Selecione a data.");
      return;
    }
    if (isSunday(novaData)) {
      setModalErro("Domingo está bloqueado (barbearia fechada).");
      return;
    }
    if (!novoHorario) {
      setModalErro("Selecione um horário.");
      return;
    }

    try {
      setLoading(true);
      setModalErro("");

      // monta datetime ISO local
      const novaDataHora = `${novaData}T${novoHorario}:00`;

      // Backend: PUT /agendamentos/{id} (atualiza dataHora)
      // Se seu backend exigir outro campo (ex: dataHoraInicio), me diga que eu ajusto em 1 linha.
      await api.put(`/agendamentos/${alvoRemarcar.id}`, { dataHora: novaDataHora });

      setModalOpen(false);
      setAlvoRemarcar(null);
      await carregarTudo();
    } catch (e) {
      setModalErro(safeErrMsg(e));
    } finally {
      setLoading(false);
    }
  }

  function Pill({ label, value, hint }) {
    return (
      <div className="card" style={{ padding: 18 }}>
        <div style={{ fontSize: 12, color: "var(--muted)" }}>{label}</div>
        <div style={{ fontSize: 26, fontWeight: 900, marginTop: 6 }}>{value}</div>
        {hint ? <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>{hint}</div> : null}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 18px" }}>
      <div className="spread" style={{ gap: 12, marginBottom: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>📊 Dashboard (Admin)</h1>
          <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 13 }}>
            Operacional (agenda do dia) • Indicadores por período • Ações rápidas
          </div>
        </div>

        <div className="row" style={{ justifyContent: "flex-end", gap: 10 }}>
          <button className="btn" onClick={carregarTudo} disabled={loading}>
            {loading ? "Atualizando..." : "Atualizar"}
          </button>
          <button className="btn" onClick={() => navigate("/agendamentos-admin")}>
            Ver página de agendamentos
          </button>
        </div>
      </div>

      {erro ? <div className="alert error">{erro}</div> : null}

      {/* Filtros */}
      <div className="card" style={{ marginTop: 12 }}>
        <div className="row" style={{ gap: 10, flexWrap: "wrap", alignItems: "end" }}>
          <div style={{ minWidth: 170 }}>
            <label style={{ fontSize: 12, color: "var(--muted)" }}>Período (indicadores)</label>
            <select className="input" value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
              <option value="HOJE">Hoje</option>
              <option value="SEMANA">Semana</option>
              <option value="MES">Mês</option>
              <option value="CUSTOM">Personalizado</option>
            </select>
          </div>

          <div style={{ minWidth: 180 }}>
            <label style={{ fontSize: 12, color: "var(--muted)" }}>Data início</label>
            <input
              className="input"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              disabled={periodo !== "CUSTOM"}
            />
          </div>

          <div style={{ minWidth: 180 }}>
            <label style={{ fontSize: 12, color: "var(--muted)" }}>Data fim</label>
            <input
              className="input"
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              disabled={periodo !== "CUSTOM"}
            />
          </div>

          <div style={{ minWidth: 260, flex: "1 1 260px" }}>
            <label style={{ fontSize: 12, color: "var(--muted)" }}>Barbeiro</label>
            <select className="input" value={barbeiroId} onChange={(e) => setBarbeiroId(e.target.value)}>
              <option value="TODOS">Todos</option>
              {barbeiros.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nome}
                </option>
              ))}
            </select>
          </div>

          <div style={{ minWidth: 260 }}>
            <div className="badge" style={{ height: 40, display: "flex", alignItems: "center" }}>
              Indicadores: <b style={{ marginLeft: 6 }}>{dataInicio}</b> até <b style={{ marginLeft: 6 }}>{dataFim}</b>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 10, color: "var(--muted)", fontSize: 12 }}>
          ✅ Faturamento aqui é <b>SÓ dos CONCLUÍDOS</b>. Cancelados nunca entram.
        </div>
      </div>

      {/* Indicadores principais */}
      <div
        style={{
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 12,
        }}
      >
        <Pill
          label="💰 Faturamento (CONCLUÍDOS)"
          value={formatCurrency(faturamentoConcluidos)}
          hint={`ticket médio ${formatCurrency(ticketMedio)} • ${contadores.concluidos} concluído(s)`}
        />
        <Pill label="📌 Agendados (pendentes)" value={String(contadores.agendados)} hint="AGENDADO (ou pendente)" />
        <Pill label="✅ Concluídos" value={String(contadores.concluidos)} hint="Compareceu / Concluído" />
        <Pill label="❌ Cancelados" value={String(contadores.cancelados)} hint="Fora do faturamento" />
      </div>

      {/* Agenda do dia (o que importa no operacional) */}
      <div className="card" style={{ marginTop: 12 }}>
        <div className="spread" style={{ gap: 12 }}>
          <div>
            <h3 style={{ margin: 0 }}>📅 Agenda do dia</h3>
            <div style={{ marginTop: 4, color: "var(--muted)", fontSize: 13 }}>
              Ações rápidas: Compareceu / Cancelar / Remarcar
            </div>
          </div>

          <div className="row" style={{ gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--muted)" }}>Dia</label>
              <input className="input" type="date" value={diaAgenda} onChange={(e) => setDiaAgenda(e.target.value)} />
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ marginTop: 12, color: "var(--muted)" }}>Carregando...</div>
        ) : agendaDoDia.length === 0 ? (
          <div style={{ marginTop: 12, color: "var(--muted)" }}>Nenhum agendamento para este dia.</div>
        ) : (
          <div style={{ marginTop: 10, overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ whiteSpace: "nowrap" }}>Horário</th>
                  <th>Cliente</th>
                  <th>Serviço</th>
                  <th>Barbeiro</th>
                  <th style={{ whiteSpace: "nowrap" }}>Status</th>
                  <th style={{ whiteSpace: "nowrap" }}>Valor</th>
                  <th style={{ whiteSpace: "nowrap" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {agendaDoDia.map((a) => {
                  const st = clampStatus(a?.status);
                  const isConcluido = st === "CONCLUIDO";
                  const isCancelado = st === "CANCELADO";

                  return (
                    <tr key={a.id}>
                      <td style={{ whiteSpace: "nowrap" }}>{dtToOnlyHour(a?.dataHora)}</td>
                      <td>{a?.clienteNome || a?.cliente?.nome || `Cliente #${a?.clienteId ?? "-"}`}</td>
                      <td>{a?.servicoNome || a?.servico?.nome || `Serviço #${a?.servicoId ?? "-"}`}</td>
                      <td>{a?.barbeiroNome || a?.barbeiro?.nome || `Barbeiro #${a?.barbeiroId ?? "-"}`}</td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <span className="badge">{st || "-"}</span>
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>{formatCurrency(a?.preco || 0)}</td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                          <button
                            className="btn primary"
                            disabled={loading || isConcluido || isCancelado}
                            onClick={() => marcarCompareceu(a)}
                            title="Marca como CONCLUÍDO"
                          >
                            ✅ Compareceu
                          </button>

                          <button
                            className="btn"
                            disabled={loading || isCancelado || isConcluido}
                            onClick={() => abrirRemarcar(a)}
                            title="Escolher nova data/horário"
                          >
                            🔁 Remarcar
                          </button>

                          <button
                            className="btn"
                            disabled={loading || isCancelado || isConcluido}
                            onClick={() => cancelarAgendamento(a)}
                            title="Cancelar agendamento"
                          >
                            ❌ Cancelar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div style={{ marginTop: 10, fontSize: 12, color: "var(--muted)" }}>
              Dica: se quiser “remarcar” já comunicando no WhatsApp, dá pra fazer depois (sem mexer no layout agora).
            </div>
          </div>
        )}
      </div>

      {/* Ranking */}
      <div className="card" style={{ marginTop: 12 }}>
        <div className="spread" style={{ gap: 12 }}>
          <h3 style={{ margin: 0 }}>🏆 Ranking de barbeiros (período)</h3>
          <div style={{ color: "var(--muted)", fontSize: 13 }}>Somente CONCLUÍDOS</div>
        </div>

        {loading ? (
          <div style={{ marginTop: 12, color: "var(--muted)" }}>Carregando...</div>
        ) : rankingBarbeiros.length === 0 ? (
          <div style={{ marginTop: 12, color: "var(--muted)" }}>Nenhum atendimento CONCLUÍDO no período.</div>
        ) : (
          <div style={{ marginTop: 10, overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ whiteSpace: "nowrap" }}>#</th>
                  <th>Barbeiro</th>
                  <th style={{ whiteSpace: "nowrap" }}>Concluídos</th>
                  <th style={{ whiteSpace: "nowrap" }}>Faturamento</th>
                  <th style={{ whiteSpace: "nowrap" }}>Ticket médio</th>
                </tr>
              </thead>
              <tbody>
                {rankingBarbeiros.map((x, idx) => (
                  <tr key={x.barbeiroId}>
                    <td style={{ whiteSpace: "nowrap" }}>{idx + 1}</td>
                    <td>{x.nome}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{x.qtd}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{formatCurrency(x.total)}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{formatCurrency(x.qtd ? x.total / x.qtd : 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Remarcar */}
      <Modal
        open={modalOpen}
        title="🔁 Remarcar agendamento"
        onClose={() => {
          setModalOpen(false);
          setAlvoRemarcar(null);
          setModalErro("");
        }}
        footer={
          <div className="row" style={{ gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
            <button
              className="btn"
              onClick={() => {
                setModalOpen(false);
                setAlvoRemarcar(null);
                setModalErro("");
              }}
            >
              Cancelar
            </button>
            <button className="btn primary" onClick={confirmarRemarcacao} disabled={loading}>
              Confirmar remarcação
            </button>
          </div>
        }
      >
        {modalErro ? <div className="alert error">{modalErro}</div> : null}

        <div className="card" style={{ padding: 14 }}>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Agendamento atual</div>
          <div style={{ marginTop: 6, fontWeight: 800 }}>
            {alvoRemarcar?.clienteNome || `Cliente #${alvoRemarcar?.clienteId ?? "-"}`} •{" "}
            {alvoRemarcar?.servicoNome || `Serviço #${alvoRemarcar?.servicoId ?? "-"}`}
          </div>
          <div style={{ marginTop: 4, fontSize: 13, color: "var(--muted)" }}>
            Barbeiro: <b>{alvoRemarcar?.barbeiroNome || `#${alvoRemarcar?.barbeiroId ?? "-"}`}</b> • Data/Hora:{" "}
            <b>{dtToBR(alvoRemarcar?.dataHora)}</b>
          </div>
        </div>

        <div className="row" style={{ gap: 10, flexWrap: "wrap", alignItems: "end", marginTop: 12 }}>
          <div style={{ minWidth: 220 }}>
            <label style={{ fontSize: 12, color: "var(--muted)" }}>Nova data</label>
            <input
              className="input"
              type="date"
              value={novaData}
              onChange={(e) => setNovaData(e.target.value)}
            />
            {isSunday(novaData) ? (
              <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted)" }}>
                Domingo bloqueado (barbearia fechada).
              </div>
            ) : null}
          </div>

          <div style={{ minWidth: 260, flex: "1 1 260px" }}>
            <label style={{ fontSize: 12, color: "var(--muted)" }}>Horário disponível</label>
            <select
              className="input"
              value={novoHorario}
              onChange={(e) => setNovoHorario(e.target.value)}
              disabled={slotsLoading || isSunday(novaData)}
            >
              <option value="">{slotsLoading ? "Carregando horários..." : "Selecione"}</option>
              {slots.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
            <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted)" }}>
              Usa /agendamentos/disponibilidade e já bloqueia horários ocupados e passados.
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}