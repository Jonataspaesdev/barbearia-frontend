import { useEffect, useMemo, useState } from "react";
import api from "../api/api";

function formatCurrency(v) {
  return Number(v || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function isHoje(data) {
  const hoje = new Date();
  const d = new Date(data);
  return (
    d.getDate() === hoje.getDate() &&
    d.getMonth() === hoje.getMonth() &&
    d.getFullYear() === hoje.getFullYear()
  );
}

function dentroDoMesAtual(data) {
  const hoje = new Date();
  const d = new Date(data);
  return (
    d.getMonth() === hoje.getMonth() &&
    d.getFullYear() === hoje.getFullYear()
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);
  const [servicos, setServicos] = useState([]);

  async function carregar() {
    try {
      setErro("");
      setLoading(true);

      const [ag, c, b, s] = await Promise.all([
        api.get("/agendamentos"),
        api.get("/clientes"),
        api.get("/barbeiros"),
        api.get("/servicos"),
      ]);

      setAgendamentos(ag.data || []);
      setClientes(c.data || []);
      setBarbeiros(b.data || []);
      setServicos(s.data || []);
    } catch {
      setErro("Erro ao carregar dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const hoje = useMemo(
    () => agendamentos.filter((a) => isHoje(a.dataHora)).length,
    [agendamentos]
  );

  const faturamentoMes = useMemo(() => {
    return agendamentos
      .filter((a) => dentroDoMesAtual(a.dataHora))
      .filter((a) => String(a.status).toUpperCase() === "CONCLUIDO")
      .reduce((acc, a) => acc + Number(a.preco || 0), 0);
  }, [agendamentos]);

  const concluidosMes = useMemo(() => {
    return agendamentos.filter(
      (a) =>
        dentroDoMesAtual(a.dataHora) &&
        String(a.status).toUpperCase() === "CONCLUIDO"
    ).length;
  }, [agendamentos]);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Dashboard</h1>
        <div style={{ marginTop: 8, color: "var(--muted)" }}>
          Visão geral da barbearia
        </div>
      </div>

      {erro && <div className="alert">{erro}</div>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
          gap: 20,
        }}
      >
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>
            Agendamentos Hoje
          </div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{hoje}</div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>
            Total de Clientes
          </div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            {clientes.length}
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>
            Serviços Ativos
          </div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            {servicos.length}
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>
            Barbeiros
          </div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            {barbeiros.length}
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>
            Faturamento do Mês
          </div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            {formatCurrency(faturamentoMes)}
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>
            Atendimentos Concluídos (Mês)
          </div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            {concluidosMes}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 40 }}>
        <button className="btn" onClick={carregar} disabled={loading}>
          {loading ? "Atualizando..." : "Atualizar Dados"}
        </button>
      </div>
    </div>
  );
}