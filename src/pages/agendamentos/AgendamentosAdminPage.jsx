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

function toDateInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  const pad = (n) => String(n).padStart(2, "0");

  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hour = pad(d.getHours());
  const minute = pad(d.getMinutes());

  return `${year}-${month}-${day}T${hour}:${minute}`;
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
      background: "rgba(239,68,68,.12)",
      color: "#ef4444",
      border: "1px solid rgba(239,68,68,.28)",
    };
  }

  if (s.includes("CONCLU")) {
    return {
      background: "rgba(34,197,94,.12)",
      color: "#22c55e",
      border: "1px solid rgba(34,197,94,.28)",
    };
  }

  if (s.includes("AGEND")) {
    return {
      background: "rgba(59,130,246,.12)",
      color: "#3b82f6",
      border: "1px solid rgba(59,130,246,.28)",
    };
  }

  return {
    background: "rgba(148,163,184,.12)",
    color: "var(--text)",
    border: "1px solid rgba(148,163,184,.22)",
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

function currencyBRL(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
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

  const [modalRemarcarAberto, setModalRemarcarAberto] = useState(false);
  const [agendamentoEditando, setAgendamentoEditando] = useState(null);
  const [novaDataHora, setNovaDataHora] = useState("");
  const [novaObservacao, setNovaObservacao] = useState("");

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
      `Marcar como CONCLUÍDO?\n\nAgendamento ID: ${id}`
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

  async function cancelarAgendamento(a) {
    const id = a?.id;
    if (!id) return;

    const ok = window.confirm(
      `Cancelar este agendamento?\n\nAgendamento ID: ${id}`
    );
    if (!ok) return;

    try {
      setErro("");
      setLoading(true);

      await api.put(`/agendamentos/${id}`, {
        status: "CANCELADO",
        observacao: a?.observacao || "",
      });

      await carregarTudo();
    } catch (e) {
      setErro(getErrMsg(e));
    } finally {
      setLoading(false);
    }
  }

  function abrirModalRemarcar(a) {
    setAgendamentoEditando(a);
    setNovaDataHora(toDateInputValue(a?.dataHora));
    setNovaObservacao(a?.observacao || "");
    setModalRemarcarAberto(true);
  }

  function fecharModalRemarcar() {
    setModalRemarcarAberto(false);
    setAgendamentoEditando(null);
    setNovaDataHora("");
    setNovaObservacao("");
  }

  async function salvarRemarcacao() {
    const id = agendamentoEditando?.id;
    if (!id) return;

    if (!novaDataHora) {
      setErro("Selecione a nova data e hora.");
      return;
    }

    try {
      setErro("");
      setLoading(true);

      await api.put(`/agendamentos/${id}`, {
        status: agendamentoEditando?.status || "AGENDADO",
        dataHora: new Date(novaDataHora).toISOString(),
        observacao: novaObservacao || "",
      });

      fecharModalRemarcar();
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
        maxWidth: 1280,
        margin: "0 auto",
        padding: "20px 12px 28px",
        boxSizing: "border-box",
        width: "100%",
      }}
    >
      <div
        style={{
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(22px, 4vw, 30px)",
              lineHeight: 1.2,
            }}
          >
            Agendamentos
          </h1>
          <div style={{ marginTop: 6, color: "var(--muted)" }}>
            Controle completo de atendimentos
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <button
            className="btn"
            onClick={() => navigate("/agendamentos-admin/novo")}
            disabled={loading}
            style={styles.primaryBtn}
          >
            + Novo
          </button>

          <button
            className="btn"
            onClick={carregarTudo}
            disabled={loading}
            style={styles.secondaryBtn}
          >
            {loading ? "Carregando..." : "Recarregar"}
          </button>

          <button
            className="btn"
            onClick={limparFiltros}
            disabled={loading}
            style={styles.ghostBtn}
          >
            Limpar filtros
          </button>
        </div>
      </div>

      {erro && (
        <div
          className="alert error"
          style={{ marginBottom: 16 }}
        >
          {erro}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div className="card" style={styles.metricCard}>
          <div style={styles.metricLabel}>Total de agendamentos</div>
          <div style={styles.metricValue}>{total}</div>
        </div>

        <div className="card" style={styles.metricCard}>
          <div style={styles.metricLabel}>Faturamento filtrado</div>
          <div style={styles.metricValue}>{currencyBRL(soma)}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20, minWidth: 0 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
            gap: 12,
          }}
        >
          <select
            className="input"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={styles.input}
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
            style={styles.input}
          />

          <select
            className="input"
            value={barbeiroId}
            onChange={(e) => setBarbeiroId(e.target.value)}
            style={styles.input}
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
            style={styles.input}
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
            placeholder="Buscar cliente, barbeiro, serviço..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={styles.input}
          />
        </div>
      </div>

      <div
        className="card"
        style={{
          padding: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            overflowX: "auto",
            overflowY: "auto",
            maxHeight: "70vh",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <table
            style={{
              width: "100%",
              minWidth: 980,
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 2,
                  background: "var(--card-bg, #111827)",
                }}
              >
                <th style={styles.th}>Cliente</th>
                <th style={styles.th}>Data / Hora</th>
                <th style={styles.th}>Barbeiro</th>
                <th style={styles.th}>Serviço</th>
                <th style={styles.th}>Preço</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Ações</th>
              </tr>
            </thead>

            <tbody>
              {filtrados.map((a) => (
                <tr key={a.id} style={styles.tr}>
                  <td style={styles.tdStrong}>{a?.clienteNome || "-"}</td>

                  <td style={styles.td}>{formatDateTimeBR(a?.dataHora)}</td>

                  <td style={styles.td}>{a?.barbeiroNome || "-"}</td>

                  <td style={styles.td}>{a?.servicoNome || "-"}</td>

                  <td style={styles.td}>{currencyBRL(a?.preco || 0)}</td>

                  <td style={styles.td}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "6px 10px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        ...getStatusStyle(a?.status),
                      }}
                    >
                      {a?.status || "-"}
                    </span>
                  </td>

                  <td style={styles.td}>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        className="btn"
                        disabled={loading || isFinal(a)}
                        onClick={() => marcarConcluido(a)}
                        style={styles.successBtn}
                      >
                        Compareceu
                      </button>

                      <button
                        className="btn"
                        disabled={loading || isFinal(a)}
                        onClick={() => abrirModalRemarcar(a)}
                        style={styles.warningBtn}
                      >
                        Remarcar
                      </button>

                      <button
                        className="btn"
                        disabled={loading || isFinal(a)}
                        onClick={() => cancelarAgendamento(a)}
                        style={styles.dangerBtn}
                      >
                        Cancelar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtrados.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: 24,
                      textAlign: "center",
                      color: "var(--muted)",
                    }}
                  >
                    Nenhum agendamento encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalRemarcarAberto && (
        <div style={styles.modalOverlay} onClick={fecharModalRemarcar}>
          <div
            className="card"
            style={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "flex-start",
                marginBottom: 16,
              }}
            >
              <div>
                <h3 style={{ margin: 0 }}>Remarcar agendamento</h3>
                <div style={{ marginTop: 6, color: "var(--muted)" }}>
                  {agendamentoEditando?.clienteNome || "-"}
                </div>
              </div>

              <button
                className="btn"
                onClick={fecharModalRemarcar}
                style={styles.closeBtn}
              >
                Fechar
              </button>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  Nova data e hora
                </label>
                <input
                  className="input"
                  type="datetime-local"
                  value={novaDataHora}
                  onChange={(e) => setNovaDataHora(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  Observação
                </label>
                <textarea
                  className="input"
                  rows={4}
                  value={novaObservacao}
                  onChange={(e) => setNovaObservacao(e.target.value)}
                  style={{
                    ...styles.input,
                    resize: "vertical",
                    minHeight: 110,
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginTop: 18,
              }}
            >
              <button
                className="btn"
                onClick={salvarRemarcacao}
                disabled={loading}
                style={styles.primaryBtn}
              >
                Salvar remarcação
              </button>

              <button
                className="btn"
                onClick={fecharModalRemarcar}
                disabled={loading}
                style={styles.ghostBtn}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ========================= */
/* Styles */
/* ========================= */

const styles = {
  input: {
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
  },

  metricCard: {
    minWidth: 0,
  },

  metricLabel: {
    fontSize: 13,
    color: "var(--muted)",
    marginBottom: 8,
  },

  metricValue: {
    fontSize: "clamp(22px, 4vw, 28px)",
    fontWeight: 800,
    lineHeight: 1.2,
    wordBreak: "break-word",
  },

  th: {
    textAlign: "left",
    padding: "14px 16px",
    fontSize: 13,
    fontWeight: 800,
    color: "var(--muted)",
    borderBottom: "1px solid rgba(148,163,184,.16)",
    whiteSpace: "nowrap",
    backdropFilter: "blur(8px)",
  },

  tr: {
    borderBottom: "1px solid rgba(148,163,184,.10)",
  },

  td: {
    padding: "14px 16px",
    verticalAlign: "middle",
    fontSize: 14,
  },

  tdStrong: {
    padding: "14px 16px",
    verticalAlign: "middle",
    fontSize: 14,
    fontWeight: 700,
  },

  primaryBtn: {
    minHeight: 40,
    padding: "10px 14px",
    borderRadius: 10,
    fontWeight: 700,
  },

  secondaryBtn: {
    minHeight: 40,
    padding: "10px 14px",
    borderRadius: 10,
    fontWeight: 700,
  },

  ghostBtn: {
    minHeight: 40,
    padding: "10px 14px",
    borderRadius: 10,
    fontWeight: 700,
    background: "transparent",
  },

  successBtn: {
    minHeight: 36,
    padding: "8px 12px",
    borderRadius: 10,
    fontWeight: 700,
    background: "rgba(34,197,94,.14)",
    border: "1px solid rgba(34,197,94,.28)",
    color: "#22c55e",
  },

  warningBtn: {
    minHeight: 36,
    padding: "8px 12px",
    borderRadius: 10,
    fontWeight: 700,
    background: "rgba(245,158,11,.14)",
    border: "1px solid rgba(245,158,11,.28)",
    color: "#f59e0b",
  },

  dangerBtn: {
    minHeight: 36,
    padding: "8px 12px",
    borderRadius: 10,
    fontWeight: 700,
    background: "rgba(239,68,68,.14)",
    border: "1px solid rgba(239,68,68,.28)",
    color: "#ef4444",
  },

  closeBtn: {
    minHeight: 36,
    padding: "8px 12px",
    borderRadius: 10,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 9999,
  },

  modalContent: {
    width: "min(100%, 520px)",
    maxHeight: "90vh",
    overflowY: "auto",
    padding: 18,
    boxSizing: "border-box",
  },
};