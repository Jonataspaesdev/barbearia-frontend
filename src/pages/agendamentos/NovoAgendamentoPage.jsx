import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

function getClienteId() {
  const v = localStorage.getItem("clienteId");
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function extrairMensagemErro(err) {
  const status = err?.response?.status;
  const data = err?.response?.data;

  if (data) {
    if (typeof data.mensagem === "object" && data.mensagem !== null) {
      const msgs = Object.entries(data.mensagem)
        .map(([campo, msg]) => `${campo}: ${msg}`)
        .join(" | ");
      return `(${status}) ${data.erro || "Erro"}: ${msgs}`;
    }

    if (typeof data.mensagem === "string") {
      return `(${status}) ${data.erro || "Erro"}: ${data.mensagem}`;
    }

    if (data.erro) return `(${status}) ${data.erro}`;
    if (data.message) return `(${status}) ${data.message}`;
  }

  if (status) return `(${status}) Erro ao criar agendamento.`;
  return "Erro ao criar agendamento.";
}

function isDataHoraNoFuturo(data, hora) {
  if (!data || !hora) return true;
  const dt = new Date(`${data}T${hora}:00`);
  if (Number.isNaN(dt.getTime())) return true;
  return dt.getTime() > Date.now();
}

function formatBRL(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function NovoAgendamentoPage() {
  const navigate = useNavigate();
  const clienteId = getClienteId();

  const [data, setData] = useState("");
  const [hora, setHora] = useState("");

  // serviços
  const [servicos, setServicos] = useState([]);
  const [servicoId, setServicoId] = useState("");
  const [loadingServicos, setLoadingServicos] = useState(true);

  // barbeiros (SELECT)
  const [barbeiros, setBarbeiros] = useState([]);
  const [barbeiroId, setBarbeiroId] = useState(
    localStorage.getItem("barbeiroIdPadrao") || ""
  );
  const [loadingBarbeiros, setLoadingBarbeiros] = useState(true);

  const [observacao, setObservacao] = useState("");

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const dataHoraOk = useMemo(
    () => isDataHoraNoFuturo(data, hora),
    [data, hora]
  );

  // ✅ Lista somente serviços ATIVOS (cliente não vê inativos)
  const servicosAtivos = useMemo(() => {
    const lista = Array.isArray(servicos) ? servicos : [];
    return lista.filter((s) => s?.ativo === true);
  }, [servicos]);

  useEffect(() => {
    if (!clienteId) {
      setErro("Não achei seu clienteId. Faça login novamente como CLIENTE.");
    }
  }, [clienteId]);

  // Carrega serviços (GET /servicos)
  useEffect(() => {
    async function carregarServicos() {
      setLoadingServicos(true);
      try {
        const resp = await api.get("/servicos");
        const lista = Array.isArray(resp.data) ? resp.data : [];
        setServicos(lista);
      } catch (e) {
        console.error(e);
        setErro("Não consegui carregar os serviços (GET /servicos).");
        setServicos([]);
      } finally {
        setLoadingServicos(false);
      }
    }

    carregarServicos();
  }, []);

  // ✅ Se ainda não tem serviço selecionado, escolhe o primeiro ATIVO
  // ✅ Se o selecionado ficou INATIVO, troca automaticamente para o primeiro ATIVO
  useEffect(() => {
    if (loadingServicos) return;

    if (!servicosAtivos.length) {
      setServicoId("");
      return;
    }

    // se não tem serviço selecionado, seta o primeiro ativo
    if (!servicoId) {
      const primeiroId = servicosAtivos[0]?.id;
      if (primeiroId != null) setServicoId(String(primeiroId));
      return;
    }

    // se tem selecionado, mas ele não está mais na lista de ativos, corrige
    const aindaAtivo = servicosAtivos.some((s) => String(s.id) === String(servicoId));
    if (!aindaAtivo) {
      const primeiroId = servicosAtivos[0]?.id;
      setServicoId(primeiroId != null ? String(primeiroId) : "");
    }
  }, [loadingServicos, servicosAtivos, servicoId]);

  // Carrega barbeiros (GET /barbeiros)
  useEffect(() => {
    async function carregarBarbeiros() {
      setLoadingBarbeiros(true);
      try {
        const resp = await api.get("/barbeiros");
        const lista = Array.isArray(resp.data) ? resp.data : [];
        setBarbeiros(lista);

        // Se não tem barbeiro salvo, seleciona o primeiro
        if (!barbeiroId && lista.length > 0) {
          const primeiroId = lista[0]?.id;
          if (primeiroId != null) setBarbeiroId(String(primeiroId));
        }
      } catch (e) {
        console.error(e);
        setErro("Não consegui carregar os barbeiros (GET /barbeiros).");
        setBarbeiros([]);
      } finally {
        setLoadingBarbeiros(false);
      }
    }

    carregarBarbeiros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(e) {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (!clienteId) return setErro("Sem clienteId. Faça login novamente.");
    if (!data || !hora) return setErro("Preencha data e hora.");
    if (!dataHoraOk) return setErro("Escolha uma data/hora no FUTURO.");
    if (!servicoId) return setErro("Selecione um serviço.");
    if (!barbeiroId) return setErro("Selecione um barbeiro.");

    // ✅ segurança extra: impede enviar serviço inativo
    const servicoSelecionado = servicosAtivos.find(
      (s) => String(s.id) === String(servicoId)
    );
    if (!servicoSelecionado) {
      return setErro("Esse serviço não está mais disponível. Selecione outro.");
    }

    const dataHora = `${data}T${hora}:00`;

    const payload = {
      clienteId: Number(clienteId),
      barbeiroId: Number(barbeiroId),
      servicoId: Number(servicoId),
      dataHora,
      observacao: observacao || null,
    };

    setLoading(true);
    try {
      await api.post("/agendamentos", payload);

      // guarda barbeiro escolhido como padrão
      localStorage.setItem("barbeiroIdPadrao", String(barbeiroId));

      setSucesso("Agendamento criado! Indo para Meus Agendamentos...");
      setTimeout(() => navigate("/agendamentos"), 800);
    } catch (e2) {
      console.error("ERRO POST /agendamentos:", e2?.response?.data || e2);
      setErro(extrairMensagemErro(e2));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 760, margin: "0 auto" }}>
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Marcar Horário</h2>
        <div style={{ opacity: 0.8, fontSize: 13 }}>
          Cliente ID: <b>{clienteId ?? "-"}</b>
        </div>
      </div>

      <form
        onSubmit={submit}
        style={{
          display: "grid",
          gap: 12,
          padding: 16,
          border: "1px solid #2d2d2d",
          borderRadius: 12,
          background: "#151515",
        }}
      >
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <label style={{ display: "grid", gap: 6 }}>
            Data:
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              style={{ width: 220 }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            Hora:
            <input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              style={{ width: 220 }}
            />
          </label>
        </div>

        <label style={{ display: "grid", gap: 6 }}>
          Serviço:
          {loadingServicos ? (
            <div style={{ padding: "6px 0" }}>Carregando serviços...</div>
          ) : servicosAtivos.length === 0 ? (
            <div style={{ padding: "6px 0" }}>
              Nenhum serviço ATIVO disponível no momento.
            </div>
          ) : (
            <select
              value={servicoId}
              onChange={(e) => setServicoId(e.target.value)}
              style={{ maxWidth: 520 }}
            >
              {servicosAtivos.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome} {s.preco != null ? `- ${formatBRL(s.preco)}` : ""}
                </option>
              ))}
            </select>
          )}
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          Barbeiro:
          {loadingBarbeiros ? (
            <div style={{ padding: "6px 0" }}>Carregando barbeiros...</div>
          ) : barbeiros.length === 0 ? (
            <div style={{ padding: "6px 0" }}>
              Nenhum barbeiro encontrado. Cadastre no backend primeiro.
            </div>
          ) : (
            <select
              value={barbeiroId}
              onChange={(e) => setBarbeiroId(e.target.value)}
              style={{ maxWidth: 520 }}
            >
              {barbeiros.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nome}
                </option>
              ))}
            </select>
          )}
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          Observação:
          <input
            type="text"
            placeholder="Opcional"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            style={{ maxWidth: 520 }}
          />
        </label>

        {!dataHoraOk && data && hora && (
          <div
            style={{
              background: "#2a1d1d",
              border: "1px solid #5a2b2b",
              padding: 10,
              borderRadius: 10,
            }}
          >
            ⚠️ A data/hora escolhida está no passado. Escolha um horário futuro.
          </div>
        )}

        {erro && (
          <div
            style={{
              background: "#ffe5e5",
              border: "1px solid #ffb3b3",
              padding: 12,
              borderRadius: 10,
            }}
          >
            <b>Erro:</b> {erro}
          </div>
        )}

        {sucesso && (
          <div
            style={{
              background: "#e7ffe5",
              border: "1px solid #b8ffb3",
              padding: 12,
              borderRadius: 10,
            }}
          >
            {sucesso}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" onClick={() => navigate("/agendamentos")}>
            Voltar
          </button>

          <button
            type="submit"
            disabled={
              loading || loadingServicos || loadingBarbeiros || !dataHoraOk || !servicosAtivos.length
            }
          >
            {loading ? "Salvando..." : "Agendar"}
          </button>
        </div>
      </form>
    </div>
  );
}