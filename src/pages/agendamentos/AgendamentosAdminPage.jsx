// src/pages/agendamentos/AgendamentosAdminPage.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../../api/api";
import { useNavigate } from "react-router-dom";

function toDateValue(isoOrNull) {
  if (!isoOrNull) return "";
  const d = new Date(isoOrNull);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateTimeBR(isoOrNull) {
  if (!isoOrNull) return "-";
  const d = new Date(isoOrNull);
  if (Number.isNaN(d.getTime())) return String(isoOrNull);
  return d.toLocaleString("pt-BR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeText(v) {
  return String(v || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getStatusBadgeStyle(status) {
  const s = String(status || "").toUpperCase();
  if (s.includes("CANCEL")) return { background: "rgba(239,68,68,.12)", color: "#ef4444" };
  if (s.includes("CONCLU")) return { background: "rgba(34,197,94,.12)", color: "#22c55e" };
  if (s.includes("AGEND")) return { background: "rgba(59,130,246,.12)", color: "#3b82f6" };
  return { background: "rgba(148,163,184,.18)", color: "var(--text)" };
}

function compareStrings(a, b) {
  return String(a || "").localeCompare(String(b || ""), "pt-BR", { sensitivity: "base" });
}

function compareNumbers(a, b) {
  const na = Number(a ?? 0);
  const nb = Number(b ?? 0);
  const aa = Number.isNaN(na) ? 0 : na;
  const bb = Number.isNaN(nb) ? 0 : nb;
  return aa - bb;
}

function compareDates(a, b) {
  const ta = new Date(a || 0).getTime();
  const tb = new Date(b || 0).getTime();
  const aa = Number.isNaN(ta) ? 0 : ta;
  const bb = Number.isNaN(tb) ? 0 : tb;
  return aa - bb;
}

function escapeCsv(value) {
  const v = String(value ?? "").replace(/\r?\n/g, " ");
  const needsQuotes = /[",;]/.test(v);
  const escaped = v.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

function getErrMsg(e) {
  const data = e?.response?.data;
  if (!data) return e?.message || "Erro inesperado. Tente novamente.";
  if (typeof data === "string") return data;
  if (data?.message) return data.message;
  if (data?.mensagem) return data.mensagem;
  if (data?.erro) return data.erro;
  try {
    return JSON.stringify(data);
  } catch {
    return "Erro inesperado. Tente novamente.";
  }
}

// ✅ marca CONCLUIDO fazendo UPDATE completo (foge de /concluir e /status que estão 500)
async function concluirAgendamentoSeguro({ agendamento }) {
  if (!agendamento?.id) throw new Error("Agendamento sem ID.");

  const payload = {
    id: agendamento.id,
    clienteId: agendamento.clienteId,
    barbeiroId: agendamento.barbeiroId,
    servicoId: agendamento.servicoId,
    dataHora: agendamento.dataHora,
    observacao: agendamento.observacao || "",
    status: "CONCLUIDO",
  };

  const tentativas = [
    () => api.put(`/agendamentos/${agendamento.id}`, payload),
    () => api.patch(`/agendamentos/${agendamento.id}`, payload),
    () => api.put(`/agendamentos`, payload),
    () => api.patch(`/agendamentos`, payload),
  ];

  let ultimoErro = null;

  for (const fn of tentativas) {
    try {
      const res = await fn();
      return res;
    } catch (e) {
      const st = e?.response?.status;
      if (st === 404) {
        ultimoErro = e;
        continue;
      }
      throw e;
    }
  }

  const err = new Error("Nenhuma rota de UPDATE de agendamento foi encontrada (tudo deu 404).");
  err.original = ultimoErro;
  throw err;
}

export default function AgendamentosAdminPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const [agendamentos, setAgendamentos] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);
  const [servicos, setServicos] = useState([]);

  // filtros
  const [status, setStatus] = useState("");
  const [data, setData] = useState("");
  const [barbeiroId, setBarbeiroId] = useState("");
  const [servicoId, setServicoId] = useState("");
  const [busca, setBusca] = useState("");

  // ordenação
  const [sortKey, setSortKey] = useState("dataHora");
  const [sortDir, setSortDir] = useState("desc");

  async function carregarTudo() {
    try {
      setErro("");
      setLoading(true);

      const [agRes, barbRes, servRes] = await Promise.all([
        api.get("/agendamentos"),
        api.get("/barbeiros"),
        api.get("/servicos"),
      ]);

      setAgendamentos(Array.isArray(agRes.data) ? agRes.data : []);
      setBarbeiros(Array.isArray(barbRes.data) ? barbRes.data : []);
      setServicos(Array.isArray(servRes.data) ? servRes.data : []);
    } catch (e) {
      setErro(getErrMsg(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarTudo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtrados = useMemo(() => {
    const q = normalizeText(busca);

    return agendamentos.filter((a) => {
      if (status && String(a?.status || "") !== status) return false;
      if (data && toDateValue(a?.dataHora) !== data) return false;
      if (barbeiroId && String(a?.barbeiroId ?? "") !== String(barbeiroId)) return false;
      if (servicoId && String(a?.servicoId ?? "") !== String(servicoId)) return false;

      if (q) {
        const texto = normalizeText(
          `${a?.clienteNome || ""} ${a?.barbeiroNome || ""} ${a?.servicoNome || ""} ${a?.status || ""} ${
            a?.observacao || ""
          } ${a?.preco ?? ""}`
        );
        if (!texto.includes(q)) return false;
      }

      return true;
    });
  }, [agendamentos, status, data, barbeiroId, servicoId, busca]);

  const ordenados = useMemo(() => {
    const arr = filtrados.slice();
    const dir = sortDir === "asc" ? 1 : -1;

    arr.sort((a, b) => {
      let cmp = 0;

      if (sortKey === "dataHora") cmp = compareDates(a?.dataHora, b?.dataHora);
      else if (sortKey === "cliente") cmp = compareStrings(a?.clienteNome, b?.clienteNome);
      else if (sortKey === "barbeiro") cmp = compareStrings(a?.barbeiroNome, b?.barbeiroNome);
      else if (sortKey === "servico") cmp = compareStrings(a?.servicoNome, b?.servicoNome);
      else if (sortKey === "preco") cmp = compareNumbers(a?.preco, b?.preco);
      else if (sortKey === "status") cmp = compareStrings(a?.status, b?.status);

      if (cmp === 0) cmp = compareDates(a?.dataHora, b?.dataHora);
      return cmp * dir;
    });

    return arr;
  }, [filtrados, sortKey, sortDir]);

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    if (key === "dataHora" || key === "preco") setSortDir("desc");
    else setSortDir("asc");
  }

  function sortIndicator(key) {
    if (sortKey !== key) return "";
    return sortDir === "asc" ? " ▲" : " ▼";
  }

  function exportarCSV() {
    const header = ["id", "dataHora", "cliente", "barbeiro", "servico", "preco", "status", "observacao"];
    const lines = [header.join(";")];

    for (const a of ordenados) {
      const row = [
        escapeCsv(a?.id),
        escapeCsv(a?.dataHora),
        escapeCsv(a?.clienteNome),
        escapeCsv(a?.barbeiroNome),
        escapeCsv(a?.servicoNome),
        escapeCsv(a?.preco),
        escapeCsv(a?.status),
        escapeCsv(a?.observacao),
      ];
      lines.push(row.join(";"));
    }

    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });

    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const filename = `agendamentos_${y}-${m}-${d}.csv`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function limparFiltros() {
    setStatus("");
    setData("");
    setBarbeiroId("");
    setServicoId("");
    setBusca("");
  }

  const total = ordenados.length;
  const soma = useMemo(() => {
    let s = 0;
    for (const a of ordenados) {
      const v = Number(a?.preco ?? 0);
      if (!Number.isNaN(v)) s += v;
    }
    return s;
  }, [ordenados]);

  const thStyle = {
    cursor: "pointer",
    userSelect: "none",
    whiteSpace: "nowrap",
  };

  async function onCompareceu(agendamento) {
    const id = agendamento?.id;
    if (!id) return;

    const ok = window.confirm(`Marcar como CONCLUÍDO (compareceu)?\n\nAgendamento ID: ${id}`);
    if (!ok) return;

    try {
      setErro("");
      setLoading(true);

      await concluirAgendamentoSeguro({ agendamento });

      // ✅ recarrega a lista (pra status mudar na hora)
      await carregarTudo();
    } catch (e) {
      setErro(getErrMsg(e));
    } finally {
      setLoading(false);
    }
  }

  function isFinalizadoOuCancelado(a) {
    const s = String(a?.status || "").toUpperCase();
    return s.includes("CONCLU") || s.includes("CANCEL");
  }

  return (
    <div className="row" style={{ gap: 12, flexDirection: "column" }}>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0 }}>Agendamentos (Admin)</h1>
          <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 13 }}>
            Lista completa de agendamentos • filtros • ordenação • exportar CSV
          </div>
        </div>

        <div className="actions" style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={() => navigate("/agendamentos-admin/novo")} disabled={loading}>
            + Agendar como ADMIN
          </button>

          <button className="btn" onClick={carregarTudo} disabled={loading}>
            {loading ? "Carregando..." : "Recarregar"}
          </button>

          <button className="btn" onClick={limparFiltros} disabled={loading}>
            Limpar filtros
          </button>

          <button className="btn" onClick={exportarCSV} disabled={loading || total === 0}>
            Exportar CSV
          </button>
        </div>
      </div>

      {erro && <div className="alert">{erro}</div>}

      <div className="card">
        <div className="row" style={{ gap: 10, flexWrap: "wrap", alignItems: "end" }}>
          <div style={{ minWidth: 170 }}>
            <label style={{ fontSize: 12, color: "var(--muted)" }}>Status</label>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Todos</option>
              <option value="AGENDADO">AGENDADO</option>
              <option value="CANCELADO">CANCELADO</option>
              <option value="CONCLUIDO">CONCLUIDO</option>
            </select>
          </div>

          <div style={{ minWidth: 170 }}>
            <label style={{ fontSize: 12, color: "var(--muted)" }}>Data</label>
            <input className="input" type="date" value={data} onChange={(e) => setData(e.target.value)} />
          </div>

          <div style={{ minWidth: 240 }}>
            <label style={{ fontSize: 12, color: "var(--muted)" }}>Barbeiro</label>
            <select className="input" value={barbeiroId} onChange={(e) => setBarbeiroId(e.target.value)}>
              <option value="">Todos</option>
              {barbeiros.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nome}
                </option>
              ))}
            </select>
          </div>

          <div style={{ minWidth: 240 }}>
            <label style={{ fontSize: 12, color: "var(--muted)" }}>Serviço</label>
            <select className="input" value={servicoId} onChange={(e) => setServicoId(e.target.value)}>
              <option value="">Todos</option>
              {servicos.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: 220 }}>
            <label style={{ fontSize: 12, color: "var(--muted)" }}>Busca</label>
            <input
              className="input"
              placeholder="Cliente, barbeiro, serviço, status, observação..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>

        <div className="row" style={{ marginTop: 12, justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: "var(--muted)", fontSize: 13 }}>
            Mostrando <b style={{ color: "var(--text)" }}>{total}</b> agendamento(s)
            {" • "}
            Soma (preço):{" "}
            <b style={{ color: "var(--text)" }}>
              {soma.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </b>
          </div>

          <div style={{ color: "var(--muted)", fontSize: 12 }}>
            Ordenação: <b style={{ color: "var(--text)" }}>{sortKey}</b> ({sortDir})
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflowX: "auto" }}>
        <table className="table">
          <thead>
            <tr>
              <th style={thStyle} onClick={() => toggleSort("dataHora")} title="Ordenar por Data/Hora">
                Data/Hora{sortIndicator("dataHora")}
              </th>
              <th style={thStyle} onClick={() => toggleSort("cliente")} title="Ordenar por Cliente">
                Cliente{sortIndicator("cliente")}
              </th>
              <th style={thStyle} onClick={() => toggleSort("barbeiro")} title="Ordenar por Barbeiro">
                Barbeiro{sortIndicator("barbeiro")}
              </th>
              <th style={thStyle} onClick={() => toggleSort("servico")} title="Ordenar por Serviço">
                Serviço{sortIndicator("servico")}
              </th>
              <th style={thStyle} onClick={() => toggleSort("preco")} title="Ordenar por Preço">
                Preço{sortIndicator("preco")}
              </th>
              <th style={thStyle} onClick={() => toggleSort("status")} title="Ordenar por Status">
                Status{sortIndicator("status")}
              </th>
              <th>Observação</th>
              <th style={{ whiteSpace: "nowrap" }}>Ações</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ padding: 16, color: "var(--muted)" }}>
                  Carregando...
                </td>
              </tr>
            ) : ordenados.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: 16, color: "var(--muted)" }}>
                  Nenhum agendamento encontrado com os filtros atuais.
                </td>
              </tr>
            ) : (
              ordenados.map((a) => (
                <tr key={a.id}>
                  <td style={{ whiteSpace: "nowrap" }}>{formatDateTimeBR(a.dataHora)}</td>
                  <td>{a.clienteNome || "-"}</td>
                  <td>{a.barbeiroNome || "-"}</td>
                  <td>{a.servicoNome || "-"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {Number(a.preco ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </td>
                  <td>
                    <span className="badge" style={getStatusBadgeStyle(a.status)}>
                      {a.status || "-"}
                    </span>
                  </td>
                  <td style={{ maxWidth: 420 }}>
                    <span title={a.observacao || ""}>{a.observacao || "-"}</span>
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <button
                      className="btn"
                      onClick={() => onCompareceu(a)}
                      disabled={loading || isFinalizadoOuCancelado(a)}
                      title={isFinalizadoOuCancelado(a) ? "Já finalizado/cancelado" : "Marcar como CONCLUIDO"}
                    >
                      Compareceu
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}