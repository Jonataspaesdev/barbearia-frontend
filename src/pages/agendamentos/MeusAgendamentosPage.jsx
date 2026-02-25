// src/pages/cliente/MeusAgendamentosPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

/* ✅ CONFIG GRÁTIS (WA.ME) */
const ADMIN_WA = "5561981854504";
const ENDERECO = "SRES Loja 121 - Cruzeiro Velho, Brasília - DF, 70640-515";
const ADMIN_PAINEL_URL = "https://barbearia-frontend-two.vercel.app/agendamentos-admin";

/* ===================== Utils ===================== */

function getClienteId() {
  const v = localStorage.getItem("clienteId");
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function toUpper(s) {
  return String(s || "").toUpperCase();
}

function formatarDataHoraBr(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function extrairMensagemErro(e) {
  const status = e?.response?.status;
  const data = e?.response?.data;

  if (status === 401) return "Sessão expirada. Faça login novamente.";
  if (status === 403) return "Acesso negado (403). Faça login como CLIENTE.";
  if (status === 404) return "Não encontrado (404). Recarregue a lista.";

  if (data?.mensagem) return String(data.mensagem);
  if (data?.erro) return String(data.erro);
  if (typeof data === "string" && data.trim()) return data;

  return "Erro ao executar ação. Veja o console.";
}

function podeCancelarStatus(status) {
  const s = toUpper(status);
  if (s.includes("CANCEL")) return false;
  if (s.includes("CONCL")) return false;
  if (s.includes("FINAL")) return false;
  return s.includes("AGEND") || s.includes("CONFIRM");
}

function buildWhatsUrl(phone, message) {
  const msg = encodeURIComponent(message || "");
  return `https://wa.me/${phone}?text=${msg}`;
}

function montarMsgWhats(a) {
  const dataHora = formatarDataHoraBr(a?.dataHora);
  const obs = String(a?.observacao || "").trim();
  const status = a?.status || "AGENDADO";

  return (
    `Olá! Vim pelo site e quero falar do meu agendamento:\n\n` +
    `🧾 *Agendamento:* #${a?.id ?? "-"}\n` +
    `📅 *Data/Hora:* ${dataHora}\n` +
    `✂️ *Serviço:* ${a?.servicoNome || a?.servicoId || "-"}\n` +
    `💈 *Barbeiro:* ${a?.barbeiroNome || a?.barbeiroId || "-"}\n` +
    `📍 *Endereço:* ${ENDERECO}\n` +
    (obs ? `📝 *Obs:* ${obs}\n` : "") +
    `📌 *Status:* ${status}\n\n` +
    `Qualquer alteração responda esta mensagem.\n` +
    `Painel admin: ${ADMIN_PAINEL_URL}`
  );
}

/* ===================== Styles (dark) ===================== */

const styles = {
  page: { padding: 20, maxWidth: 980, margin: "0 auto", color: "#fff" },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 14,
  },

  subtitle: { opacity: 0.75, fontSize: 13, marginTop: 6 },

  actions: { display: "flex", gap: 10, flexWrap: "wrap" },

  btn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 800,
  },
  btnPrimary: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.20)",
    background: "rgba(255,255,255,0.10)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 900,
  },
  btnDanger: {
    border: "1px solid rgba(255,107,107,0.55)",
    background: "rgba(255,107,107,0.10)",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 900,
  },
  btnDisabled: { opacity: 0.55, cursor: "not-allowed" },

  // ✅ novo botão WhatsApp
  btnWhats: {
    border: "1px solid rgba(37,211,102,0.55)",
    background: "rgba(37,211,102,0.12)",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 900,
    textDecoration: "none",
    display: "inline-block",
  },

  panel: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 14,
    background: "rgba(255,255,255,0.03)",
  },

  tabsRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 12,
  },
  tab: {
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.04)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 13,
    opacity: 0.8,
  },
  tabActive: {
    opacity: 1,
    borderColor: "rgba(255,255,255,0.28)",
    background: "rgba(255,255,255,0.08)",
  },

  msgOk: {
    background: "rgba(80,255,160,0.10)",
    border: "1px solid rgba(80,255,160,0.25)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  msgErr: {
    background: "rgba(255,80,80,0.10)",
    border: "1px solid rgba(255,80,80,0.35)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },

  list: { display: "grid", gap: 12 },

  card: {
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 14,
    padding: 14,
    background: "rgba(0,0,0,0.25)",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
  },

  badge: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    opacity: 0.95,
    fontWeight: 900,
  },

  badgeAg: {
    borderColor: "rgba(120,180,255,0.35)",
    background: "rgba(120,180,255,0.12)",
  },
  badgeConc: {
    borderColor: "rgba(80,255,160,0.25)",
    background: "rgba(80,255,160,0.10)",
  },
  badgeCanc: {
    borderColor: "rgba(255,107,107,0.35)",
    background: "rgba(255,107,107,0.10)",
  },

  infoGrid: { marginTop: 10, display: "grid", gap: 6, opacity: 0.92 },

  empty: {
    border: "1px dashed rgba(255,255,255,0.20)",
    padding: 16,
    borderRadius: 14,
    opacity: 0.9,
  },

  smallHint: { fontSize: 12, opacity: 0.7, marginTop: 6 },
};

