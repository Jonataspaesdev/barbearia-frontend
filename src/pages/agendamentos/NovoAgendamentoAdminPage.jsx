import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function toISODateLocal(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function isSunday(isoDate) {
  if (!isoDate) return false;
  const d = new Date(`${isoDate}T12:00:00`);
  return d.getDay() === 0;
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

export default function NovoAgendamentoAdminPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [clientes, setClientes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);
  const [slots, setSlots] = useState([]);

  const [clienteId, setClienteId] = useState("");
  const [servicoId, setServicoId] = useState("");
  const [barbeiroId, setBarbeiroId] = useState("");
  const [data, setData] = useState(toISODateLocal(new Date()));
  const [horario, setHorario] = useState("");
  const [observacao, setObservacao] = useState("");

  async function carregarDados() {
    try {
      setErro("");
      setLoading(true);

      const [cliRes, servRes, barbRes] = await Promise.all([
        api.get("/clientes"),
        api.get("/servicos"),
        api.get("/barbeiros"),
      ]);

      setClientes(Array.isArray(cliRes.data) ? cliRes.data : []);
      setServicos(Array.isArray(servRes.data) ? servRes.data : []);
      setBarbeiros(Array.isArray(barbRes.data) ? barbRes.data : []);
    } catch (e) {
      setErro(getErrMsg(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const servicoSelecionado = useMemo(() => {
    return servicos.find((s) => String(s.id) === String(servicoId)) || null;
  }, [servicos, servicoId]);

  const barbeiroSelecionado = useMemo(() => {
    return barbeiros.find((b) => String(b.id) === String(barbeiroId)) || null;
  }, [barbeiros, barbeiroId]);

  const clienteSelecionado = useMemo(() => {
    return clientes.find((c) => String(c.id) === String(clienteId)) || null;
  }, [clientes, clienteId]);

  async function carregarSlots() {
    if (!barbeiroId || !data) {
      setSlots([]);
      return;
    }

    if (isSunday(data)) {
      setSlots([]);
      return;
    }

    try {
      setSlotsLoading(true);
      setErro("");
      setHorario("");

      const resp = await api.get("/agendamentos/disponibilidade", {
        params: { barbeiroId, data },
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

      const start = new Date(`${data}T00:00:00`);
      start.setHours(eh, em, 0, 0);

      const end = new Date(`${data}T00:00:00`);
      end.setHours(sh, sm, 0, 0);

      const now = new Date();
      const isHoje = toISODateLocal(now) === data;

      const horarios = [];

      for (
        let t = new Date(start);
        t < end;
        t = new Date(t.getTime() + duracaoMin * 60_000)
      ) {
        const label = `${pad2(t.getHours())}:${pad2(t.getMinutes())}`;
        if (ocupados.has(label)) continue;
        if (isHoje && t.getTime() <= now.getTime()) continue;
        horarios.push(label);
      }

      setSlots(horarios);
    } catch (e) {
      setErro(getErrMsg(e));
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }

  useEffect(() => {
    carregarSlots();
  }, [barbeiroId, data]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!clienteId) return setErro("Selecione o cliente.");
    if (!servicoId) return setErro("Selecione o serviço.");
    if (!barbeiroId) return setErro("Selecione o barbeiro.");
    if (!data) return setErro("Selecione a data.");
    if (isSunday(data)) return setErro("Domingo fechado.");
    if (!horario) return setErro("Selecione o horário.");

    try {
      setErro("");
      setSucesso("");
      setLoading(true);

      const dataHora = `${data}T${horario}:00`;

      await api.post("/agendamentos", {
        clienteId: Number(clienteId),
        servicoId: Number(servicoId),
        barbeiroId: Number(barbeiroId),
        dataHora,
        observacao: observacao || "",
      });

      setSucesso("Agendamento criado com sucesso.");
      setTimeout(() => {
        navigate("/agendamentos-admin");
      }, 800);
    } catch (e) {
      setErro(getErrMsg(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px" }}>
      <div className="spread" style={{ gap: 12, marginBottom: 18 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28 }}>Novo Agendamento (Admin)</h1>
          <div style={{ marginTop: 8, color: "var(--muted)" }}>
            Cadastre um novo agendamento manualmente
          </div>
        </div>

        <button
          type="button"
          className="btn"
          onClick={() => navigate("/agendamentos-admin")}
          disabled={loading}
        >
          Voltar
        </button>
      </div>

      {erro ? <div className="alert error">{erro}</div> : null}
      {sucesso ? <div className="alert success">{sucesso}</div> : null}

      <form className="card" onSubmit={handleSubmit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))",
            gap: 16,
          }}
        >
          <div>
            <label style={labelStyle}>Cliente</label>
            <select
              className="input"
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              disabled={loading}
            >
              <option value="">Selecione</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Serviço</label>
            <select
              className="input"
              value={servicoId}
              onChange={(e) => setServicoId(e.target.value)}
              disabled={loading}
            >
              <option value="">Selecione</option>
              {servicos.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Barbeiro</label>
            <select
              className="input"
              value={barbeiroId}
              onChange={(e) => setBarbeiroId(e.target.value)}
              disabled={loading}
            >
              <option value="">Selecione</option>
              {barbeiros.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Data</label>
            <input
              className="input"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              disabled={loading}
            />
            {isSunday(data) ? (
              <div style={helperStyle}>Domingo fechado.</div>
            ) : null}
          </div>

          <div>
            <label style={labelStyle}>Horário</label>
            <select
              className="input"
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
              disabled={loading || slotsLoading || !barbeiroId || isSunday(data)}
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
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Observação</label>
            <textarea
              className="input"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              rows={4}
              disabled={loading}
              placeholder="Opcional"
              style={{ resize: "vertical", minHeight: 110 }}
            />
          </div>
        </div>

        <div
          className="card"
          style={{ marginTop: 18, padding: 14, background: "rgba(255,255,255,.02)" }}
        >
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>
            Resumo
          </div>
          <div style={{ lineHeight: 1.8 }}>
            <div><b>Cliente:</b> {clienteSelecionado?.nome || "-"}</div>
            <div><b>Serviço:</b> {servicoSelecionado?.nome || "-"}</div>
            <div><b>Barbeiro:</b> {barbeiroSelecionado?.nome || "-"}</div>
            <div><b>Data:</b> {data || "-"}</div>
            <div><b>Horário:</b> {horario || "-"}</div>
            <div>
              <b>Preço:</b>{" "}
              {Number(servicoSelecionado?.preco || 0).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>
          </div>
        </div>

        <div
          className="row"
          style={{ gap: 10, justifyContent: "flex-end", marginTop: 18, flexWrap: "wrap" }}
        >
          <button
            type="button"
            className="btn"
            onClick={() => navigate("/agendamentos-admin")}
            disabled={loading}
          >
            Cancelar
          </button>

          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? "Salvando..." : "Cadastrar agendamento"}
          </button>
        </div>
      </form>
    </div>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: 8,
  fontSize: 13,
  color: "var(--muted)",
};

const helperStyle = {
  marginTop: 6,
  fontSize: 12,
  color: "var(--muted)",
};