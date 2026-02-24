import { useEffect, useMemo, useState } from "react";
import api from "../api/api";

function formatCurrency(v) {
  return Number(v || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function inicioDaSemana() {
  const hoje = new Date();
  const dia = hoje.getDay();
  const diff = hoje.getDate() - dia;
  return new Date(hoje.setDate(diff));
}

function inicioDoMes() {
  const hoje = new Date();
  return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
}

export default function Dashboard() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [periodo, setPeriodo] = useState("MES");

  async function carregar() {
    try {
      setLoading(true);
      const res = await api.get("/agendamentos");
      setAgendamentos(res.data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const dataInicio = useMemo(() => {
    return periodo === "SEMANA" ? inicioDaSemana() : inicioDoMes();
  }, [periodo]);

  const filtrados = useMemo(() => {
    return agendamentos.filter((a) => {
      if (!a.dataHora) return false;

      const data = new Date(a.dataHora);
      const concluido =
        String(a.status || "").toUpperCase() === "CONCLUIDO";

      return concluido && data >= dataInicio;
    });
  }, [agendamentos, dataInicio]);

  const totalFaturado = useMemo(() => {
    return filtrados.reduce(
      (acc, a) => acc + Number(a.preco || 0),
      0
    );
  }, [filtrados]);

  const totalAtendimentos = filtrados.length;

  const rankingBarbeiros = useMemo(() => {
    const mapa = {};

    filtrados.forEach((a) => {
      const nome = a.barbeiroNome || "Sem nome";

      if (!mapa[nome]) {
        mapa[nome] = { nome, total: 0, quantidade: 0 };
      }

      mapa[nome].total += Number(a.preco || 0);
      mapa[nome].quantidade += 1;
    });

    return Object.values(mapa).sort((a, b) => b.total - a.total);
  }, [filtrados]);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 30 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0 }}>Dashboard Gerencial</h1>
          <div style={{ color: "var(--muted)", marginTop: 6 }}>
            Visão financeira da barbearia
          </div>
        </div>

        <div>
          <select
            className="input"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
          >
            <option value="MES">Mês Atual</option>
            <option value="SEMANA">Últimos 7 Dias</option>
          </select>
        </div>
      </div>

      <div
        style={{
          marginTop: 30,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px,1fr))",
          gap: 20,
        }}
      >
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>
            Faturamento
          </div>
          <div style={{ fontSize: 30, fontWeight: 800 }}>
            {formatCurrency(totalFaturado)}
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>
            Atendimentos Concluídos
          </div>
          <div style={{ fontSize: 30, fontWeight: 800 }}>
            {totalAtendimentos}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 40, padding: 24 }}>
        <h3 style={{ marginTop: 0 }}>Ranking de Barbeiros</h3>

        {rankingBarbeiros.length === 0 ? (
          <div style={{ opacity: 0.7 }}>Nenhum atendimento no período.</div>
        ) : (
          rankingBarbeiros.map((b, index) => (
            <div
              key={b.nome}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px 0",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div>
                <strong>
                  #{index + 1} {b.nome}
                </strong>
                <div style={{ fontSize: 13, opacity: 0.7 }}>
                  {b.quantidade} atendimento(s)
                </div>
              </div>

              <div style={{ fontWeight: 700 }}>
                {formatCurrency(b.total)}
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: 30 }}>
        <button className="btn" onClick={carregar} disabled={loading}>
          {loading ? "Atualizando..." : "Atualizar Dados"}
        </button>
      </div>
    </div>
  );
}