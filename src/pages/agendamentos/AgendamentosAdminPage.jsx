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

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function normalize(v) {
  return String(v || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function currencyBRL(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function getStatusStyle(status) {
  const s = String(status || "").toUpperCase();

  if (s.includes("CANCEL"))
    return { background: "#2a1111", color: "#f87171" };

  if (s.includes("CONCLU"))
    return { background: "#0f2a1a", color: "#4ade80" };

  if (s.includes("AGEND"))
    return { background: "#0e2238", color: "#60a5fa" };

  return { background: "#1f2937", color: "#e5e7eb" };
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
      setLoading(true);

      const [agRes, barbRes, servRes] = await Promise.all([
        api.get("/agendamentos"),
        api.get("/barbeiros"),
        api.get("/servicos"),
      ]);

      setAgendamentos(agRes.data || []);
      setBarbeiros(barbRes.data || []);
      setServicos(servRes.data || []);
    } catch {
      setErro("Erro ao carregar dados.");
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
      if (status && a.status !== status) return false;

      if (data) {
        const iso = new Date(a.dataHora).toISOString().slice(0, 10);
        if (iso !== data) return false;
      }

      if (barbeiroId && String(a.barbeiroId) !== String(barbeiroId))
        return false;

      if (servicoId && String(a.servicoId) !== String(servicoId))
        return false;

      if (q) {
        const texto = normalize(
          `${a.clienteNome} ${a.barbeiroNome} ${a.servicoNome}`
        );

        if (!texto.includes(q)) return false;
      }

      return true;
    });
  }, [agendamentos, status, data, barbeiroId, servicoId, busca]);

  const total = filtrados.length;

  const faturamento = useMemo(() => {
    return filtrados.reduce((acc, a) => {
      if (isCancelado(a.status)) return acc;
      return acc + Number(a.preco || 0);
    }, 0);
  }, [filtrados]);

  function isFinal(a) {
    const s = String(a.status).toUpperCase();
    return s.includes("CONCLU") || s.includes("CANCEL");
  }

  async function marcarConcluido(a) {
    if (!window.confirm("Confirmar presença do cliente?")) return;

    await api.put(`/agendamentos/${a.id}`, {
      status: "CONCLUIDO",
    });

    carregarTudo();
  }

  async function cancelarAgendamento(a) {
    if (!window.confirm("Cancelar agendamento?")) return;

    await api.put(`/agendamentos/${a.id}`, {
      status: "CANCELADO",
    });

    carregarTudo();
  }

  function abrirModalRemarcar(a) {
    setAgendamentoEditando(a);
    setNovaDataHora(toDateInputValue(a.dataHora));
    setNovaObservacao(a.observacao || "");
    setModalRemarcarAberto(true);
  }

  async function salvarRemarcacao() {
    await api.put(`/agendamentos/${agendamentoEditando.id}`, {
      status: "AGENDADO",
      dataHora: new Date(novaDataHora).toISOString(),
      observacao: novaObservacao,
    });

    setModalRemarcarAberto(false);
    carregarTudo();
  }

  return (
    <div
      style={{
        maxWidth: 1300,
        margin: "0 auto",
        padding: 20,
        background: "#0f172a",
        minHeight: "100vh",
        color: "#e5e7eb",
      }}
    >
      <h1 style={{ marginBottom: 20 }}>Agendamentos</h1>

      {erro && <div>{erro}</div>}

      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <button
          className="btn"
          onClick={() => navigate("/agendamentos-admin/novo")}
        >
          Novo
        </button>

        <button className="btn" onClick={carregarTudo}>
          Atualizar
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <b>Total:</b> {total} | <b>Faturamento:</b> {currencyBRL(faturamento)}
      </div>

      <div
        style={{
          background: "#111827",
          borderRadius: 12,
          overflow: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: 900,
          }}
        >
          <thead style={{ background: "#1f2937" }}>
            <tr>
              <th style={th}>Cliente</th>
              <th style={th}>Data</th>
              <th style={th}>Barbeiro</th>
              <th style={th}>Serviço</th>
              <th style={th}>Preço</th>
              <th style={th}>Status</th>
              <th style={th}>Ações</th>
            </tr>
          </thead>

          <tbody>
            {filtrados.map((a) => (
              <tr key={a.id}>
                <td style={td}>{a.clienteNome}</td>
                <td style={td}>{formatDateTimeBR(a.dataHora)}</td>
                <td style={td}>{a.barbeiroNome}</td>
                <td style={td}>{a.servicoNome}</td>
                <td style={td}>{currencyBRL(a.preco)}</td>

                <td style={td}>
                  <span
                    style={{
                      padding: "5px 10px",
                      borderRadius: 20,
                      ...getStatusStyle(a.status),
                    }}
                  >
                    {a.status}
                  </span>
                </td>

                <td style={td}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button
                      disabled={isFinal(a)}
                      onClick={() => marcarConcluido(a)}
                    >
                      Compareceu
                    </button>

                    <button
                      disabled={isFinal(a)}
                      onClick={() => abrirModalRemarcar(a)}
                    >
                      Remarcar
                    </button>

                    <button
                      disabled={isFinal(a)}
                      onClick={() => cancelarAgendamento(a)}
                    >
                      Cancelar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalRemarcarAberto && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#111827",
              padding: 20,
              borderRadius: 12,
              width: 400,
            }}
          >
            <h3>Remarcar</h3>

            <input
              type="datetime-local"
              value={novaDataHora}
              onChange={(e) => setNovaDataHora(e.target.value)}
            />

            <textarea
              value={novaObservacao}
              onChange={(e) => setNovaObservacao(e.target.value)}
            />

            <div style={{ marginTop: 10 }}>
              <button onClick={salvarRemarcacao}>Salvar</button>
              <button onClick={() => setModalRemarcarAberto(false)}>
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

const th = {
  textAlign: "left",
  padding: 12,
};

const td = {
  padding: 12,
};