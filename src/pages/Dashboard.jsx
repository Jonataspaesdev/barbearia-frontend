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

function formatCurrency(v) {
  const n = Number(v || 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function startOfWeekISO(date = new Date()) {
  // semana começando na SEGUNDA (padrão BR)
  const d = new Date(date);
  const day = d.getDay(); // 0 dom ... 6 sab
  const diff = (day === 0 ? -6 : 1 - day); // volta pra segunda
  d.setDate(d.getDate() + diff);
  return toISODate(d);
}

function endOfWeekISO(date = new Date()) {
  const start = new Date(startOfWeekISO(date));
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
  d.setDate(0); // último dia do mês atual
  return toISODate(d);
}

function normalizeText(v) {
  return String(v || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
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

/* =========================
   COMPONENTE PRINCIPAL
========================= */
export default function Dashboard() {
  const navigate = useNavigate();
  const user = getUserInfo();
  const isAdminUser = isAdmin(user.role);

  /* ==========================================================
     ✅ CLIENTE (mantém simples)
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
     ✅ ADMIN DASHBOARD PROFISSIONAL
  ========================================================== */

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const [barbeiros, setBarbeiros] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);

  // Relatório financeiro (barbearia) - vem do /pagamentos/relatorio
  const [relatorio, setRelatorio] = useState(null);

  // filtros
  const [periodo, setPeriodo] = useState("MES"); // "SEMANA" | "MES" | "CUSTOM"
  const [dataInicio, setDataInicio] = useState(startOfMonthISO(new Date()));
  const [dataFim, setDataFim] = useState(endOfMonthISO(new Date()));
  const [barbeiroId, setBarbeiroId] = useState("TODOS");

  // atualiza datas quando troca período
  useEffect(() => {
    const now = new Date();
    if (periodo === "SEMANA") {
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

      // 1) barbeiros (pra select)
      // 2) agendamentos (pra ranking e métricas por barbeiro)
      // 3) relatório financeiro da barbearia (REAL - pagamentos)
      const [bRes, aRes, rRes] = await Promise.all([
        api.get("/barbeiros"),
        api.get("/agendamentos"),
        api.get("/pagamentos/relatorio", { params: { dataInicio, dataFim } }),
      ]);

      setBarbeiros(Array.isArray(bRes.data) ? bRes.data : []);
      setAgendamentos(Array.isArray(aRes.data) ? aRes.data : []);
      setRelatorio(rRes.data || null);
    } catch (e) {
      setErro(safeErrMsg(e) || "Erro ao carregar dashboard.");
      setRelatorio(null);
    } finally {
      setLoading(false);
    }
  }

  // recarrega quando muda intervalo
  useEffect(() => {
    carregarTudo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataInicio, dataFim]);

  // ======== Métricas baseadas em AGENDAMENTOS CONCLUÍDOS no período ========
  const agConcluidosPeriodo = useMemo(() => {
    const ini = new Date(`${dataInicio}T00:00:00`);
    const fim = new Date(`${dataFim}T23:59:59`);
    const iniT = ini.getTime();
    const fimT = fim.getTime();

    return agendamentos.filter((a) => {
      const st = String(a?.status || "").toUpperCase();
      if (st !== "CONCLUIDO") return false;
      const t = new Date(a?.dataHora || 0).getTime();
      if (Number.isNaN(t)) return false;
      return t >= iniT && t <= fimT;
    });
  }, [agendamentos, dataInicio, dataFim]);

  const faturamentoPorAgendamento = useMemo(() => {
    // fallback quando não tiver pagamento por barbeiro:
    // soma preço dos CONCLUÍDOS do período
    return agConcluidosPeriodo.reduce((acc, a) => acc + (Number(a?.preco || 0) || 0), 0);
  }, [agConcluidosPeriodo]);

  const atendimentosConcluidos = agConcluidosPeriodo.length;

  const ticketMedio = useMemo(() => {
    if (!atendimentosConcluidos) return 0;
    return faturamentoPorAgendamento / atendimentosConcluidos;
  }, [faturamentoPorAgendamento, atendimentosConcluidos]);

  const rankingBarbeiros = useMemo(() => {
    const map = new Map(); // barbeiroId => { barbeiroId, nome, total, qtd }
    for (const a of agConcluidosPeriodo) {
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
  }, [agConcluidosPeriodo]);

  const barbeiroSelecionado = useMemo(() => {
    if (barbeiroId === "TODOS") return null;
    return barbeiros.find((b) => String(b.id) === String(barbeiroId)) || null;
  }, [barbeiros, barbeiroId]);

  const resumoBarbeiro = useMemo(() => {
    if (!barbeiroSelecionado) return null;

    const id = String(barbeiroSelecionado.id);
    const item = rankingBarbeiros.find((x) => String(x.barbeiroId) === id);

    return {
      nome: barbeiroSelecionado.nome || item?.nome || `Barbeiro #${id}`,
      total: item?.total || 0,
      qtd: item?.qtd || 0,
      ticket: item?.qtd ? item.total / item.qtd : 0,
    };
  }, [barbeiroSelecionado, rankingBarbeiros]);

  // ======== Métricas financeiras (pagamentos) ========
  const totalPagamentos = Number(relatorio?.total || 0) || 0;
  const qtdPagamentos = Number(relatorio?.quantidadePagamentos || 0) || 0;
  const ticketMedioPagamentos = useMemo(() => {
    if (!qtdPagamentos) return 0;
    return totalPagamentos / qtdPagamentos;
  }, [totalPagamentos, qtdPagamentos]);

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
            Financeiro real (pagamentos) • Performance por barbeiro • Filtro por período
          </div>
        </div>

        <div className="row" style={{ justifyContent: "flex-end" }}>
          <button className="btn" onClick={carregarTudo} disabled={loading}>
            {loading ? "Atualizando..." : "Atualizar"}
          </button>
        </div>
      </div>

      {erro ? <div className="alert error">{erro}</div> : null}

      {/* Filtros */}
      <div className="card" style={{ marginTop: 12 }}>
        <div className="row" style={{ gap: 10, flexWrap: "wrap", alignItems: "end" }}>
          <div style={{ minWidth: 180 }}>
            <label style={{ fontSize: 12, color: "var(--muted)" }}>Período</label>
            <select className="input" value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
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
            <label style={{ fontSize: 12, color: "var(--muted)" }}>Barbeiro (para detalhar)</label>
            <select className="input" value={barbeiroId} onChange={(e) => setBarbeiroId(e.target.value)}>
              <option value="TODOS">Todos (ranking)</option>
              {barbeiros.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nome}
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
          * Faturamento <b>GERAL</b> vem de <b>/pagamentos/relatorio</b> (dinheiro real). Ranking por barbeiro usa agendamentos <b>CONCLUÍDOS</b> no período.
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
          label="💳 Faturamento (Barbearia)"
          value={formatCurrency(totalPagamentos)}
          hint={`${qtdPagamentos} pagamento(s) no período • ticket médio ${formatCurrency(ticketMedioPagamentos)}`}
        />

        <Pill
          label="✅ Atendimentos CONCLUÍDOS"
          value={String(atendimentosConcluidos)}
          hint={`Pelo /agendamentos • ticket médio ${formatCurrency(ticketMedio)}`}
        />

        <Pill
          label="🧾 Faturamento (por agendamentos)"
          value={formatCurrency(faturamentoPorAgendamento)}
          hint="Soma dos preços dos CONCLUÍDOS (bom para comparar com pagamentos)"
        />

        <Pill
          label="👥 Barbeiros ativos"
          value={String(barbeiros.length)}
          hint="Listados pelo /barbeiros"
        />
      </div>

      {/* Detalhe do barbeiro selecionado */}
      <div className="card" style={{ marginTop: 12 }}>
        <div className="spread" style={{ gap: 12 }}>
          <h3 style={{ margin: 0 }}>💈 Detalhe do barbeiro</h3>
          <div className="badge">
            {barbeiroId === "TODOS" ? "Selecione um barbeiro para ver detalhes" : `Selecionado: ${resumoBarbeiro?.nome || "-"}`}
          </div>
        </div>

        {barbeiroId === "TODOS" ? (
          <div style={{ marginTop: 10, color: "var(--muted)", fontSize: 13 }}>
            Escolha um barbeiro no filtro acima para ver faturamento e atendimentos dele no período.
          </div>
        ) : (
          <div
            style={{
              marginTop: 12,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 12,
            }}
          >
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Faturamento do barbeiro (CONCLUÍDOS)</div>
              <div style={{ fontSize: 24, fontWeight: 900, marginTop: 6 }}>{formatCurrency(resumoBarbeiro?.total || 0)}</div>
              <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted)" }}>
                {resumoBarbeiro?.qtd || 0} atendimento(s) • ticket {formatCurrency(resumoBarbeiro?.ticket || 0)}
              </div>
            </div>

            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Ações</div>
              <div className="row" style={{ gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                <button className="btn" onClick={() => navigate("/agendamentos-admin")}>
                  Ver agendamentos (Admin)
                </button>
                <button className="btn" onClick={() => navigate("/agendamentos-admin/novo")}>
                  + Agendar como admin
                </button>
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)" }}>
                Dica: use a página de agendamentos para marcar “Compareceu”.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ranking */}
      <div className="card" style={{ marginTop: 12 }}>
        <div className="spread" style={{ gap: 12 }}>
          <h3 style={{ margin: 0 }}>🏆 Ranking de barbeiros (período)</h3>
          <div style={{ color: "var(--muted)", fontSize: 13 }}>
            Ordenado por faturamento (CONCLUÍDOS)
          </div>
        </div>

        {loading ? (
          <div style={{ marginTop: 12, color: "var(--muted)" }}>Carregando...</div>
        ) : rankingBarbeiros.length === 0 ? (
          <div style={{ marginTop: 12, color: "var(--muted)" }}>
            Nenhum atendimento CONCLUÍDO no período selecionado.
          </div>
        ) : (
          <div style={{ marginTop: 10, overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ whiteSpace: "nowrap" }}>#</th>
                  <th>Barbeiro</th>
                  <th style={{ whiteSpace: "nowrap" }}>Atendimentos</th>
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
    </div>
  );
}