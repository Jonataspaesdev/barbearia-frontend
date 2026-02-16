import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

function getClienteId() {
  const v = localStorage.getItem("clienteId");
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function formatarDataHoraBr(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function badgeStyle(status) {
  const base = {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: 999,
    fontSize: 12,
    border: "1px solid #333",
  };

  const s = String(status || "").toUpperCase();

  if (s.includes("CANCEL")) return { ...base, background: "#3a1f1f" };
  if (s.includes("FINAL")) return { ...base, background: "#1f3a22" };
  if (s.includes("AGEND")) return { ...base, background: "#1f2f3a" };

  return { ...base, background: "#2a2a2a" };
}

export default function MeusAgendamentosPage() {
  const navigate = useNavigate();
  const clienteId = getClienteId();

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [agendamentos, setAgendamentos] = useState([]);

  async function carregar() {
    setLoading(true);
    setErro("");

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
      const status = e?.response?.status;
      const data = e?.response?.data;

      if (status === 403) {
        setErro(
          "Acesso negado (403). Esse clienteId não bate com o seu token. Faça login novamente."
        );
      } else if (data?.mensagem) {
        setErro(String(data.mensagem));
      } else if (data?.erro) {
        setErro(String(data.erro));
      } else {
        setErro("Erro ao carregar seus agendamentos. Veja o console.");
      }

      console.error(e);
      setAgendamentos([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Meus Agendamentos</h2>
          <div style={{ opacity: 0.8, fontSize: 13 }}>
            Cliente ID: <b>{clienteId ?? "-"}</b>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => navigate("/agendamentos/novo")}>
            + Marcar horário
          </button>
          <button onClick={carregar} disabled={loading}>
            {loading ? "Carregando..." : "Recarregar"}
          </button>
        </div>
      </div>

      {erro && (
        <div
          style={{
            background: "#ffe5e5",
            border: "1px solid #ffb3b3",
            padding: 12,
            borderRadius: 10,
            marginBottom: 12,
          }}
        >
          <b>Erro:</b> {erro}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 12 }}>Carregando...</div>
      ) : agendamentos.length === 0 ? (
        <div
          style={{
            border: "1px dashed #444",
            padding: 16,
            borderRadius: 12,
            opacity: 0.9,
          }}
        >
          <div style={{ marginBottom: 10 }}>Você ainda não tem agendamentos.</div>
          <button onClick={() => navigate("/agendamentos/novo")}>
            Marcar meu primeiro horário
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {agendamentos.map((a) => (
            <div
              key={a.id}
              style={{
                border: "1px solid #2d2d2d",
                borderRadius: 12,
                padding: 14,
                background: "#151515",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <div style={{ fontSize: 14, opacity: 0.9 }}>
                  <b>#{a.id}</b> • {formatarDataHoraBr(a.dataHora)}
                </div>
                <span style={badgeStyle(a.status)}>{a.status || "—"}</span>
              </div>

              <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
                <div>
                  <b>Serviço:</b>{" "}
                  {a.servicoNome ? (
                    <>
                      {a.servicoNome}
                      {a.preco != null ? ` • R$ ${a.preco}` : ""}
                    </>
                  ) : (
                    a.servicoId ?? "-"
                  )}
                </div>

                <div>
                  <b>Barbeiro:</b> {a.barbeiroNome || a.barbeiroId || "-"}
                </div>

                {a.observacao && (
                  <div>
                    <b>Obs:</b> {a.observacao}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}