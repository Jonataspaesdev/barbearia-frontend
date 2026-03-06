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
      background: "#FEE2E2",
      color: "#B91C1C",
      border: "1px solid #FCA5A5",
    };
  }

  if (s.includes("CONCLU")) {
    return {
      background: "#DCFCE7",
      color: "#166534",
      border: "1px solid #86EFAC",
    };
  }

  if (s.includes("AGEND")) {
    return {
      background: "#DBEAFE",
      color: "#1D4ED8",
      border: "1px solid #93C5FD",
    };
  }

  return {
    background: "#E5E7EB",
    color: "#111827",
    border: "1px solid #D1D5DB",
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

function isCancelado(status) {
  return String(status || "").toUpperCase().includes("CANCEL");
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

  const faturamentoFiltrado = useMemo(() => {
    return filtrados.reduce((acc, a) => {
      if (isCancelado(a?.status)) return acc;
      const v = Number(a?.preco ?? 0);
      return acc + (Number.isNaN(v) ? 0 : v);
    }, 0);
  }, [filtrados]);

  const totalCancelados = useMemo(() => {
    return filtrados.filter((a) => isCancelado(a?.status)).length;
  }, [filtrados]);

  function isFinal(a) {
    const s = String(a?.status || "").toUpperCase();
    return s.includes("CONCLU") || s.includes("CANCEL");
  }

  async function marcarConcluido(a) {
    const id = a?.id;
    if (!id) return;

    const ok = window.confirm(
      `Confirmar presença deste cliente?\n\nAgendamento ID: ${id}`
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
      `Deseja realmente cancelar este agendamento?\n\nAgendamento ID: ${id}`
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
        status: "AGENDADO",
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
        maxWidth: 1320,
        margin: "0 auto",
        padding: "20px 12px 28px",
        boxSizing: "border-box",
        width: "100%",
        background: "#F9FAFB",
        minHeight: "100vh",
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
              fontSize: "clamp(24px, 4vw, 32px)",
              lineHeight: 1.2,
              color: "#111827",
            }}
          >
            Agendamentos
          </h1>

          <div
            style={{
              marginTop: 8,
              color: "#4B5563",
              fontSize: 16,
            }}
          >
            Tela simples para visualizar, remarcar, confirmar ou cancelar.
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
            + Novo agendamento
          </button>

          <button
            className="btn"
            onClick={carregarTudo}
            disabled={loading}
            style={styles.secondaryBtn}
          >
            {loading ? "Atualizando..." : "Atualizar lista"}
          </button>

          <button
            className="btn"
            onClick={limparFiltros}
            disabled={loading}
            style={styles.neutralBtn}
          >
            Limpar filtros
          </button>
        </div>
      </div>

      {erro && (
        <div style={styles.errorBox}>
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
        <div style={styles.metricCard}>
          <div style={styles.metricLabel}>Total encontrado</div>
          <div style={styles.metricValue}>{total}</div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricLabel}>Faturamento filtrado</div>
          <div style={styles.metricValue}>{currencyBRL(faturamentoFiltrado)}</div>
          <div style={styles.metricHelp}>Não soma agendamentos cancelados</div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricLabel}>Cancelados no filtro</div>
          <div style={styles.metricValue}>{totalCancelados}</div>
        </div>
      </div>

      <div style={styles.filterCard}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
            gap: 14,
          }}
        >
          <select
            className="input"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={styles.input}
          >
            <option value="">Todos os status</option>
            <option value="AGENDADO">Somente agendados</option>
            <option value="CANCELADO">Somente cancelados</option>
            <option value="CONCLUIDO">Somente concluídos</option>
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
            <option value="">Todos os barbeiros</option>
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
            <option value="">Todos os serviços</option>
            {servicos.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
          </select>

          <input
            className="input"
            placeholder="Buscar cliente, barbeiro ou serviço"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={styles.input}
          />
        </div>
      </div>

      <div style={styles.tableCard}>
        <div
          style={{
            overflowX: "auto",
            overflowY: "auto",
            maxHeight: "68vh",
            WebkitOverflowScrolling: "touch",
            background: "#FFFFFF",
          }}
        >
          <table
            style={{
              width: "100%",
              minWidth: 1120,
              borderCollapse: "collapse",
              background: "#FFFFFF",
            }}
          >
            <thead>
              <tr style={{ background: "#F3F4F6" }}>
                <th style={styles.th}>Cliente</th>
                <th style={styles.th}>Data e hora</th>
                <th style={styles.th}>Barbeiro</th>
                <th style={styles.th}>Serviço</th>
                <th style={styles.th}>Preço</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Ações</th>
              </tr>
            </thead>

            <tbody>
              {filtrados.map((a, index) => (
                <tr
                  key={a.id}
                  style={{
                    background: index % 2 === 0 ? "#FFFFFF" : "#FAFAFA",
                  }}
                >
                  <td style={styles.tdStrong}>{a?.clienteNome || "-"}</td>
                  <td style={styles.td}>{formatDateTimeBR(a?.dataHora)}</td>
                  <td style={styles.td}>{a?.barbeiroNome || "-"}</td>
                  <td style={styles.td}>{a?.servicoNome || "-"}</td>
                  <td style={styles.td}>{currencyBRL(a?.preco || 0)}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "7px 12px",
                        borderRadius: 999,
                        fontSize: 13,
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
                        title="Marcar que o cliente compareceu"
                      >
                        Confirmar presença
                      </button>

                      <button
                        className="btn"
                        disabled={loading || isFinal(a)}
                        onClick={() => abrirModalRemarcar(a)}
                        style={styles.warningBtn}
                        title="Alterar data e hora"
                      >
                        Remarcar
                      </button>

                      <button
                        className="btn"
                        disabled={loading || isFinal(a)}
                        onClick={() => cancelarAgendamento(a)}
                        style={styles.dangerBtn}
                        title="Cancelar agendamento"
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
                      padding: 28,
                      textAlign: "center",
                      color: "#6B7280",
                      fontSize: 16,
                      background: "#FFFFFF",
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
            style={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "flex-start",
                marginBottom: 18,
                flexWrap: "wrap",
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 24,
                    color: "#111827",
                  }}
                >
                  Remarcar agendamento
                </h3>

                <div
                  style={{
                    marginTop: 8,
                    color: "#4B5563",
                    fontSize: 16,
                  }}
                >
                  Cliente: <strong>{agendamentoEditando?.clienteNome || "-"}</strong>
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

            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={styles.label}>Nova data e hora</label>
                <input
                  className="input"
                  type="datetime-local"
                  value={novaDataHora}
                  onChange={(e) => setNovaDataHora(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Observação</label>
                <textarea
                  className="input"
                  rows={4}
                  value={novaObservacao}
                  onChange={(e) => setNovaObservacao(e.target.value)}
                  style={{
                    ...styles.input,
                    resize: "vertical",
                    minHeight: 120,
                  }}
                  placeholder="Escreva uma observação, se quiser"
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginTop: 20,
              }}
            >
              <button
                className="btn"
                onClick={salvarRemarcacao}
                disabled={loading}
                style={styles.primaryBtn}
              >
                Salvar nova data
              </button>

              <button
                className="btn"
                onClick={fecharModalRemarcar}
                disabled={loading}
                style={styles.neutralBtn}
              >
                Voltar
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
    minHeight: 50,
    fontSize: 16,
    borderRadius: 12,
  },

  label: {
    display: "block",
    marginBottom: 8,
    fontSize: 15,
    fontWeight: 700,
    color: "#111827",
  },

  errorBox: {
    marginBottom: 16,
    background: "#FEE2E2",
    color: "#991B1B",
    border: "1px solid #FCA5A5",
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
  },

  metricCard: {
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: 16,
    padding: 18,
    minWidth: 0,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },

  metricLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
    fontWeight: 600,
  },

  metricValue: {
    fontSize: "clamp(24px, 4vw, 30px)",
    fontWeight: 800,
    lineHeight: 1.2,
    color: "#111827",
    wordBreak: "break-word",
  },

  metricHelp: {
    marginTop: 8,
    fontSize: 13,
    color: "#6B7280",
  },

  filterCard: {
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },

  tableCard: {
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },

  th: {
    textAlign: "left",
    padding: "16px",
    fontSize: 14,
    fontWeight: 800,
    color: "#374151",
    borderBottom: "1px solid #E5E7EB",
    whiteSpace: "nowrap",
    position: "sticky",
    top: 0,
    background: "#F3F4F6",
    zIndex: 2,
  },

  td: {
    padding: "16px",
    verticalAlign: "middle",
    fontSize: 15,
    color: "#111827",
    borderBottom: "1px solid #F3F4F6",
  },

  tdStrong: {
    padding: "16px",
    verticalAlign: "middle",
    fontSize: 15,
    fontWeight: 800,
    color: "#111827",
    borderBottom: "1px solid #F3F4F6",
  },

  primaryBtn: {
    minHeight: 46,
    padding: "12px 16px",
    borderRadius: 12,
    fontWeight: 800,
    fontSize: 15,
  },

  secondaryBtn: {
    minHeight: 46,
    padding: "12px 16px",
    borderRadius: 12,
    fontWeight: 800,
    fontSize: 15,
  },

  neutralBtn: {
    minHeight: 46,
    padding: "12px 16px",
    borderRadius: 12,
    fontWeight: 800,
    fontSize: 15,
    background: "#F3F4F6",
    color: "#111827",
    border: "1px solid #D1D5DB",
  },

  successBtn: {
    minHeight: 40,
    padding: "10px 14px",
    borderRadius: 10,
    fontWeight: 800,
    fontSize: 14,
    background: "#DCFCE7",
    border: "1px solid #86EFAC",
    color: "#166534",
  },

  warningBtn: {
    minHeight: 40,
    padding: "10px 14px",
    borderRadius: 10,
    fontWeight: 800,
    fontSize: 14,
    background: "#FEF3C7",
    border: "1px solid #FCD34D",
    color: "#92400E",
  },

  dangerBtn: {
    minHeight: 40,
    padding: "10px 14px",
    borderRadius: 10,
    fontWeight: 800,
    fontSize: 14,
    background: "#FEE2E2",
    border: "1px solid #FCA5A5",
    color: "#B91C1C",
  },

  closeBtn: {
    minHeight: 42,
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: 700,
    fontSize: 15,
    background: "#F3F4F6",
    color: "#111827",
    border: "1px solid #D1D5DB",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(17, 24, 39, 0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 9999,
  },

  modalContent: {
    width: "min(100%, 560px)",
    maxHeight: "90vh",
    overflowY: "auto",
    padding: 20,
    boxSizing: "border-box",
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: 18,
    boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
  },
};