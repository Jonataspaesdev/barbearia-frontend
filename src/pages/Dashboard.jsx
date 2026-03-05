// src/pages/Dashboard.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

/* =========================
   Helpers
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
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
}
function startOfWeekISO(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay(); // 0 dom ... 6 sab
  const diff = day === 0 ? -6 : 1 - day; // segunda
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
function clampStatus(s) {
  return String(s || "").toUpperCase();
}
function formatDateTimeBR(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function onlyHourBR(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}
function inRange(dateTime, iniISO, fimISO) {
  const t = new Date(dateTime || 0).getTime();
  if (Number.isNaN(t)) return false;
  const ini = new Date(`${iniISO}T00:00:00`).getTime();
  const fim = new Date(`${fimISO}T23:59:59`).getTime();
  return t >= ini && t <= fim;
}

/* =========================
   Component
========================= */
export default function Dashboard() {
  const navigate = useNavigate();
  const user = getUserInfo();
  const isAdminUser = isAdmin(user.role);

  /* ==========================================================
     CLIENTE (mantém como está)
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
              <button className="btn" onClick={() => navigate("/agendamentos")} style={{ width: "100%", textAlign: "left" }}>
                <b>📅 Meus agendamentos</b>
                <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>Ver status, datas e horários</div>
              </button>

              <button className="btn primary" onClick={() => navigate("/agendamentos/novo")} style={{ width: "100%", textAlign: "left" }}>
                <b>➕ Marcar horário</b>
                <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>Escolha serviço, barbeiro, dia e horário</div>
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
     ADMIN DASHBOARD (apenas visão)
  ========================================================== */

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const [barbeiros, setBarbeiros] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);

  // filtros
  const [periodo, setPeriodo] = useState("DIA"); // DIA | SEMANA | MES | CUSTOM
  const [dataInicio, setDataInicio] = useState(toISODate(new Date()));
  const [dataFim, setDataFim] = useState(toISODate(new Date()));
  const [barbeiroId, setBarbeiroId] = useState("TODOS"); // TODOS = barbearia

  // visão do dia (agenda)
  const [dia, setDia] = useState(toISODate(new Date()));

  useEffect(() => {
    const now = new Date();
    if (periodo === "DIA") {
      const iso = toISODate(now);
      setDataInicio(iso);
      setDataFim(iso);
      setDia(iso);
    } else if (periodo === "SEMANA") {
      setDataInicio(startOfWeekISO(now));
      setDataFim(endOfWeekISO(now));
    } else if (periodo === "MES") {
      setDataInicio(startOfMonthISO(now));
      setDataFim(endOfMonthISO(now));
    }
  }, [periodo]);

  async function carregar() {
    try {
      setErro("");
      setLoading(true);

      const [bRes, aRes] = await Promise.all([
        api.get("/barbeiros"),
        api.get("/agendamentos"),
      ]);

      setBarbeiros(Array.isArray(bRes.data) ? bRes.data : []);
      setAgendamentos(Array.isArray(aRes.data) ? aRes.data : []);
    } catch (e) {
      setErro(safeErrMsg(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  // agendamentos do período (e do barbeiro, se selecionado)
  const agPeriodo = useMemo(() => {
    return agendamentos.filter((a) => {
      if (!inRange(a?.dataHora, dataInicio, dataFim)) return false;
      if (barbeiroId !== "TODOS") {
        return String(a?.barbeiroId ?? "") === String(barbeiroId);
      }
      return true;
    });
  }, [agendamentos, dataInicio, dataFim, barbeiroId]);

  // estatísticas (sem contar cancelado em faturamento)
  const stats = useMemo(() => {
    let ag = 0, con = 0, can = 0;
    let fat = 0;

    for (const a of agPeriodo) {
      const st = clampStatus(a?.status);
      if (st === "CONCLUIDO") {
        con++;
        fat += Number(a?.preco || 0) || 0;
      } else if (st === "CANCELADO") {
        can++;
      } else {
        ag++;
      }
    }

    const ticket = con ? fat / con : 0;
    return { total: agPeriodo.length, ag, con, can, fat, ticket };
  }, [agPeriodo]);

  // ranking barbeiros (somente quando for TODOS)
  const ranking = useMemo(() => {
    if (barbeiroId !== "TODOS") return [];

    const map = new Map();
    for (const a of agPeriodo) {
      const id = String(a?.barbeiroId ?? "");
      if (!id) continue;

      const nome = a?.barbeiroNome || `Barbeiro #${id}`;
      const st = clampStatus(a?.status);
      const preco = Number(a?.preco || 0) || 0;

      const cur = map.get(id) || {
        id,
        nome,
        ag: 0,
        con: 0,
        can: 0,
        fat: 0,
      };

      if (st === "CONCLUIDO") {
        cur.con++;
        cur.fat += preco;
      } else if (st === "CANCELADO") {
        cur.can++;
      } else {
        cur.ag++;
      }

      map.set(id, cur);
    }

    const arr = Array.from(map.values()).map((x) => ({
      ...x,
      ticket: x.con ? x.fat / x.con : 0,
    }));

    arr.sort((a, b) => b.fat - a.fat);
    return arr;
  }, [agPeriodo, barbeiroId]);

  // agenda do dia (apenas leitura)
  const agendaDia = useMemo(() => {
    return agendamentos
      .filter((a) => {
        const aDia = toISODate(a?.dataHora);
        if (aDia !== dia) return false;
        if (barbeiroId !== "TODOS") {
          return String(a?.barbeiroId ?? "") === String(barbeiroId);
        }
        return true;
      })
      .sort(
        (x, y) =>
          new Date(x?.dataHora || 0).getTime() -
          new Date(y?.dataHora || 0).getTime()
      );
  }, [agendamentos, dia, barbeiroId]);

  function Pill({ label, value, hint }) {
    return (
      <div className="card" style={{ padding: 18 }}>
        <div style={{ fontSize: 12, color: "var(--muted)" }}>{label}</div>
        <div style={{ fontSize: 26, fontWeight: 900, marginTop: 6 }}>{value}</div>
        {hint ? <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>{hint}</div> : null}
      </div>
    );
  }

  const nomeFiltro =
    barbeiroId === "TODOS"
      ? "Barbearia (todos)"
      : barbeiros.find((b) => String(b.id) === String(barbeiroId))?.nome || `Barbeiro #${barbeiroId}`;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 18px" }}>
      <div className="spread" style={{ gap: 12, marginBottom: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>📊 Dashboard (Admin)</h1>
          <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 13 }}>
            Movimentações • Diário/Semanal/Mensal • <b>{nomeFiltro}</b>
          </div>
        </div>

        <div className="row" style={{ justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
          <button className="btn" onClick={carregar} disabled={loading}>
            {loading ? "Atualizando..." : "Atualizar"}
          </button>
          <button className="btn" onClick={() => navigate("/agendamentos-admin")}>
            Ir para Agendamentos (operar)
          </button>
        </div>
      </div>

      {erro ? <div className="alert error">{erro}</div> : null}

      {/* Filtros */}
      <div className="card" style={{ marginTop: 12 }}>
        <div className="row" style={{ gap: 10, flexWrap: "wrap", alignItems: "end" }}>
          <div style={{ minWidth: 170 }}>
            <label style={{ fontSize: 12, color: "var(--muted)" }}>Período</label>
            <select className="input" value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
              <option value="DIA">Diário</option>
              <option value="SEMANA">Semanal</option>
              <option value="MES">Mensal</option>
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
            <label style={{ fontSize: 12, color: "var(--muted)" }}>Ver</label>
            <select className="input" value={barbeiroId} onChange={(e) => setBarbeiroId(e.target.value)}>
              <option value="TODOS">Barbearia (todos)</option>
              {barbeiros.map((b) => (
                <option key={b.id} value={b.id}>
                  Somente {b.nome}
                </option>
              ))}
            </select>
          </div>

          <div style={{ minWidth: 260 }}>
            <div className="badge" style={{ height: 40, display: "flex", alignItems: "center" }}>
              Período: <b style={{ marginLeft: 6 }}>{dataInicio}</b> até <b style={{ marginLeft: 6 }}>{dataFim}</b>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 10, color: "var(--muted)", fontSize: 12 }}>
          ✅ Faturamento = soma dos <b>CONCLUÍDOS</b> (cancelados não entram).
        </div>
      </div>

      {/* Cards principais */}
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
          value={formatCurrency(stats.fat)}
          hint={`Ticket médio: ${formatCurrency(stats.ticket)}`}
        />
        <Pill label="📌 Agendados" value={String(stats.ag)} hint="Pendentes / AGENDADO" />
        <Pill label="✅ Concluídos" value={String(stats.con)} />
        <Pill label="❌ Cancelados" value={String(stats.can)} />
      </div>

      {/* Agenda do dia (somente leitura) */}
      <div className="card" style={{ marginTop: 12 }}>
        <div className="spread" style={{ gap: 12 }}>
          <div>
            <h3 style={{ margin: 0 }}>📅 Movimentação do dia</h3>
            <div style={{ marginTop: 4, color: "var(--muted)", fontSize: 13 }}>
              Só visão. Para cancelar/remarcar/compareceu, use “Agendamentos”.
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: "var(--muted)" }}>Dia</label>
            <input className="input" type="date" value={dia} onChange={(e) => setDia(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div style={{ marginTop: 12, color: "var(--muted)" }}>Carregando...</div>
        ) : agendaDia.length === 0 ? (
          <div style={{ marginTop: 12, color: "var(--muted)" }}>Nenhum agendamento nesse dia.</div>
        ) : (
          <div style={{ marginTop: 10, overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ whiteSpace: "nowrap" }}>Hora</th>
                  <th>Cliente</th>
                  <th>Serviço</th>
                  <th>Barbeiro</th>
                  <th>Status</th>
                  <th style={{ whiteSpace: "nowrap" }}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {agendaDia.map((a) => (
                  <tr key={a.id}>
                    <td style={{ whiteSpace: "nowrap" }}>{onlyHourBR(a?.dataHora)}</td>
                    <td>{a?.clienteNome || "-"}</td>
                    <td>{a?.servicoNome || "-"}</td>
                    <td>{a?.barbeiroNome || "-"}</td>
                    <td>
                      <span className="badge">{clampStatus(a?.status) || "-"}</span>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>{formatCurrency(a?.preco || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 10, fontSize: 12, color: "var(--muted)" }}>
              Último horário listado: <b>{formatDateTimeBR(agendaDia[agendaDia.length - 1]?.dataHora)}</b>
            </div>
          </div>
        )}
      </div>

      {/* Ranking barbeiros (apenas quando filtro = Barbearia) */}
      {barbeiroId === "TODOS" ? (
        <div className="card" style={{ marginTop: 12 }}>
          <div className="spread" style={{ gap: 12 }}>
            <h3 style={{ margin: 0 }}>💈 Barbeiros (separado e organizado)</h3>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>
              Ranking por faturamento (somente CONCLUÍDOS)
            </div>
          </div>

          {ranking.length === 0 ? (
            <div style={{ marginTop: 12, color: "var(--muted)" }}>Sem dados no período.</div>
          ) : (
            <div style={{ marginTop: 10, overflowX: "auto" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Barbeiro</th>
                    <th style={{ whiteSpace: "nowrap" }}>Agendados</th>
                    <th style={{ whiteSpace: "nowrap" }}>Concluídos</th>
                    <th style={{ whiteSpace: "nowrap" }}>Cancelados</th>
                    <th style={{ whiteSpace: "nowrap" }}>Faturamento</th>
                    <th style={{ whiteSpace: "nowrap" }}>Ticket</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((x, idx) => (
                    <tr key={x.id}>
                      <td>{idx + 1}</td>
                      <td>{x.nome}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{x.ag}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{x.con}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{x.can}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{formatCurrency(x.fat)}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{formatCurrency(x.ticket)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: 10, fontSize: 12, color: "var(--muted)" }}>
                * Selecione um barbeiro no filtro para ver somente ele.
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}