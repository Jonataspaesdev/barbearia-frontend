// src/pages/agendamentos/AgendamentosAdminPage.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../../api/api";
import { useNavigate } from "react-router-dom";

/* ========================= */
/* Utils */
/* ========================= */

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

function normalize(v) {
  return String(v || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getStatusStyle(status) {
  const s = String(status || "").toUpperCase();

  if (s.includes("CANCEL")) {
    return {
      background: "rgba(239,68,68,.15)",
      color: "#ef4444",
    };
  }

  if (s.includes("CONCLU")) {
    return {
      background: "rgba(34,197,94,.15)",
      color: "#22c55e",
    };
  }

  if (s.includes("AGEND")) {
    return {
      background: "rgba(59,130,246,.15)",
      color: "#3b82f6",
    };
  }

  return {
    background: "rgba(148,163,184,.18)",
    color: "var(--text)",
  };
}

function getErrMsg(e) {
  const data = e?.response?.data;

  if (!data) return e?.message || "Erro inesperado.";
  if (typeof data === "string") return data;
  if (data?.message) return data.message;
  if (data?.mensagem) return data.mensagem;
  if (data?.erro) return data.erro;

  try {
    return JSON.stringify(data);
  } catch {
    return "Erro inesperado.";
  }
}

/* ========================= */
/* COMPONENTE */
/* ========================= */

export default function AgendamentosAdminPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const [agendamentos, setAgendamentos] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);
  const [servicos, setServicos] = useState([]);

  const [status, setStatus] = useState("");
  const [data, setData] = useState("");
  const [barbeiroId, setBarbeiroId] = useState("");
  const [servicoId, setServicoId] = useState("");
  const [busca, setBusca] = useState("");

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
      setErro(getErrMsg(e) || "Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarTudo();
  }, []);

  const filtrados = useMemo(() => {
    const q = normalize(busca);

    return agendamentos.filter((a) => {
      if (status && String(a.status || "") !== status) return false;

      if (data) {
        const iso = a?.dataHora
          ? new Date(a.dataHora).toISOString().slice(0, 10)
          : "";

        if (iso !== data) return false;
      }

      if (barbeiroId && String(a?.barbeiroId ?? "") !== String(barbeiroId)) {
        return false;
      }

      if (servicoId && String(a?.servicoId ?? "") !== String(servicoId)) {
        return false;
      }

      if (q) {
        const texto = normalize(
          `${a?.clienteNome || ""} ${a?.barbeiroNome || ""} ${
            a?.servicoNome || ""
          } ${a?.status || ""}`
        );

        if (!texto.includes(q)) return false;
      }

      return true;
    });
  }, [agendamentos, status, data, barbeiroId, servicoId, busca]);

  const total = filtrados.length;

  const soma = useMemo(() => {
    return filtrados.reduce((acc, a) => {
      const v = Number(a?.preco ?? 0);
      return acc + (Number.isNaN(v) ? 0 : v);
    }, 0);
  }, [filtrados]);

  function isFinal(a) {
    const s = String(a?.status || "").toUpperCase();
    return s.includes("CONCLU") || s.includes("CANCEL");
  }

  async function marcarConcluido(a) {
    const id = a?.id;
    if (!id) return;

    const ok = window.confirm(
      `Marcar como CONCLUÍDO (compareceu)?\n\nAgendamento ID: ${id}`
    );
    if (!ok) return;

    try {
      setErro("");
      setLoading(true);

      await api.put(`/agendamentos/${id}`, {
        status: "CONCLUIDO",
        observacao: a?.observacao || "",
      });

      await carregarTudo();
    } catch (e) {
      setErro(getErrMsg(e));
    } finally {
      setLoading(false);
    }
  }

  function limparFiltros() {
    setStatus("");
    setData("");
    setBarbeiroId("");
    setServicoId("");
    setBusca("");
  }

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "24px 12px",
        boxSizing: "border-box",
        width: "100%",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            margin: 0,
            fontSize: "clamp(22px, 4vw, 28px)",
            lineHeight: 1.2,
            wordBreak: "break-word",
          }}
        >
          Agendamentos
        </h1>

        <div
          style={{
            marginTop: 8,
            color: "var(--muted)",
            wordBreak: "break-word",
          }}
        >
          Controle completo de atendimentos
        </div>
      </div>

      {erro && <div className="alert error">{erro}</div>}

      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        <button
          className="btn"
          onClick={() => navigate("/agendamentos-admin/novo")}
          disabled={loading}
          style={{ flex: "1 1 180px", minWidth: 0 }}
        >
          + Novo
        </button>

        <button
          className="btn"
          onClick={carregarTudo}
          disabled={loading}
          style={{ flex: "1 1 180px", minWidth: 0 }}
        >
          {loading ? "Carregando..." : "Recarregar"}
        </button>

        <button
          className="btn"
          onClick={limparFiltros}
          disabled={loading}
          style={{ flex: "1 1 180px", minWidth: 0 }}
        >
          Limpar filtros
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div className="card" style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Total</div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              wordBreak: "break-word",
            }}
          >
            {total}
          </div>
        </div>

        <div className="card" style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>
            Faturamento
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              wordBreak: "break-word",
            }}
          >
            {soma.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24, minWidth: 0 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
            gap: 16,
            minWidth: 0,
          }}
        >
          <select
            className="input"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ width: "100%", minWidth: 0 }}
          >
            <option value="">Todos Status</option>
            <option value="AGENDADO">Agendado</option>
            <option value="CANCELADO">Cancelado</option>
            <option value="CONCLUIDO">Concluído</option>
          </select>

          <input
            className="input"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            style={{ width: "100%", minWidth: 0 }}
          />

          <select
            className="input"
            value={barbeiroId}
            onChange={(e) => setBarbeiroId(e.target.value)}
            style={{ width: "100%", minWidth: 0 }}
          >
            <option value="">Todos Barbeiros</option>
            {barbeiros.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nome}
              </option>
            ))}
          </select>

          <select
            className="input"
            value={servicoId}
            onChange={(e) => setServicoId(e.target.value)}
            style={{ width: "100%", minWidth: 0 }}
          >
            <option value="">Todos Serviços</option>
            {servicos.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
          </select>

          <input
            className="input"
            placeholder="Buscar..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{ width: "100%", minWidth: 0 }}
          />
        </div>
      </div>

      <div style={{ display: "grid", gap: 16, minWidth: 0 }}>
        {filtrados.map((a) => (
          <div
            key={a.id}
            className="card"
            style={{
              padding: 16,
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: 10,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  minWidth: 0,
                  flex: "1 1 220px",
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                }}
              >
                {a?.clienteNome || "-"}
              </div>

              <div
                style={{
                  fontSize: 14,
                  color: "var(--muted)",
                  minWidth: 0,
                  flex: "1 1 180px",
                  textAlign: "left",
                  wordBreak: "break-word",
                }}
              >
                {formatDateTimeBR(a?.dataHora)}
              </div>
            </div>

            <div
              style={{
                marginTop: 12,
                display: "grid",
                gap: 8,
                minWidth: 0,
              }}
            >
              <div style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
                <b>Barbeiro:</b> {a?.barbeiroNome || "-"}
              </div>

              <div style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
                <b>Serviço:</b> {a?.servicoNome || "-"}
              </div>

              <div style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
                <b>Preço:</b>{" "}
                {Number(a?.preco || 0).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </div>

              <div>
                <span
                  style={{
                    display: "inline-block",
                    padding: "6px 12px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700,
                    maxWidth: "100%",
                    wordBreak: "break-word",
                    ...getStatusStyle(a?.status),
                  }}
                >
                  {a?.status || "-"}
                </span>
              </div>
            </div>

            <div
              style={{
                marginTop: 14,
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                minWidth: 0,
              }}
            >
              <button
                className="btn"
                disabled={loading || isFinal(a)}
                onClick={() => marcarConcluido(a)}
                style={{
                  flex: "1 1 220px",
                  minWidth: 0,
                  width: "100%",
                }}
              >
                Compareceu
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtrados.length === 0 && !loading && (
        <div
          style={{
            marginTop: 20,
            color: "var(--muted)",
            wordBreak: "break-word",
          }}
        >
          Nenhum agendamento encontrado.
        </div>
      )}
    </div>
  );
}