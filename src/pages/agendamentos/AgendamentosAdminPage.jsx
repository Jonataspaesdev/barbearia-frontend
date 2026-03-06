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

  if (s.includes("CANCEL"))
    return { background: "rgba(239,68,68,.15)", color: "#ef4444" };

  if (s.includes("CONCLU"))
    return { background: "rgba(34,197,94,.15)", color: "#22c55e" };

  if (s.includes("AGEND"))
    return { background: "rgba(59,130,246,.15)", color: "#3b82f6" };

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
      setErro(getErrMsg(e));
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

      if (barbeiroId && String(a?.barbeiroId ?? "") !== String(barbeiroId))
        return false;

      if (servicoId && String(a?.servicoId ?? "") !== String(servicoId))
        return false;

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

    const ok = window.confirm("Marcar como CONCLUÍDO?");

    if (!ok) return;

    try {
      setLoading(true);

      await api.put(`/agendamentos/${id}`, {
        status: "CONCLUIDO",
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

    const ok = window.confirm("Cancelar este agendamento?");

    if (!ok) return;

    try {
      setLoading(true);

      await api.put(`/agendamentos/${id}`, {
        status: "CANCELADO",
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
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
      <h1>Agendamentos</h1>

      {erro && <div className="alert error">{erro}</div>}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <button
          className="btn"
          onClick={() => navigate("/agendamentos-admin/novo")}
        >
          + Novo
        </button>

        <button className="btn" onClick={carregarTudo}>
          Recarregar
        </button>

        <button className="btn" onClick={limparFiltros}>
          Limpar filtros
        </button>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <input
          className="input"
          placeholder="Buscar..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {filtrados.map((a) => (
          <div key={a.id} className="card" style={{ padding: 20 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
              }}
            >
              <b>{a?.clienteNome}</b>

              <span>{formatDateTimeBR(a?.dataHora)}</span>
            </div>

            <div style={{ marginTop: 10 }}>
              <div>
                <b>Barbeiro:</b> {a?.barbeiroNome}
              </div>

              <div>
                <b>Serviço:</b> {a?.servicoNome}
              </div>

              <div>
                <b>Preço:</b> R$ {a?.preco}
              </div>

              <div style={{ marginTop: 6 }}>
                <span
                  style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    fontWeight: 700,
                    fontSize: 12,
                    ...getStatusStyle(a?.status),
                  }}
                >
                  {a?.status}
                </span>
              </div>
            </div>

            <div
              style={{
                marginTop: 14,
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <button
                className="btn"
                disabled={loading || isFinal(a)}
                onClick={() => marcarConcluido(a)}
              >
                Compareceu
              </button>

              <button
                className="btn"
                disabled={loading || isFinal(a)}
                onClick={() =>
                  navigate(`/agendamentos-admin/editar/${a.id}`)
                }
              >
                Remarcar
              </button>

              <button
                className="btn"
                disabled={loading || isFinal(a)}
                style={{
                  background: "#ef4444",
                  borderColor: "#ef4444",
                  color: "#fff",
                }}
                onClick={() => cancelarAgendamento(a)}
              >
                Cancelar
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtrados.length === 0 && !loading && (
        <p style={{ marginTop: 20 }}>Nenhum agendamento encontrado.</p>
      )}
    </div>
  );
}