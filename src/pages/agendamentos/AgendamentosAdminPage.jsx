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
    return { background: "rgba(239,68,68,.15)", color: "#ef4444" };
  }
  if (s.includes("CONCLU")) {
    return { background: "rgba(34,197,94,.15)", color: "#22c55e" };
  }
  if (s.includes("AGEND")) {
    return { background: "rgba(59,130,246,.15)", color: "#3b82f6" };
  }
  return { background: "rgba(148,163,184,.18)", color: "var(--text)" };
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
      <div className="card" style={{ width: "min(760px, 100%)", padding: 16 }}>
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
        className={active ? "btn primary" : "btn"}
        onClick={() => setAba(id)}
        disabled={loading}
        style={{ padding: "10px 12px" }}
      >
        {label}
      </button>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
      <div className="spread" style={{ gap: 12, marginBottom: 18 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28 }}>Agendamentos (Admin)</h1>
          <div style={{ marginTop: 8, color: "var(--muted)" }}>
            Operação rápida: Compareceu • Remarcar • Cancelar
          </div>
        </div>

        <div
          className="row"
          style={{ gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}
        >
          <button
            className="btn"
            onClick={() => navigate("/agendamentos-admin/novo")}
            disabled={loading}
          >
            + Novo
          </button>
          <button className="btn" onClick={carregarTudo} disabled={loading}>
            {loading ? "Carregando..." : "Recarregar"}
          </button>
          <button className="btn" onClick={limparFiltros} disabled={loading}>
            Limpar filtros
          </button>
        </div>
      </div>

      {erro && <div className="alert error">{erro}</div>}

      <div className="row" style={{ gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <Tab id="AGENDADO" label="Agendados" />
        <Tab id="CONCLUIDO" label="Concluídos" />
        <Tab id="CANCELADO" label="Cancelados" />
        <Tab id="TODOS" label="Todos" />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
          gap: 16,
          marginBottom: 18,
        }}
      >
        <div className="card">
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Total</div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>{resumo.total}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Agendados</div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>{resumo.ag}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Concluídos</div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>{resumo.con}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Cancelados</div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>{resumo.can}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 13, color: "var(--muted)" }}>
            Faturamento (só CONCLUÍDOS)
          </div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>
            {resumo.fat.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </div>
          <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted)" }}>
            Ticket médio:{" "}
            {resumo.ticket.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))",
            gap: 16,
          }}
        >
          <input
            className="input"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />

          <select
            className="input"
            value={barbeiroId}
            onChange={(e) => setBarbeiroId(e.target.value)}
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
          />
        </div>
      </div>

      <div className="card" style={{ overflowX: "auto" }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ whiteSpace: "nowrap" }}>Data/Hora</th>
              <th>Cliente</th>
              <th>Serviço</th>
              <th>Barbeiro</th>
              <th style={{ whiteSpace: "nowrap" }}>Valor</th>
              <th>Status</th>
              <th style={{ whiteSpace: "nowrap" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((a) => {
              const st = clampStatus(a?.status);
              const finalizado = isFinal(a);

              return (
                <tr key={a.id}>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {formatDateTimeBR(a?.dataHora)}
                  </td>
                  <td>{a?.clienteNome || "-"}</td>
                  <td>{a?.servicoNome || "-"}</td>
                  <td>{a?.barbeiroNome || "-"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {Number(a?.preco || 0).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td>
                    <span
                      style={{
                        padding: "6px 12px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 700,
                        ...getStatusStyle(st),
                      }}
                    >
                      {st || "-"}
                    </span>
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                      <button
                        className="btn"
                        disabled={loading || finalizado}
                        onClick={() => marcarConcluido(a)}
                      >
                        ✅ Compareceu
                      </button>
                      <button
                        className="btn"
                        disabled={loading || finalizado}
                        onClick={() => abrirRemarcar(a)}
                      >
                        🔁 Remarcar
                      </button>
                      <button
                        className="btn"
                        disabled={loading || finalizado}
                        onClick={() => cancelarAgendamento(a)}
                      >
                        ❌ Cancelar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filtrados.length === 0 && !loading ? (
              <tr>
                <td colSpan={7} style={{ color: "var(--muted)" }}>
                  Nenhum agendamento encontrado.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
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
          <div
            className="row"
            style={{ gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}
          >
            <button
              className="btn"
              onClick={() => {
                setModalOpen(false);
                setAlvo(null);
                setModalErro("");
              }}
            >
              Cancelar
            </button>
            <button
              className="btn primary"
              onClick={confirmarRemarcacao}
              disabled={loading}
            >
              Confirmar remarcação
            </button>
          </div>
        }
      >
        {modalErro ? <div className="alert error">{modalErro}</div> : null}

        <div className="card" style={{ padding: 14 }}>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>
            Agendamento atual
          </div>
          <div style={{ marginTop: 6, fontWeight: 800 }}>
            {alvo?.clienteNome || "-"} • {alvo?.servicoNome || "-"}
          </div>
          <div style={{ marginTop: 4, fontSize: 13, color: "var(--muted)" }}>
            Barbeiro: <b>{alvo?.barbeiroNome || "-"}</b> • Data/Hora:{" "}
            <b>{formatDateTimeBR(alvo?.dataHora)}</b>
          </div>
        </div>

        <div
          className="row"
          style={{ gap: 10, flexWrap: "wrap", alignItems: "end", marginTop: 12 }}
        >
          <div style={{ minWidth: 220 }}>
            <label style={{ fontSize: 12, color: "var(--muted)" }}>
              Nova data
            </label>
            <input
              className="input"
              type="date"
              value={novaData}
              onChange={(e) => setNovaData(e.target.value)}
            />
            {isSunday(novaData) ? (
              <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted)" }}>
                Domingo fechado.
              </div>
            ) : null}
          </div>

          <div style={{ minWidth: 260, flex: "1 1 260px" }}>
            <label style={{ fontSize: 12, color: "var(--muted)" }}>
              Horário disponível
            </label>
            <select
              className="input"
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
            <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted)" }}>
              Usa /agendamentos/disponibilidade e bloqueia horários ocupados.
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}