function badgeVariant(status) {
  const s = toUpper(status);
  if (s.includes("CANCEL")) return styles.badgeCanc;
  if (s.includes("CONCL") || s.includes("FINAL")) return styles.badgeConc;
  return styles.badgeAg;
}

/* ===================== Page ===================== */

export default function MeusAgendamentosPage() {
  const navigate = useNavigate();
  const clienteId = useMemo(() => getClienteId(), []);

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [agendamentos, setAgendamentos] = useState([]);

  const [msgSucesso, setMsgSucesso] = useState("");
  const [msgErro, setMsgErro] = useState("");
  const [cancelandoId, setCancelandoId] = useState(null);

  const [tab, setTab] = useState("AGENDADOS"); // AGENDADOS | CONCLUIDOS | CANCELADOS | TODOS

  function limparMensagens() {
    setMsgSucesso("");
    setMsgErro("");
  }

  async function carregar() {
    setLoading(true);
    setErro("");
    limparMensagens();

    if (!clienteId) {
      setErro("Não achei seu clienteId. Faça login novamente como CLIENTE.");
      setAgendamentos([]);
      setLoading(false);
      return;
    }

    try {
      const resp = await api.get(`/agendamentos/cliente/${clienteId}`);
      setAgendamentos(Array.isArray(resp.data) ? resp.data : []);
    } catch (e) {
      console.error(e);
      setErro(extrairMensagemErro(e));
      setAgendamentos([]);
    } finally {
      setLoading(false);
    }
  }

  async function cancelarAgendamento(id, statusAtual) {
    limparMensagens();

    if (!podeCancelarStatus(statusAtual)) {
      setMsgErro("Este agendamento não pode mais ser cancelado pelo status atual.");
      return;
    }

    const ok = window.confirm("Tem certeza que deseja cancelar este agendamento?");
    if (!ok) return;

    try {
      setCancelandoId(id);
      await api.delete(`/agendamentos/${id}/cancelar`);
      setMsgSucesso("Agendamento cancelado com sucesso!");
      await carregar();
    } catch (e) {
      console.error(e);
      setMsgErro(extrairMensagemErro(e));
    } finally {
      setCancelandoId(null);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtrados = useMemo(() => {
    const list = Array.isArray(agendamentos) ? agendamentos : [];

    const statusMatch = (a) => {
      const s = toUpper(a?.status);
      if (tab === "TODOS") return true;
      if (tab === "AGENDADOS") return s.includes("AGEND") || s.includes("CONFIRM");
      if (tab === "CONCLUIDOS") return s.includes("CONCL") || s.includes("FINAL");
      if (tab === "CANCELADOS") return s.includes("CANCEL");
      return true;
    };

    return list
      .filter(statusMatch)
      .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime());
  }, [agendamentos, tab]);

  const contagem = useMemo(() => {
    const list = Array.isArray(agendamentos) ? agendamentos : [];
    const count = { ag: 0, conc: 0, canc: 0, total: list.length };

    list.forEach((a) => {
      const s = toUpper(a?.status);
      if (s.includes("CANCEL")) count.canc += 1;
      else if (s.includes("CONCL") || s.includes("FINAL")) count.conc += 1;
      else if (s.includes("AGEND") || s.includes("CONFIRM")) count.ag += 1;
    });

    return count;
  }, [agendamentos]);

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <div>
          <h2 style={{ margin: 0 }}>Meus Agendamentos</h2>
          <div style={styles.subtitle}>
            Cliente ID: <b>{clienteId ?? "-"}</b>
          </div>
        </div>

        <div style={styles.actions}>
          <button style={styles.btnPrimary} onClick={() => navigate("/agendamentos/novo")}>
            + Marcar horário
          </button>
          <button style={styles.btn} onClick={carregar} disabled={loading}>
            {loading ? "Carregando..." : "Recarregar"}
          </button>
        </div>
      </div>

      <div style={styles.panel}>
        {/* Tabs */}
        <div style={styles.tabsRow}>
          <button
            type="button"
            onClick={() => setTab("AGENDADOS")}
            style={{ ...styles.tab, ...(tab === "AGENDADOS" ? styles.tabActive : null) }}
          >
            Agendados ({contagem.ag})
          </button>

          <button
            type="button"
            onClick={() => setTab("CONCLUIDOS")}
            style={{ ...styles.tab, ...(tab === "CONCLUIDOS" ? styles.tabActive : null) }}
          >
            Concluídos ({contagem.conc})
          </button>

          <button
            type="button"
            onClick={() => setTab("CANCELADOS")}
            style={{ ...styles.tab, ...(tab === "CANCELADOS" ? styles.tabActive : null) }}
          >
            Cancelados ({contagem.canc})
          </button>

          <button
            type="button"
            onClick={() => setTab("TODOS")}
            style={{ ...styles.tab, ...(tab === "TODOS" ? styles.tabActive : null) }}
          >
            Todos ({contagem.total})
          </button>
        </div>

        {/* Mensagens */}
        {msgSucesso ? (
          <div style={styles.msgOk}>
            <b>Sucesso:</b> {msgSucesso}
          </div>
        ) : null}

        {msgErro ? (
          <div style={styles.msgErr}>
            <b>Ops:</b> {msgErro}
          </div>
        ) : null}

        {erro ? (
          <div style={styles.msgErr}>
            <b>Erro:</b> {erro}
          </div>
        ) : null}

        {/* Conteúdo */}
        {loading ? (
          <div style={{ padding: 12, opacity: 0.85 }}>Carregando...</div>
        ) : filtrados.length === 0 ? (
          <div style={styles.empty}>
            <div style={{ marginBottom: 10 }}>
              Nenhum agendamento encontrado para o filtro: <b>{tab}</b>.
            </div>
            <button style={styles.btnPrimary} onClick={() => navigate("/agendamentos/novo")}>
              Marcar horário
            </button>
            <div style={styles.smallHint}>Dica: troque as abas para ver outros status.</div>
          </div>
        ) : (
          <div style={styles.list}>
            {filtrados.map((a) => {
              const podeCancelar = podeCancelarStatus(a.status);
              const estaCancelandoEste = cancelandoId === a.id;

              const whatsUrl = buildWhatsUrl(ADMIN_WA, montarMsgWhats(a));

              return (
                <div key={a.id} style={styles.card}>
                  <div style={styles.cardTop}>
                    <div style={{ fontSize: 14, opacity: 0.92 }}>
                      <b>#{a.id}</b> • {formatarDataHoraBr(a.dataHora)}
                    </div>

                    <span style={{ ...styles.badge, ...badgeVariant(a.status) }}>
                      {a.status || "—"}
                    </span>
                  </div>

                  <div style={styles.infoGrid}>
                    <div>
                      <b>Serviço:</b> {a.servicoNome || a.servicoId || "-"}
                      {a.preco != null ? <span style={{ opacity: 0.75 }}> • R$ {a.preco}</span> : null}
                    </div>

                    <div>
                      <b>Barbeiro:</b> {a.barbeiroNome || a.barbeiroId || "-"}
                    </div>

                    {a.observacao ? (
                      <div>
                        <b>Obs:</b> {a.observacao}
                      </div>
                    ) : null}
                  </div>

                  <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {/* ✅ WhatsApp */}
                    <a
                      href={whatsUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={styles.btnWhats}
                      title="Abrir WhatsApp com mensagem pronta"
                    >
                      Falar no WhatsApp
                    </a>

                    {podeCancelar ? (
                      <button
                        type="button"
                        onClick={() => cancelarAgendamento(a.id, a.status)}
                        disabled={estaCancelandoEste}
                        style={{
                          ...styles.btnDanger,
                          ...(estaCancelandoEste ? styles.btnDisabled : null),
                        }}
                        title="Cancela o agendamento"
                      >
                        {estaCancelandoEste ? "Cancelando..." : "Cancelar"}
                      </button>
                    ) : (
                      <div style={{ fontSize: 12, opacity: 0.72 }}>
                        Não é possível cancelar com status: <b>{a.status || "—"}</b>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}