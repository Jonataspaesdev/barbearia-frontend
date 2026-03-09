import { useEffect, useMemo, useState } from "react";
import api from "../../api/api";
import { useNavigate } from "react-router-dom";

/* ========================= */
/* Utils */
/* ========================= */

function pad2(n) {
  return String(n).padStart(2, "0");
}

function toISODateLocal(isoOrDate) {
  const d = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
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

function normalize(v) {
  return String(v || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function clampStatus(status) {
  return String(status || "").toUpperCase();
}

function getStatusStyle(status) {
  const s = clampStatus(status);
  if (s.includes("CANCEL")) {
    return {
      background: "#3a1212",
      color: "#ff8f8f",
      border: "1px solid #7f1d1d",
    };
  }
  if (s.includes("CONCLU")) {
    return {
      background: "#0f2e1a",
      color: "#7ef0a2",
      border: "1px solid #166534",
    };
  }
  if (s.includes("AGEND")) {
    return {
      background: "#12253f",
      color: "#8fc2ff",
      border: "1px solid #1d4ed8",
    };
  }
  return {
    background: "#1f2937",
    color: "#f3f4f6",
    border: "1px solid #374151",
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

function isSunday(isoDate) {
  if (!isoDate) return false;
  const d = new Date(`${isoDate}T12:00:00`);
  return d.getDay() === 0;
}

/* ========================= */
/* Modal */
/* ========================= */

function Modal({ open, title, onClose, children, footer }) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      style={styles.modalOverlay}
    >
      <div style={styles.modalBox}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>{title}</h3>
          <button type="button" onClick={onClose} style={styles.closeBtn}>
            Fechar
          </button>
        </div>

        <div style={{ marginTop: 16 }}>{children}</div>

        {footer ? <div style={{ marginTop: 18 }}>{footer}</div> : null}
      </div>
    </div>
  );
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

  const [aba, setAba] = useState("AGENDADO");
  const [data, setData] = useState("");
  const [barbeiroId, setBarbeiroId] = useState("");
  const [servicoId, setServicoId] = useState("");
  const [busca, setBusca] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [alvo, setAlvo] = useState(null);
  const [novaData, setNovaData] = useState(toISODateLocal(new Date()));
  const [novoHorario, setNovoHorario] = useState("");
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [modalErro, setModalErro] = useState("");

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

  function isFinal(a) {
    const s = clampStatus(a?.status);
    return s === "CONCLUIDO" || s === "CANCELADO";
  }

  const filtrados = useMemo(() => {
    const q = normalize(busca);

    return agendamentos
      .filter((a) => {
        const st = clampStatus(a?.status);

        if (aba !== "TODOS" && st !== aba) return false;

        if (data) {
          const iso = a?.dataHora ? toISODateLocal(a.dataHora) : "";
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
            `${a?.clienteNome || ""} ${a?.barbeiroNome || ""} ${a?.servicoNome || ""} ${st}`
          );
          if (!texto.includes(q)) return false;
        }

        return true;
      })
      .sort(
        (x, y) =>
          new Date(x?.dataHora || 0).getTime() -
          new Date(y?.dataHora || 0).getTime()
      );
  }, [agendamentos, aba, data, barbeiroId, servicoId, busca]);

  const resumo = useMemo(() => {
    let ag = 0;
    let con = 0;
    let can = 0;
    let fat = 0;

    for (const a of filtrados) {
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
    return { total: filtrados.length, ag, con, can, fat, ticket };
  }, [filtrados]);

  async function marcarConcluido(a) {
    const id = a?.id;
    if (!id) return;

    const ok = window.confirm(`Marcar como CONCLUÍDO (compareceu)?\n\nID: ${id}`);
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

    const ok = window.confirm(`Cancelar este agendamento?\n\nID: ${id}`);
    if (!ok) return;

    try {
      setErro("");
      setLoading(true);

      await api.delete(`/agendamentos/${id}/cancelar`);
      await carregarTudo();
    } catch (e) {
      setErro(getErrMsg(e));
    } finally {
      setLoading(false);
    }
  }

  function abrirRemarcar(a) {
    setModalErro("");
    setAlvo(a || null);

    const d = a?.dataHora
      ? toISODateLocal(a.dataHora)
      : toISODateLocal(new Date());

    setNovaData(d);
    setNovoHorario("");
    setSlots([]);
    setModalOpen(true);
  }

  async function carregarSlots(barbeiroIdParam, dataISO) {
    if (!barbeiroIdParam || !dataISO) return;

    if (isSunday(dataISO)) {
      setSlots([]);
      return;
    }

    try {
      setSlotsLoading(true);
      setModalErro("");

      const resp = await api.get("/agendamentos/disponibilidade", {
        params: { barbeiroId: barbeiroIdParam, data: dataISO },
      });

      const info = resp.data || {};
      const duracaoMin = Number(info?.duracaoMin || 30) || 30;
      const horaEntrada = String(info?.horaEntrada || "09:00").slice(0, 5);
      const horaSaida = String(info?.horaSaida || "18:30").slice(0, 5);
      const ocupados = new Set(
        (info?.ocupados || []).map((h) => String(h).slice(0, 5))
      );

      const [eh, em] = horaEntrada.split(":").map(Number);
      const [sh, sm] = horaSaida.split(":").map(Number);

      const start = new Date(`${dataISO}T00:00:00`);
      start.setHours(eh, em, 0, 0);

      const end = new Date(`${dataISO}T00:00:00`);
      end.setHours(sh, sm, 0, 0);

      const now = new Date();
      const isHoje = toISODateLocal(now) === dataISO;

      const gen = [];
      for (
        let t = new Date(start);
        t < end;
        t = new Date(t.getTime() + duracaoMin * 60_000)
      ) {
        const label = `${pad2(t.getHours())}:${pad2(t.getMinutes())}`;
        if (ocupados.has(label)) continue;
        if (isHoje && t.getTime() <= now.getTime()) continue;
        gen.push(label);
      }

      setSlots(gen);
    } catch (e) {
      setModalErro(getErrMsg(e));
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }

  useEffect(() => {
    if (!modalOpen) return;
    const bId = alvo?.barbeiroId;
    if (!bId) return;
    carregarSlots(bId, novaData);
  }, [modalOpen, alvo, novaData]);

  async function confirmarRemarcacao() {
    if (!alvo?.id) return;
    if (!alvo?.barbeiroId) {
      setModalErro("Agendamento sem barbeiroId.");
      return;
    }
    if (!novaData) {
      setModalErro("Selecione a data.");
      return;
    }
    if (isSunday(novaData)) {
      setModalErro("Domingo fechado.");
      return;
    }
    if (!novoHorario) {
      setModalErro("Selecione o horário.");
      return;
    }

    try {
      setModalErro("");
      setLoading(true);

      const novaDataHora = `${novaData}T${novoHorario}:00`;

      await api.put(`/agendamentos/${alvo.id}`, {
        dataHora: novaDataHora,
        observacao: alvo?.observacao || "",
      });

      setModalOpen(false);
      setAlvo(null);
      await carregarTudo();
    } catch (e) {
      setModalErro(getErrMsg(e));
    } finally {
      setLoading(false);
    }
  }

  function limparFiltros() {
    setData("");
    setBarbeiroId("");
    setServicoId("");
    setBusca("");
  }

  function Tab({ id, label }) {
    const active = aba === id;

    return (
      <button
        type="button"
        onClick={() => setAba(id)}
        disabled={loading}
        style={{
          ...styles.tabBtn,
          ...(active ? styles.tabBtnActive : {}),
        }}
      >
        {label}
      </button>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.headerTop}>
        <div>
          <h1 style={styles.title}>Agendamentos</h1>
          <p style={styles.subtitle}>
            Tela simples, clara e fácil de usar para confirmar presença,
            remarcar e cancelar.
          </p>
        </div>

        <div style={styles.headerActions}>
          <button
            type="button"
            onClick={() => navigate("/agendamentos-admin/novo")}
            disabled={loading}
            style={styles.primaryButton}
          >
            + Novo agendamento
          </button>

          <button
            type="button"
            onClick={carregarTudo}
            disabled={loading}
            style={styles.secondaryButton}
          >
            {loading ? "Carregando..." : "Atualizar"}
          </button>

          <button
            type="button"
            onClick={limparFiltros}
            disabled={loading}
            style={styles.ghostButton}
          >
            Limpar filtros
          </button>
        </div>
      </div>

      {erro && <div style={styles.errorBox}>{erro}</div>}

      <div style={styles.tabsWrap}>
        <Tab id="AGENDADO" label="Agendados" />
        <Tab id="CONCLUIDO" label="Concluídos" />
        <Tab id="CANCELADO" label="Cancelados" />
        <Tab id="TODOS" label="Todos" />
      </div>

      <div style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <div style={styles.metricLabel}>Total</div>
          <div style={styles.metricValue}>{resumo.total}</div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricLabel}>Agendados</div>
          <div style={styles.metricValue}>{resumo.ag}</div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricLabel}>Concluídos</div>
          <div style={styles.metricValue}>{resumo.con}</div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricLabel}>Cancelados</div>
          <div style={styles.metricValue}>{resumo.can}</div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricLabel}>Faturamento</div>
          <div style={styles.metricValueMoney}>
            {resumo.fat.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </div>
          <div style={styles.metricHelp}>
            Ticket médio:{" "}
            {resumo.ticket.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.filtersGrid}>
          <input
            style={styles.input}
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />

          <select
            style={styles.input}
            value={barbeiroId}
            onChange={(e) => setBarbeiroId(e.target.value)}
          >
            <option value="">Todos os barbeiros</option>
            {barbeiros.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nome}
              </option>
            ))}
          </select>

          <select
            style={styles.input}
            value={servicoId}
            onChange={(e) => setServicoId(e.target.value)}
          >
            <option value="">Todos os serviços</option>
            {servicos.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
          </select>

          <input
            style={styles.input}
            placeholder="Buscar cliente, barbeiro ou serviço"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.cardsList}>
          {filtrados.map((a) => {
            const st = clampStatus(a?.status);
            const finalizado = isFinal(a);

            return (
              <div key={a.id} style={styles.agendamentoCard}>
                <div style={styles.cardRowTop}>
                  <div>
                    <div style={styles.cardClient}>{a?.clienteNome || "-"}</div>
                    <div style={styles.cardDate}>
                      {formatDateTimeBR(a?.dataHora)}
                    </div>
                  </div>

                  <span style={{ ...styles.statusBadge, ...getStatusStyle(st) }}>
                    {st || "-"}
                  </span>
                </div>

                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Serviço</span>
                    <span style={styles.infoValue}>{a?.servicoNome || "-"}</span>
                  </div>

                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Barbeiro</span>
                    <span style={styles.infoValue}>{a?.barbeiroNome || "-"}</span>
                  </div>

                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Valor</span>
                    <span style={styles.infoValue}>
                      {Number(a?.preco || 0).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>
                </div>

                <div style={styles.actionsWrap}>
                  <button
                    type="button"
                    disabled={loading || finalizado}
                    onClick={() => marcarConcluido(a)}
                    style={{
                      ...styles.actionBtn,
                      ...styles.successBtn,
                      ...(loading || finalizado ? styles.disabledBtn : {}),
                    }}
                  >
                    Confirmar presença
                  </button>

                  <button
                    type="button"
                    disabled={loading || finalizado}
                    onClick={() => abrirRemarcar(a)}
                    style={{
                      ...styles.actionBtn,
                      ...styles.warningBtn,
                      ...(loading || finalizado ? styles.disabledBtn : {}),
                    }}
                  >
                    Remarcar
                  </button>

                  <button
                    type="button"
                    disabled={loading || finalizado}
                    onClick={() => cancelarAgendamento(a)}
                    style={{
                      ...styles.actionBtn,
                      ...styles.dangerBtn,
                      ...(loading || finalizado ? styles.disabledBtn : {}),
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            );
          })}

          {filtrados.length === 0 && !loading ? (
            <div style={styles.emptyBox}>Nenhum agendamento encontrado.</div>
          ) : null}
        </div>
      </div>

      <Modal
        open={modalOpen}
        title="🔁 Remarcar agendamento"
        onClose={() => {
          setModalOpen(false);
          setAlvo(null);
          setModalErro("");
        }}
        footer={
          <div style={styles.modalFooter}>
            <button
              type="button"
              onClick={() => {
                setModalOpen(false);
                setAlvo(null);
                setModalErro("");
              }}
              style={styles.ghostButton}
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={confirmarRemarcacao}
              disabled={loading}
              style={styles.primaryButton}
            >
              Confirmar remarcação
            </button>
          </div>
        }
      >
        {modalErro ? <div style={styles.errorBox}>{modalErro}</div> : null}

        <div style={styles.modalInfoCard}>
          <div style={styles.modalInfoTitle}>Agendamento atual</div>
          <div style={styles.modalInfoMain}>
            {alvo?.clienteNome || "-"} • {alvo?.servicoNome || "-"}
          </div>
          <div style={styles.modalInfoText}>
            Barbeiro: <b>{alvo?.barbeiroNome || "-"}</b>
          </div>
          <div style={styles.modalInfoText}>
            Data/Hora atual: <b>{formatDateTimeBR(alvo?.dataHora)}</b>
          </div>
        </div>

        <div style={styles.modalFormGrid}>
          <div>
            <label style={styles.label}>Nova data</label>
            <input
              style={styles.input}
              type="date"
              value={novaData}
              onChange={(e) => setNovaData(e.target.value)}
            />
            {isSunday(novaData) ? (
              <div style={styles.helperText}>Domingo fechado.</div>
            ) : null}
          </div>

          <div>
            <label style={styles.label}>Horário disponível</label>
            <select
              style={styles.input}
              value={novoHorario}
              onChange={(e) => setNovoHorario(e.target.value)}
              disabled={slotsLoading || isSunday(novaData)}
            >
              <option value="">
                {slotsLoading ? "Carregando horários..." : "Selecione"}
              </option>
              {slots.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
            <div style={styles.helperText}>
              Mostra apenas horários livres.
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ========================= */
/* Styles */
/* ========================= */

const styles = {
  page: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "20px 14px 40px",
    color: "#f9fafb",
  },

  title: {
    margin: 0,
    fontSize: "clamp(28px, 5vw, 38px)",
    fontWeight: 800,
    lineHeight: 1.15,
  },

  subtitle: {
    margin: "10px 0 0",
    fontSize: "clamp(15px, 2.5vw, 18px)",
    color: "#cbd5e1",
    lineHeight: 1.5,
  },

  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    flexWrap: "wrap",
    marginBottom: 18,
  },

  headerActions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  card: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 20,
    padding: 16,
    marginBottom: 18,
    boxShadow: "0 8px 24px rgba(0,0,0,.18)",
  },

  tabsWrap: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 18,
  },

  tabBtn: {
    minHeight: 48,
    padding: "12px 16px",
    borderRadius: 14,
    border: "1px solid #374151",
    background: "#1f2937",
    color: "#f9fafb",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
  },

  tabBtnActive: {
    background: "#facc15",
    color: "#111827",
    border: "1px solid #facc15",
  },

  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 14,
    marginBottom: 18,
  },

  metricCard: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 8px 24px rgba(0,0,0,.18)",
  },

  metricLabel: {
    fontSize: 14,
    color: "#cbd5e1",
    marginBottom: 10,
    fontWeight: 600,
  },

  metricValue: {
    fontSize: "clamp(28px, 5vw, 34px)",
    fontWeight: 800,
    color: "#ffffff",
  },

  metricValueMoney: {
    fontSize: "clamp(22px, 4vw, 28px)",
    fontWeight: 800,
    color: "#ffffff",
    lineHeight: 1.3,
  },

  metricHelp: {
    marginTop: 8,
    fontSize: 13,
    color: "#94a3b8",
    lineHeight: 1.4,
  },

  filtersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
  },

  input: {
    width: "100%",
    minHeight: 52,
    borderRadius: 14,
    border: "1px solid #374151",
    background: "#0f172a",
    color: "#f9fafb",
    padding: "12px 14px",
    fontSize: 17,
    boxSizing: "border-box",
    outline: "none",
  },

  cardsList: {
    display: "grid",
    gap: 14,
  },

  agendamentoCard: {
    background: "#0f172a",
    border: "1px solid #273244",
    borderRadius: 18,
    padding: 16,
  },

  cardRowTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    flexWrap: "wrap",
  },

  cardClient: {
    fontSize: "clamp(20px, 3.5vw, 22px)",
    fontWeight: 800,
    color: "#ffffff",
    lineHeight: 1.2,
  },

  cardDate: {
    marginTop: 6,
    fontSize: 16,
    color: "#cbd5e1",
    lineHeight: 1.4,
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 36,
    padding: "6px 12px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 800,
    whiteSpace: "nowrap",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
    marginTop: 14,
  },

  infoItem: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 14,
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  infoLabel: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: 700,
  },

  infoValue: {
    fontSize: 16,
    color: "#f9fafb",
    fontWeight: 700,
    lineHeight: 1.4,
  },

  actionsWrap: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 10,
    marginTop: 16,
  },

  actionBtn: {
    minHeight: 50,
    borderRadius: 14,
    border: "none",
    fontSize: 16,
    fontWeight: 800,
    cursor: "pointer",
    padding: "12px 14px",
    transition: "0.2s ease",
  },

  successBtn: {
    background: "#166534",
    color: "#f0fdf4",
    border: "1px solid #22c55e",
  },

  warningBtn: {
    background: "#facc15",
    color: "#111827",
    border: "1px solid #eab308",
    opacity: 1,
  },

  dangerBtn: {
    background: "#991b1b",
    color: "#fff1f2",
    border: "1px solid #ef4444",
  },

  disabledBtn: {
    opacity: 0.45,
    cursor: "not-allowed",
  },

  primaryButton: {
    minHeight: 50,
    padding: "12px 16px",
    borderRadius: 14,
    border: "1px solid #facc15",
    background: "#facc15",
    color: "#111827",
    fontSize: 16,
    fontWeight: 800,
    cursor: "pointer",
  },

  secondaryButton: {
    minHeight: 50,
    padding: "12px 16px",
    borderRadius: 14,
    border: "1px solid #374151",
    background: "#1f2937",
    color: "#f9fafb",
    fontSize: 16,
    fontWeight: 800,
    cursor: "pointer",
  },

  ghostButton: {
    minHeight: 50,
    padding: "12px 16px",
    borderRadius: 14,
    border: "1px solid #374151",
    background: "#111827",
    color: "#f9fafb",
    fontSize: 16,
    fontWeight: 800,
    cursor: "pointer",
  },

  errorBox: {
    marginBottom: 16,
    background: "#3a1212",
    color: "#ffb4b4",
    border: "1px solid #7f1d1d",
    borderRadius: 16,
    padding: 14,
    fontSize: 16,
    lineHeight: 1.5,
  },

  emptyBox: {
    background: "#0f172a",
    border: "1px solid #1f2937",
    borderRadius: 16,
    padding: 24,
    textAlign: "center",
    color: "#cbd5e1",
    fontSize: 17,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.72)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    zIndex: 9999,
  },

  modalBox: {
    width: "min(680px, 100%)",
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 22,
    padding: 18,
    boxShadow: "0 24px 64px rgba(0,0,0,.45)",
    maxHeight: "90vh",
    overflowY: "auto",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    flexWrap: "wrap",
  },

  modalTitle: {
    margin: 0,
    fontSize: "clamp(24px, 4vw, 30px)",
    fontWeight: 800,
    color: "#ffffff",
  },

  closeBtn: {
    minHeight: 46,
    padding: "10px 14px",
    borderRadius: 14,
    border: "1px solid #374151",
    background: "#1f2937",
    color: "#f9fafb",
    fontSize: 15,
    fontWeight: 800,
    cursor: "pointer",
  },

  modalInfoCard: {
    background: "#0f172a",
    border: "1px solid #1f2937",
    borderRadius: 16,
    padding: 14,
  },

  modalInfoTitle: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: 700,
    marginBottom: 8,
  },

  modalInfoMain: {
    fontSize: 20,
    fontWeight: 800,
    color: "#ffffff",
    lineHeight: 1.3,
  },

  modalInfoText: {
    marginTop: 6,
    fontSize: 15,
    color: "#cbd5e1",
    lineHeight: 1.5,
  },

  modalFormGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
    marginTop: 16,
  },

  label: {
    display: "block",
    marginBottom: 8,
    fontSize: 15,
    fontWeight: 800,
    color: "#f9fafb",
  },

  helperText: {
    marginTop: 8,
    fontSize: 13,
    color: "#94a3b8",
    lineHeight: 1.4,
  },

  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    flexWrap: "wrap",
  },
};