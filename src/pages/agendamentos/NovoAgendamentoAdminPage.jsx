import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import "./NovoAgendamentoAdminPage.css";

/* ============================= */
/* Utils                         */
/* ============================= */

function pad2(n) {
  return String(n).padStart(2, "0");
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function buildIso(dateStr, timeStr) {
  return `${dateStr}T${timeStr}:00`;
}

function toHHmm(timeStr) {
  if (!timeStr) return null;
  const s = String(timeStr);

  if (s.includes("T")) {
    const part = s.split("T")[1] || "";
    return part.slice(0, 5);
  }

  return s.slice(0, 5);
}

function generateSlots(horaEntrada, horaSaida, stepMinutes = 30) {
  const ini = toHHmm(horaEntrada) || "08:00";
  const fim = toHHmm(horaSaida) || "20:00";

  const [h1, m1] = ini.split(":").map(Number);
  const [h2, m2] = fim.split(":").map(Number);

  const start = h1 * 60 + m1;
  const end = h2 * 60 + m2;

  const slots = [];
  for (let t = start; t < end; t += stepMinutes) {
    slots.push(`${pad2(Math.floor(t / 60))}:${pad2(t % 60)}`);
  }

  return slots;
}

function normalizeDisponibilidade(data) {
  const entrada = data?.horaEntrada ?? null;
  const saida = data?.horaSaida ?? null;
  const duracao = Number(data?.duracaoMin ?? 30);

  const ocupadosRaw = Array.isArray(data?.ocupados) ? data.ocupados : [];
  const ocupados = ocupadosRaw
    .map((h) => toHHmm(h))
    .filter((h) => /^\d{2}:\d{2}$/.test(h));

  return {
    entrada,
    saida,
    duracao: Number.isFinite(duracao) && duracao > 0 ? duracao : 30,
    ocupados,
  };
}

function safeMsg(errOrAny) {
  if (!errOrAny) return "";
  if (typeof errOrAny === "string") return errOrAny;

  if (typeof errOrAny === "object") {
    return (
      errOrAny?.mensagem ||
      errOrAny?.message ||
      errOrAny?.erro ||
      errOrAny?.error ||
      "Erro inesperado."
    );
  }

  return "Erro inesperado.";
}

/* ============================= */
/* COMPONENTE                   */
/* ============================= */

export default function NovoAgendamentoAdminPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState("");

  const [clientes, setClientes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);

  const [clienteId, setClienteId] = useState("");
  const [servicoId, setServicoId] = useState("");
  const [barbeiroId, setBarbeiroId] = useState("");
  const [data, setData] = useState(todayStr());

  const [carregandoHorarios, setCarregandoHorarios] = useState(false);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const [horario, setHorario] = useState("");

  const [janela, setJanela] = useState({
    entrada: null,
    saida: null,
    duracao: 30,
    ocupados: [],
  });

  const grade = useMemo(
    () => generateSlots(janela.entrada, janela.saida, janela.duracao),
    [janela]
  );

  const disponiveisSet = useMemo(
    () => new Set(horariosDisponiveis),
    [horariosDisponiveis]
  );

  /* ============================= */
  /* Carregamento inicial         */
  /* ============================= */

  useEffect(() => {
    async function carregarListas() {
      try {
        setLoading(true);

        const [cRes, sRes, bRes] = await Promise.all([
          api.get("/clientes"),
          api.get("/servicos"),
          api.get("/barbeiros"),
        ]);

        setClientes(cRes.data || []);
        setServicos(sRes.data || []);
        setBarbeiros(bRes.data || []);
      } catch (e) {
        setErro(safeMsg(e?.response?.data));
      } finally {
        setLoading(false);
      }
    }

    carregarListas();
  }, []);

  /* ============================= */
  /* Disponibilidade              */
  /* ============================= */

  useEffect(() => {
    async function carregarDisponibilidade() {
      setHorario("");
      setHorariosDisponiveis([]);

      if (!barbeiroId || !data) return;

      try {
        setCarregandoHorarios(true);

        const res = await api.get("/agendamentos/disponibilidade", {
          params: { barbeiroId, data },
        });

        const info = normalizeDisponibilidade(res.data);
        setJanela(info);

        const slots = generateSlots(info.entrada, info.saida, info.duracao);
        const ocupadosSet = new Set(info.ocupados);

        const disponiveis = slots.filter((h) => !ocupadosSet.has(h));
        setHorariosDisponiveis(disponiveis);
      } catch (e) {
        setErro(safeMsg(e?.response?.data));
      } finally {
        setCarregandoHorarios(false);
      }
    }

    carregarDisponibilidade();
  }, [barbeiroId, data]);

  /* ============================= */
  /* Criar Agendamento            */
  /* ============================= */

  async function criarAgendamento(e) {
    e.preventDefault();
    setErro("");
    setOk("");

    if (!clienteId || !servicoId || !barbeiroId || !data || !horario) {
      setErro("Preencha todos os campos e selecione um horário.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/agendamentos", {
        clienteId: Number(clienteId),
        barbeiroId: Number(barbeiroId),
        servicoId: Number(servicoId),
        dataHora: buildIso(data, horario),
        observacao: "",
      });

      setOk("Agendamento criado com sucesso!");

      setTimeout(() => navigate("/agendamentos-admin"), 600);
    } catch (e) {
      setErro(safeMsg(e?.response?.data));
    } finally {
      setLoading(false);
    }
  }

  /* ============================= */
  /* Render                       */
  /* ============================= */

  return (
    <div className="admNovoA-wrap">
      <div className="admNovoA-top">
        <div>
          <h1 className="admNovoA-title">Novo Agendamento</h1>
          <div className="admNovoA-sub">
            Selecione cliente, serviço, barbeiro, data e horário.
          </div>
        </div>

        <div className="admNovoA-actions">
          <button className="btn" onClick={() => navigate("/agendamentos-admin")}>
            Voltar
          </button>
        </div>
      </div>

      {erro && <div className="alert">{erro}</div>}
      {ok && <div className="alert">{ok}</div>}

      <div className="card admNovoA-card">
        <form onSubmit={criarAgendamento} className="admNovoA-form">

          <div className="admNovoA-grid">
            <div>
              <label className="admNovoA-label">Cliente</label>
              <select className="input" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
                <option value="">Selecione...</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="admNovoA-label">Serviço</label>
              <select className="input" value={servicoId} onChange={(e) => setServicoId(e.target.value)}>
                <option value="">Selecione...</option>
                {servicos.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome} — {Number(s.preco || 0).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="admNovoA-label">Barbeiro</label>
              <select className="input" value={barbeiroId} onChange={(e) => setBarbeiroId(e.target.value)}>
                <option value="">Selecione...</option>
                {barbeiros.map((b) => (
                  <option key={b.id} value={b.id}>{b.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="admNovoA-label">Data</label>
              <input
                className="input"
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
            </div>
          </div>

          <div className="admNovoA-horarios">
            <h2 className="admNovoA-hTitle">Horários</h2>

            <div className="admNovoA-slots">
              {grade.map((h) => {
                const available = disponiveisSet.has(h);
                const selected = horario === h;

                return (
                  <button
                    key={h}
                    type="button"
                    className={`admNovoA-slot ${available ? "is-ok" : "is-blocked"} ${selected ? "is-selected" : ""}`}
                    disabled={!available}
                    onClick={() => setHorario(h)}
                  >
                    {h}
                  </button>
                );
              })}
            </div>

            <div className="admNovoA-footer">
              <button className="btn" type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Criar Agendamento"}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}