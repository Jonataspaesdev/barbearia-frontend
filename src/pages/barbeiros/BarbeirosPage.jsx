import { useEffect, useMemo, useState } from "react";
import api from "../../api/api";

/* ================= UTIL ================= */

function getErrorMessage(err) {
  const data = err?.response?.data;
  if (!data) return "Ocorreu um erro. Tente novamente.";
  if (typeof data === "string") return data;
  if (data.mensagem) return data.mensagem;
  if (data.message) return data.message;
  return "Ocorreu um erro. Tente novamente.";
}

function isValidHHMM(v) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v || "");
}

function toHHMM(v) {
  if (!v) return "";
  if (typeof v === "string") return v.slice(0, 5);
  return "";
}

/* ================= COMPONENT ================= */

export default function BarbeirosPage() {
  const [barbeiros, setBarbeiros] = useState([]);
  const [servicos, setServicos] = useState([]);

  const [loadingLista, setLoadingLista] = useState(false);
  const [loadingServicos, setLoadingServicos] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [alert, setAlert] = useState({ type: "", text: "" });

  const [form, setForm] = useState({
    id: null,
    nome: "",
    email: "",
    telefone: "",
    horaEntrada: "",
    horaSaida: "",
    servicoIds: [],
  });

  const [useTextTime, setUseTextTime] = useState(false);

  useEffect(() => {
    const i = document.createElement("input");
    i.type = "time";
    if (i.type !== "time") setUseTextTime(true);
  }, []);

  const editando = !!form.id;

  const servicosAtivos = useMemo(() => {
    return (servicos || []).filter((s) => s?.ativo === true);
  }, [servicos]);

  async function carregarBarbeiros() {
    try {
      setLoadingLista(true);
      setAlert({ type: "", text: "" });
      const response = await api.get("/barbeiros");
      setBarbeiros(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setAlert({ type: "error", text: "Erro ao carregar barbeiros: " + getErrorMessage(err) });
    } finally {
      setLoadingLista(false);
    }
  }

  async function carregarServicos() {
    try {
      setLoadingServicos(true);
      const response = await api.get("/servicos");
      setServicos(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setAlert({ type: "error", text: "Erro ao carregar serviços: " + getErrorMessage(err) });
    } finally {
      setLoadingServicos(false);
    }
  }

  async function carregarTudo() {
    await Promise.all([carregarBarbeiros(), carregarServicos()]);
  }

  useEffect(() => {
    carregarTudo();
  }, []);

  function limparForm() {
    setForm({
      id: null,
      nome: "",
      email: "",
      telefone: "",
      horaEntrada: "",
      horaSaida: "",
      servicoIds: [],
    });
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function toggleServico(id) {
    setForm((prev) => {
      const existe = prev.servicoIds.includes(id);
      const novo = existe ? prev.servicoIds.filter((x) => x !== id) : [...prev.servicoIds, id];
      return { ...prev, servicoIds: novo };
    });
  }

  async function salvar(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setAlert({ type: "", text: "" });

      if (!form.nome.trim())
        return setAlert({ type: "error", text: "Informe o nome do barbeiro." });

      if (!form.email.trim())
        return setAlert({ type: "error", text: "Informe o email do barbeiro." });

      if (!form.telefone.trim())
        return setAlert({ type: "error", text: "Informe o telefone do barbeiro." });

      if (!isValidHHMM(form.horaEntrada) || !isValidHHMM(form.horaSaida))
        return setAlert({ type: "error", text: "Hora inválida. Use HH:MM." });

      if (!form.servicoIds.length)
        return setAlert({ type: "error", text: "Selecione pelo menos 1 serviço ativo." });

      const payload = {
        nome: form.nome.trim(),
        email: form.email.trim(),
        telefone: form.telefone.trim(),
        horaEntrada: form.horaEntrada,
        horaSaida: form.horaSaida,
        servicoIds: form.servicoIds,
      };

      if (editando) {
        await api.put(`/barbeiros/${form.id}`, payload);
        setAlert({ type: "success", text: "Barbeiro atualizado com sucesso." });
      } else {
        await api.post("/barbeiros", payload);
        setAlert({ type: "success", text: "Barbeiro cadastrado com sucesso." });
      }

      limparForm();
      await carregarBarbeiros();
    } catch (err) {
      setAlert({ type: "error", text: "Erro ao salvar: " + getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  async function excluir(barbeiro) {
    const confirmar = window.confirm(`Deseja realmente excluir "${barbeiro.nome}"?`);
    if (!confirmar) return;

    try {
      setDeletingId(barbeiro.id);
      await api.delete(`/barbeiros/${barbeiro.id}`);
      setAlert({ type: "success", text: "Barbeiro excluído com sucesso." });
      await carregarBarbeiros();
    } catch (err) {
      setAlert({ type: "error", text: "Erro ao excluir: " + getErrorMessage(err) });
    } finally {
      setDeletingId(null);
    }
  }

  const busy = saving || deletingId !== null;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ marginBottom: 30 }}>Barbeiros</h1>

      {alert.text && <div className={`alert ${alert.type}`}>{alert.text}</div>}

      {/* FORM */}
      <div className="card" style={{ padding: 24, marginBottom: 30 }}>
        <h3>{editando ? "Editar barbeiro" : "Novo barbeiro"}</h3>

        <form onSubmit={salvar}>
          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
            <input className="input" name="nome" placeholder="Nome" value={form.nome} onChange={handleChange} disabled={busy} />
            <input className="input" name="email" placeholder="Email" value={form.email} onChange={handleChange} disabled={busy} />
            <input className="input" name="telefone" placeholder="Telefone" value={form.telefone} onChange={handleChange} disabled={busy} />
            <input className="input" type="time" name="horaEntrada" value={form.horaEntrada} onChange={handleChange} disabled={busy} />
            <input className="input" type="time" name="horaSaida" value={form.horaSaida} onChange={handleChange} disabled={busy} />
          </div>

          <div style={{ marginTop: 20 }}>
            <strong>Serviços Ativos:</strong>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
              {servicosAtivos.map((s) => (
                <label key={s.id} style={{ display: "flex", gap: 6 }}>
                  <input
                    type="checkbox"
                    checked={form.servicoIds.includes(s.id)}
                    onChange={() => toggleServico(s.id)}
                  />
                  {s.nome}
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <button className="btn primary" disabled={busy}>
              {saving ? "Salvando..." : editando ? "Atualizar" : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>

      {/* LISTA EM CARDS */}
      <div style={{ display: "grid", gap: 16 }}>
        {barbeiros.map((b) => (
          <div key={b.id} className="card" style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{b.nome}</div>
                <div style={{ color: "var(--muted)", marginTop: 6 }}>
                  {toHHMM(b.horaEntrada)} - {toHHMM(b.horaSaida)}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn" onClick={() => setForm({ ...form, ...b })}>
                  Editar
                </button>
                <button className="btn danger" onClick={() => excluir(b)}>
                  {deletingId === b.id ? "Excluindo..." : "Excluir"}
                </button>
              </div>
            </div>
          </div>
        ))}

        {barbeiros.length === 0 && (
          <div style={{ color: "var(--muted)" }}>Nenhum barbeiro cadastrado.</div>
        )}
      </div>
    </div>
  );
}