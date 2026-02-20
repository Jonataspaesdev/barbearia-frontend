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

function getInitials(nome) {
  const clean = (nome || "").trim();
  if (!clean) return "U";
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const first = parts[0]?.[0] || "";
  const last = parts[parts.length - 1]?.[0] || "";
  return (first + last).toUpperCase() || "U";
}

function formatDateTimeBR(iso) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
}

/* =========================
   COMPONENTE PRINCIPAL
========================= */
export default function Dashboard() {
  const navigate = useNavigate();
  const user = getUserInfo();
  const isAdminUser = isAdmin(user.role);

  /* ==========================================
     ✅ CLIENTE: painel SEM endpoint (front-only)
  ========================================== */
  useEffect(() => {
    if (!isAdminUser) {
      const key = "ultimoLogin";
      // atualiza sempre que abrir o dashboard (mais útil que "só se não existir")
      localStorage.setItem(key, new Date().toISOString());
    }
  }, [isAdminUser]);

  const ultimoLogin = localStorage.getItem("ultimoLogin");

  const dicas = useMemo(
    () => [
      "Mantenha o corte em dia: voltar a cada 15 dias deixa sempre alinhado.",
      "Hidrate a barba: óleo ou balm ajuda a reduzir frizz e ressecamento.",
      "Use shampoo próprio para barba: sabonete comum pode ressecar.",
      "Pentear a barba diariamente ajuda no formato e na aparência.",
      "Se for usar máquina em casa, comece com pente maior e vá descendo.",
      "Finalize com pomada certa: matte para natural, brilho para visual marcado.",
      "Corte navalhado pede manutenção: retoques leves fazem diferença.",
    ],
    []
  );

  const dicaDoDia = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return dicas[dayOfYear % dicas.length];
  }, [dicas]);

  const avisos = useMemo(
    () => [
      {
        titulo: "📌 Aviso",
        texto: "Horários de sábado costumam lotar. Garanta seu horário com antecedência.",
      },
      {
        titulo: "🔥 Promoção",
        texto: "Corte + Barba: peça no balcão e confira se está ativo na semana!",
      },
      {
        titulo: "💬 Dica rápida",
        texto: "Chegue 5 min antes para não atrasar o atendimento 🙂",
      },
    ],
    []
  );

  /* ==========================================
     ✅ ADMIN: estados e carregamento (com endpoint)
     IMPORTANTE: Hooks SEMPRE no topo, antes de return!
  ========================================== */
  const [clientes, setClientes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(false);

  const [statusFiltro, setStatusFiltro] = useState("TODOS");
  const [dataFiltro, setDataFiltro] = useState("TODOS");
  const [servicoFiltro, setServicoFiltro] = useState("TODOS");
  const [barbeiroFiltro, setBarbeiroFiltro] = useState("TODOS");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    if (isAdminUser) {
      carregarDados();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminUser]);

  async function carregarDados() {
    try {
      setLoading(true);

      const [clientesRes, servicosRes, barbeirosRes, agendamentosRes] =
        await Promise.all([
          api.get("/clientes"),
          api.get("/servicos"),
          api.get("/barbeiros"),
          api.get("/agendamentos"),
        ]);

      setClientes(Array.isArray(clientesRes.data) ? clientesRes.data : []);
      setServicos(Array.isArray(servicosRes.data) ? servicosRes.data : []);
      setBarbeiros(Array.isArray(barbeirosRes.data) ? barbeirosRes.data : []);
      setAgendamentos(Array.isArray(agendamentosRes.data) ? agendamentosRes.data : []);
    } catch (err) {
      console.error("Erro ao carregar dashboard", err);
    } finally {
      setLoading(false);
    }
  }

  // --------- Helpers (compatibilidade DTO) ----------
  function getClienteNome(a) {
    return a?.clienteNome || a?.nomeCliente || "-";
  }
  function getBarbeiroNome(a) {
    return a?.barbeiroNome || a?.nomeBarbeiro || "-";
  }
  function getServicoNome(a) {
    return a?.servicoNome || a?.nomeServico || "-";
  }
  function getServicoId(a) {
    return a?.servicoId ?? null;
  }
  function getBarbeiroId(a) {
    return a?.barbeiroId ?? null;
  }

  function normalizarStatus(status) {
    return (status || "").toUpperCase();
  }

  function labelStatus(status) {
    const s = normalizarStatus(status);
    if (s === "CONCLUIDO") return "FINALIZADO";
    return s || "-";
  }

  function formatarData(data) {
    try {
      return new Date(data).toLocaleString("pt-BR");
    } catch {
      return "-";
    }
  }

  function isHoje(data) {
    const hoje = new Date();
    const d = new Date(data);
    return (
      d.getDate() === hoje.getDate() &&
      d.getMonth() === hoje.getMonth() &&
      d.getFullYear() === hoje.getFullYear()
    );
  }

  function dentroProximos7Dias(data) {
    const hoje = new Date();
    const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 0, 0, 0, 0);
    const limite = new Date(inicioHoje);
    limite.setDate(limite.getDate() + 7);
    const d = new Date(data);
    return d >= inicioHoje && d <= limite;
  }

  function dentroDoMesAtual(data) {
    const hoje = new Date();
    const d = new Date(data);
    return d.getMonth() === hoje.getMonth() && d.getFullYear() === hoje.getFullYear();
  }

  function textoAgendamento(a) {
    const parts = [getClienteNome(a), getBarbeiroNome(a), getServicoNome(a), a?.observacao, a?.status].filter(Boolean);
    return parts.join(" ").toLowerCase();
  }

  function badgeStatus(status) {
    const s = normalizarStatus(status);

    const style = {
      padding: "4px 10px",
      borderRadius: "999px",
      fontSize: 12,
      fontWeight: 800,
      letterSpacing: 0.3,
      color: "white",
      display: "inline-block",
      minWidth: 100,
      textAlign: "center",
    };

    if (s === "AGENDADO") style.backgroundColor = "#2563eb";
    else if (s === "CANCELADO") style.backgroundColor = "#dc2626";
    else if (s === "CONCLUIDO") style.backgroundColor = "#16a34a";
    else style.backgroundColor = "#374151";

    return <span style={style}>{labelStatus(s)}</span>;
  }

  function bateServico(a) {
    if (servicoFiltro === "TODOS") return true;

    const alvoId = Number(servicoFiltro);
    const idAg = getServicoId(a);
    const nomeAg = getServicoNome(a);

    const servicoSelecionado = servicos.find((s) => Number(s.id) === alvoId);
    const nomeSelecionado = servicoSelecionado?.nome || "";

    const batePorId = idAg != null && Number(idAg) === alvoId;
    const batePorNome = nomeSelecionado && nomeAg && nomeAg.toLowerCase() === nomeSelecionado.toLowerCase();

    return batePorId || batePorNome;
  }

  function bateBarbeiro(a) {
    if (barbeiroFiltro === "TODOS") return true;

    const alvoId = Number(barbeiroFiltro);
    const idAg = getBarbeiroId(a);
    const nomeAg = getBarbeiroNome(a);

    const barbeiroSelecionado = barbeiros.find((b) => Number(b.id) === alvoId);
    const nomeSelecionado = barbeiroSelecionado?.nome || "";

    const batePorId = idAg != null && Number(idAg) === alvoId;
    const batePorNome = nomeSelecionado && nomeAg && nomeAg.toLowerCase() === nomeSelecionado.toLowerCase();

    return batePorId || batePorNome;
  }

  const agendamentosFiltrados = useMemo(() => {
    const lista = [...agendamentos];

    const filtrada = lista.filter((a) => {
      const status = normalizarStatus(a.status);

      if (statusFiltro !== "TODOS" && status !== statusFiltro) return false;

      if (dataFiltro === "HOJE" && !isHoje(a.dataHora)) return false;
      if (dataFiltro === "7DIAS" && !dentroProximos7Dias(a.dataHora)) return false;
      if (dataFiltro === "MES" && !dentroDoMesAtual(a.dataHora)) return false;

      if (!bateServico(a)) return false;
      if (!bateBarbeiro(a)) return false;

      if (busca.trim()) {
        const texto = busca.trim().toLowerCase();
        if (!textoAgendamento(a).includes(texto)) return false;
      }

      return true;
    });

    filtrada.sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));
    return filtrada;
  }, [agendamentos, statusFiltro, dataFiltro, servicoFiltro, barbeiroFiltro, busca, servicos, barbeiros]);

  const agendamentosHoje = useMemo(
    () => agendamentos.filter((a) => isHoje(a.dataHora)).length,
    [agendamentos]
  );

  const faturamento = useMemo(() => {
    return agendamentos
      .filter((a) => normalizarStatus(a.status) !== "CANCELADO")
      .reduce((total, a) => total + (Number(a.preco) || 0), 0);
  }, [agendamentos]);

  const faturamentoMesBarbearia = useMemo(() => {
    return agendamentos
      .filter((a) => dentroDoMesAtual(a.dataHora))
      .filter((a) => normalizarStatus(a.status) !== "CANCELADO")
      .reduce((total, a) => total + (Number(a.preco) || 0), 0);
  }, [agendamentos]);

  const faturamentoMesBarbeiroSelecionado = useMemo(() => {
    if (barbeiroFiltro === "TODOS") return null;

    return agendamentos
      .filter((a) => dentroDoMesAtual(a.dataHora))
      .filter((a) => normalizarStatus(a.status) !== "CANCELADO")
      .filter((a) => bateBarbeiro(a))
      .reduce((total, a) => total + (Number(a.preco) || 0), 0);
  }, [agendamentos, barbeiroFiltro, barbeiros]);

  function escapeCsv(v) {
    const s = String(v ?? "");
    return `"${s.replace(/"/g, '""')}"`;
  }

  function gerarCsv(dados) {
    const header = ["ID", "DataHora", "Cliente", "Barbeiro", "Servico", "Preco", "Status", "Observacao"];

    const rows = dados.map((a) => [
      a.id,
      a.dataHora,
      getClienteNome(a),
      getBarbeiroNome(a),
      getServicoNome(a),
      a.preco,
      labelStatus(a.status),
      a.observacao,
    ]);

    return [header.map(escapeCsv).join(","), ...rows.map((r) => r.map(escapeCsv).join(","))].join("\n");
  }

  function exportarCsv() {
    const csv = gerarCsv(agendamentosFiltrados);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const agora = new Date();
    const stamp = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}-${String(
      agora.getDate()
    ).padStart(2, "0")}_${String(agora.getHours()).padStart(2, "0")}${String(agora.getMinutes()).padStart(2, "0")}`;

    const a = document.createElement("a");
    a.href = url;
    a.download = `agenda_admin_${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function pill(label, value, bg) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 12px",
          borderRadius: 12,
          background: bg,
          border: "1px solid rgba(255,255,255,0.06)",
          minWidth: 220,
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontWeight: 700 }}>{label}</span>
        <span style={{ fontWeight: 900, fontSize: 18 }}>{value}</span>
      </div>
    );
  }

  const nomeBarbeiroSelecionado = useMemo(() => {
    if (barbeiroFiltro === "TODOS") return null;
    const b = barbeiros.find((x) => String(x.id) === String(barbeiroFiltro));
    return b?.nome || `Barbeiro #${barbeiroFiltro}`;
  }, [barbeiroFiltro, barbeiros]);

  /* =========================
     ✅ RENDER
========================= */

  // CLIENTE
  if (!isAdminUser) {
    return (
      <div style={{ padding: 24 }}>
        <div className="spread" style={{ marginBottom: 14 }}>
          <div>
            <h1 style={{ margin: 0 }}>👋 Olá, {user.nome}</h1>
            <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 13 }}>
              Bem-vindo ao seu painel. Aqui você acessa atalhos e informações rápidas.
            </div>
          </div>

          <div className="badge" title={user.role || ""}>
            <span style={{ opacity: 0.9, fontWeight: 800 }}>{formatRole(user.role)}</span>
            {user.clienteId ? <span>• ID {user.clienteId}</span> : null}
          </div>
        </div>

        <div className="row">
          {/* Perfil */}
          <div className="card" style={{ minWidth: 280, flex: "1 1 320px" }}>
            <h3 style={{ marginTop: 0 }}>🙍 Perfil</h3>

            <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 10 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 900,
                  color: "#eaf2ff",
                  border: "1px solid rgba(59,130,246,0.35)",
                  background:
                    "radial-gradient(120% 120% at 20% 20%, rgba(59,130,246,0.55), rgba(59,130,246,0.15))",
                }}
                title={user.nome}
              >
                {getInitials(user.nome)}
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 900, fontSize: 15 }}>{user.nome}</div>
                <div style={{ color: "var(--muted)", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user.email || "Sem email"}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 12, fontSize: 13, color: "var(--muted)" }}>
              Último acesso:{" "}
              <b style={{ color: "var(--text)" }}>{ultimoLogin ? formatDateTimeBR(ultimoLogin) : "-"}</b>
            </div>
          </div>

          {/* Atalhos */}
          <div className="card" style={{ minWidth: 280, flex: "1 1 320px" }}>
            <h3 style={{ marginTop: 0 }}>⚡ Atalhos rápidos</h3>

            <div className="stack" style={{ marginTop: 10 }}>
              <button
                className="btn"
                onClick={() => navigate("/agendamentos")}
                style={{ width: "100%", textAlign: "left", padding: "12px 14px", borderRadius: 14 }}
              >
                <div style={{ fontWeight: 900 }}>📅 Ver meus agendamentos</div>
                <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>Acompanhar status e datas</div>
              </button>

              <button
                className="btn primary"
                onClick={() => navigate("/agendamentos/novo")}
                style={{ width: "100%", textAlign: "left", padding: "12px 14px", borderRadius: 14 }}
              >
                <div style={{ fontWeight: 900 }}>➕ Marcar horário</div>
                <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>Agendar um novo atendimento</div>
              </button>
            </div>
          </div>

          {/* Avisos / Promoções */}
          <div className="card" style={{ minWidth: 280, flex: "1 1 320px" }}>
            <h3 style={{ marginTop: 0 }}>📣 Avisos e promoções</h3>

            <div className="stack" style={{ marginTop: 10 }}>
              {avisos.map((x) => (
                <div
                  key={x.titulo}
                  style={{
                    border: "1px solid rgba(255,255,255,0.06)",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 14,
                    padding: 12,
                  }}
                >
                  <div style={{ fontWeight: 900 }}>{x.titulo}</div>
                  <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 13 }}>{x.texto}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Dica do dia */}
          <div className="card" style={{ minWidth: 280, flex: "1 1 320px" }}>
            <h3 style={{ marginTop: 0 }}>💡 Dica do dia</h3>

            <div
              style={{
                marginTop: 10,
                border: "1px solid rgba(59,130,246,0.25)",
                background: "rgba(59,130,246,0.08)",
                borderRadius: 14,
                padding: 12,
                color: "rgba(242,242,242,0.92)",
                lineHeight: 1.4,
              }}
            >
              {dicaDoDia}
            </div>

            <div style={{ marginTop: 10, color: "var(--muted)", fontSize: 12 }}>
              * Esse painel do cliente é 100% front (sem endpoint).
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ADMIN
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 18 }}>📊 Dashboard Administrativo</h1>

      <div className="row">
        <div className="card">
          <h3>Clientes</h3>
          <p style={{ fontSize: 22, marginTop: 8 }}>{clientes.length}</p>
        </div>

        <div className="card">
          <h3>Agendamentos</h3>
          <p style={{ fontSize: 22, marginTop: 8 }}>{agendamentos.length}</p>
        </div>

        <div className="card">
          <h3>Hoje</h3>
          <p style={{ fontSize: 22, marginTop: 8 }}>{agendamentosHoje}</p>
        </div>

        <div className="card">
          <h3>Faturamento Estimado (Geral)</h3>
          <p style={{ fontSize: 22, marginTop: 8 }}>
            R$ {Number(faturamento || 0).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="spread">
          <h3 style={{ margin: 0 }}>Resumo</h3>
          <div style={{ opacity: 0.85, fontSize: 13 }}>
            Visíveis agora: <b>{agendamentosFiltrados.length}</b> (após filtros/busca)
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
          {pill(
            "✅ Agendados",
            agendamentos.filter((a) => normalizarStatus(a.status) === "AGENDADO").length,
            "rgba(37,99,235,0.12)"
          )}
          {pill(
            "❌ Cancelados",
            agendamentos.filter((a) => normalizarStatus(a.status) === "CANCELADO").length,
            "rgba(220,38,38,0.12)"
          )}
          {pill(
            "🏁 Finalizados",
            agendamentos.filter((a) => normalizarStatus(a.status) === "CONCLUIDO").length,
            "rgba(22,163,74,0.12)"
          )}
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
          {pill(
            "💰 Total Barbearia (mês atual)",
            `R$ ${Number(faturamentoMesBarbearia || 0).toFixed(2)}`,
            "rgba(255,255,255,0.06)"
          )}

          {barbeiroFiltro !== "TODOS" && (
            pill(
              `💈 ${nomeBarbeiroSelecionado} (mês atual)`,
              `R$ ${Number(faturamentoMesBarbeiroSelecionado || 0).toFixed(2)}`,
              "rgba(255,255,255,0.06)"
            )
          )}
        </div>

        <p style={{ marginTop: 10, opacity: 0.75, fontSize: 12 }}>
          * Totais do mês ignoram agendamentos cancelados.
        </p>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <h3 style={{ marginTop: 0 }}>Filtros</h3>

        <div className="row" style={{ marginTop: 8 }}>
          <select className="input" value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}>
            <option value="TODOS">Todos Status</option>
            <option value="AGENDADO">AGENDADO</option>
            <option value="CANCELADO">CANCELADO</option>
            <option value="CONCLUIDO">FINALIZADO</option>
          </select>

          <select className="input" value={dataFiltro} onChange={(e) => setDataFiltro(e.target.value)}>
            <option value="TODOS">Todas Datas</option>
            <option value="HOJE">Hoje</option>
            <option value="7DIAS">Próximos 7 dias</option>
            <option value="MES">Este mês</option>
          </select>

          <select className="input" value={servicoFiltro} onChange={(e) => setServicoFiltro(e.target.value)}>
            <option value="TODOS">Todos Serviços</option>
            {servicos.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.nome}
              </option>
            ))}
          </select>

          <select className="input" value={barbeiroFiltro} onChange={(e) => setBarbeiroFiltro(e.target.value)}>
            <option value="TODOS">Todos Barbeiros</option>
            {barbeiros.map((b) => (
              <option key={b.id} value={String(b.id)}>
                {b.nome}
              </option>
            ))}
          </select>

          <input
            className="input"
            placeholder="Buscar cliente, barbeiro, serviço ou observação..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="row" style={{ marginTop: 10 }}>
          <button className="btn" onClick={carregarDados}>
            Recarregar
          </button>

          <button className="btn" onClick={() => navigate("/clientes")}>
            Ir para Clientes
          </button>

          <button className="btn" onClick={exportarCsv}>
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="spread">
          <h3 style={{ margin: 0 }}>📅 Agenda Completa</h3>
          <div style={{ opacity: 0.85, fontSize: 13 }}>
            Mostrando <b>{agendamentosFiltrados.length}</b> de <b>{agendamentos.length}</b>
          </div>
        </div>

        {loading ? (
          <p style={{ marginTop: 14 }}>Carregando...</p>
        ) : agendamentosFiltrados.length === 0 ? (
          <p style={{ marginTop: 14 }}>Nenhum agendamento encontrado com os filtros atuais.</p>
        ) : (
          <div style={{ marginTop: 12, overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Cliente</th>
                  <th>Barbeiro</th>
                  <th>Serviço</th>
                  <th>Preço</th>
                  <th>Status</th>
                  <th>Observação</th>
                </tr>
              </thead>
              <tbody>
                {agendamentosFiltrados.map((a) => (
                  <tr key={a.id}>
                    <td>{formatarData(a.dataHora)}</td>
                    <td>{getClienteNome(a)}</td>
                    <td>{getBarbeiroNome(a)}</td>
                    <td>{getServicoNome(a)}</td>
                    <td>R$ {Number(a.preco || 0).toFixed(2)}</td>
                    <td>{badgeStatus(a.status)}</td>
                    <td style={{ maxWidth: 420, whiteSpace: "normal" }}>{a.observacao || "-"}</td>
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