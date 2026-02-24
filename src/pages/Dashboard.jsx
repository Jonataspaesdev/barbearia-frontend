import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

/* ================= UTIL ================= */

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

function ultimos7Dias() {
  const dias = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dias.push({
      data: d.toISOString().slice(0, 10),
      label: `${d.getDate()}/${d.getMonth() + 1}`,
    });
  }
  return dias;
}

/* ================= COMPONENT ================= */

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

  /* ================= MÉTRICAS ================= */

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

  const taxaComparecimento = useMemo(() => {
    const totalMes = agendamentos.filter((a) =>
      dentroDoMesAtual(a.dataHora)
    ).length;

    if (!totalMes) return 0;

    return Math.round((concluidosMes / totalMes) * 100);
  }, [agendamentos, concluidosMes]);

  /* ================= GRÁFICO ================= */

  const dadosGrafico = useMemo(() => {
    const dias = ultimos7Dias();

    return dias.map((dia) => {
      const total = agendamentos
        .filter(
          (a) =>
            a.dataHora?.slice(0, 10) === dia.data &&
            String(a.status).toUpperCase() === "CONCLUIDO"
        )
        .reduce((acc, a) => acc + Number(a.preco || 0), 0);

      return {
        name: dia.label,
        faturamento: total,
      };
    });
  }, [agendamentos]);

  /* ================= UI ================= */

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Dashboard</h1>
        <div style={{ marginTop: 8, color: "var(--muted)" }}>
          Visão geral da barbearia
        </div>
      </div>

      {erro && <div className="alert">{erro}</div>}

      {/* CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
          gap: 20,
        }}
      >
        <Card title="Agendamentos Hoje" value={hoje} />
        <Card title="Clientes" value={clientes.length} />
        <Card title="Barbeiros" value={barbeiros.length} />
        <Card title="Serviços" value={servicos.length} />
        <Card title="Faturamento do Mês" value={formatCurrency(faturamentoMes)} />
        <Card title="Taxa de Comparecimento" value={`${taxaComparecimento}%`} />
      </div>

      {/* GRÁFICO */}
      <div className="card" style={{ marginTop: 40, padding: 24 }}>
        <h3 style={{ marginTop: 0 }}>Faturamento últimos 7 dias</h3>

        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={dadosGrafico}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Line
                type="monotone"
                dataKey="faturamento"
                stroke="#3b82f6"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ marginTop: 30 }}>
        <button className="btn" onClick={carregar} disabled={loading}>
          {loading ? "Atualizando..." : "Atualizar Dados"}
        </button>
      </div>
    </div>
  );
}

/* ================= CARD COMPONENT ================= */

function Card({ title, value }) {
  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ fontSize: 13, color: "var(--muted)" }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 800 }}>{value}</div>
    </div>
  );
}