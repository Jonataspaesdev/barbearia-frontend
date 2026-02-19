// src/pages/barbeiros/BarbeirosPage.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../../api/api";

function getErrorMessage(err) {
  const data = err?.response?.data;
  if (!data) return "Ocorreu um erro. Tente novamente.";
  if (typeof data === "string") return data;
  if (data.mensagem) return data.mensagem;
  if (data.message) return data.message;
  try {
    return JSON.stringify(data);
  } catch {
    return "Ocorreu um erro. Tente novamente.";
  }
}

function isValidHHMM(v) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v || "");
}

function toHHMM(v) {
  // aceita "09:00:00" e transforma em "09:00"
  if (!v) return "";
  if (typeof v === "string") return v.slice(0, 5);
  return "";
}

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

  const barbeiroEditando = useMemo(() => {
    if (!editando) return null;
    return barbeiros.find((b) => b.id === form.id) || null;
  }, [editando, form.id, barbeiros]);

  // ✅ só serviços ativos aparecem para vincular no barbeiro
  const servicosAtivos = useMemo(() => {
    const lista = Array.isArray(servicos) ? servicos : [];
    return lista.filter((s) => s?.ativo === true);
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

  // ✅ se o admin estiver editando e algum serviço ficou inativo,
  // removemos automaticamente do form (pra não salvar vínculo inválido)
  useEffect(() => {
    if (!editando) return;
    if (loadingServicos) return;

    const ativosIds = new Set(servicosAtivos.map((s) => s.id));
    setForm((prev) => {
      const filtrado = prev.servicoIds.filter((id) => ativosIds.has(id));
      if (filtrado.length === prev.servicoIds.length) return prev;
      return { ...prev, servicoIds: filtrado };
    });
  }, [editando, loadingServicos, servicosAtivos]);

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

      const nome = form.nome.trim();
      if (!nome) return setAlert({ type: "error", text: "Informe o nome do barbeiro." });

      if (!form.email.trim()) return setAlert({ type: "error", text: "Informe o email do barbeiro." });

      if (!form.telefone.trim()) return setAlert({ type: "error", text: "Informe o telefone do barbeiro." });

      if (!isValidHHMM(form.horaEntrada) || !isValidHHMM(form.horaSaida)) {
        return setAlert({ type: "error", text: "Hora inválida. Use HH:MM (ex: 09:00)." });
      }

      if (!form.servicoIds.length) {
        return setAlert({ type: "error", text: "Selecione pelo menos 1 serviço ATIVO." });
      }

      // ✅ BACKEND ESPERA LocalTime como STRING "HH:MM"
      const payload = {
        nome,
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

  function editar(barbeiro) {
    setAlert({ type: "", text: "" });

    const ids =
      Array.isArray(barbeiro.servicoIds) ? barbeiro.servicoIds
      : Array.isArray(barbeiro.servicos) ? barbeiro.servicos.map((s) => s.id).filter(Boolean)
      : [];

    // ✅ ao editar, já filtra pra manter só os serviços ativos
    const ativosSet = new Set(servicosAtivos.map((s) => s.id));
    const idsAtivos = ids.filter((id) => ativosSet.has(id));

    setForm({
      id: barbeiro.id,
      nome: barbeiro.nome || "",
      email: barbeiro.email || "",
      telefone: barbeiro.telefone || "",
      horaEntrada: toHHMM(barbeiro.horaEntrada),
      horaSaida: toHHMM(barbeiro.horaSaida),
      servicoIds: idsAtivos,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function excluir(barbeiro) {
    const confirmar = window.confirm(
      `Deseja realmente excluir o barbeiro "${barbeiro.nome}"?\n\nSe ele tiver agendamentos vinculados, o sistema pode bloquear a exclusão.`
    );
    if (!confirmar) return;

    try {
      setDeletingId(barbeiro.id);
      setAlert({ type: "", text: "" });

      await api.delete(`/barbeiros/${barbeiro.id}`);

      setAlert({ type: "success", text: "Barbeiro excluído com sucesso." });

      if (form.id === barbeiro.id) limparForm();

      await carregarBarbeiros();
    } catch (err) {
      setAlert({ type: "error", text: "Não foi possível excluir: " + getErrorMessage(err) });
    } finally {
      setDeletingId(null);
    }
  }

  const busy = saving || deletingId !== null;
  const timeType = useTextTime ? "text" : "time";
  const timePlaceholder = useTextTime ? "HH:MM (ex: 09:00)" : "";

  return (
    <div className="stack">
      <div className="spread">
        <div>
          <h1 style={{ margin: 0 }}>Barbeiros</h1>
          <div className="badge" style={{ marginTop: 8 }}>
            {loadingLista ? "Carregando..." : `${barbeiros.length} cadastrados`}
            {loadingServicos ? " • serviços..." : ` • ${servicosAtivos.length} serviços ativos`}
          </div>
        </div>

        <div className="row" style={{ justifyContent: "flex-end" }}>
          <button className="btn" type="button" onClick={carregarTudo} disabled={busy}>
            Recarregar
          </button>
          <button className="btn ghost" type="button" onClick={limparForm} disabled={busy}>
            Novo / Limpar
          </button>
        </div>
      </div>

      {alert.text && <div className={`alert ${alert.type || "info"}`}>{alert.text}</div>}

      <div className="card">
        <div className="spread">
          <h3 style={{ margin: 0 }}>{editando ? "Editar barbeiro" : "Novo barbeiro"}</h3>
          {editando && (
            <div className="badge">
              Editando:{" "}
              <b style={{ color: "var(--text)" }}>{barbeiroEditando?.nome || form.nome}</b>
            </div>
          )}
        </div>

        <form onSubmit={salvar} style={{ marginTop: 12 }}>
          <div className="row">
            <input className="input" name="nome" placeholder="Nome" value={form.nome} onChange={handleChange} required disabled={busy} />
            <input className="input" name="email" placeholder="Email" value={form.email} onChange={handleChange} required disabled={busy} />
            <input className="input" name="telefone" placeholder="Telefone" value={form.telefone} onChange={handleChange} required disabled={busy} />
          </div>

          <div className="row" style={{ marginTop: 12 }}>
            <input
              className="input"
              type={timeType}
              name="horaEntrada"
              value={form.horaEntrada}
              onChange={handleChange}
              required
              disabled={busy}
              placeholder={timePlaceholder || "Hora de entrada"}
              inputMode="numeric"
              step="60"
            />
            <input
              className="input"
              type={timeType}
              name="horaSaida"
              value={form.horaSaida}
              onChange={handleChange}
              required
              disabled={busy}
              placeholder={timePlaceholder || "Hora de saída"}
              inputMode="numeric"
              step="60"
            />
          </div>

          <div className="card" style={{ marginTop: 12 }}>
            <div className="spread">
              <h3 style={{ margin: 0 }}>Serviços do barbeiro (somente ativos)</h3>
              <div className="badge">{form.servicoIds.length} selecionado(s)</div>
            </div>

            {loadingServicos ? (
              <p style={{ marginTop: 10 }}>Carregando serviços...</p>
            ) : servicosAtivos.length === 0 ? (
              <div className="alert error" style={{ marginTop: 10 }}>
                Nenhum serviço ATIVO encontrado. Ative/cadastre serviços primeiro.
              </div>
            ) : (
              <div className="row" style={{ marginTop: 10 }}>
                {servicosAtivos.map((s) => (
                  <label
                    key={s.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 10px",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.02)",
                      cursor: busy ? "not-allowed" : "pointer",
                      opacity: busy ? 0.6 : 1,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={form.servicoIds.includes(s.id)}
                      onChange={() => toggleServico(s.id)}
                      disabled={busy}
                    />
                    <span>{s.nome}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginTop: 12 }} className="row">
            <button className="btn primary" type="submit" disabled={busy}>
              {saving ? "Salvando..." : editando ? "Atualizar" : "Cadastrar"}
            </button>

            {editando && (
              <button className="btn" type="button" onClick={limparForm} disabled={busy}>
                Cancelar edição
              </button>
            )}

            <button className="btn" type="button" onClick={() => setUseTextTime((v) => !v)} disabled={busy}>
              {useTextTime ? "Usar seletor de hora" : "Modo manual HH:MM"}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3 style={{ margin: 0 }}>Lista de barbeiros</h3>

        {loadingLista ? (
          <p style={{ marginTop: 12 }}>Carregando...</p>
        ) : (
          <table className="table" style={{ marginTop: 10 }}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Entrada</th>
                <th>Saída</th>
                <th style={{ textAlign: "right", width: 240 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {barbeiros.map((b) => (
                <tr key={b.id}>
                  <td>{b.nome}</td>
                  <td>{toHHMM(b.horaEntrada)}</td>
                  <td>{toHHMM(b.horaSaida)}</td>
                  <td>
                    <div className="actions">
                      <button className="btn" onClick={() => editar(b)} disabled={busy}>
                        Editar
                      </button>
                      <button className="btn danger" onClick={() => excluir(b)} disabled={busy || deletingId === b.id}>
                        {deletingId === b.id ? "Excluindo..." : "Excluir"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {barbeiros.length === 0 && (
                <tr>
                  <td colSpan="4">Nenhum barbeiro cadastrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}