// src/pages/servicos/ServicosPage.jsx
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

function formatMoedaBRL(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ServicosPage() {
  const [servicos, setServicos] = useState([]);

  const [loadingLista, setLoadingLista] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [alert, setAlert] = useState({ type: "", text: "" });

  const [form, setForm] = useState({
    id: null,
    nome: "",
    preco: "",
    duracaoMinutos: "",
    descricao: "",
  });

  const editando = !!form.id;

  const servicoEditando = useMemo(() => {
    if (!editando) return null;
    return servicos.find((s) => s.id === form.id) || null;
  }, [editando, form.id, servicos]);

  async function carregarServicos() {
    try {
      setLoadingLista(true);
      setAlert({ type: "", text: "" });

      const response = await api.get("/servicos");
      setServicos(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setAlert({
        type: "error",
        text: "Erro ao carregar serviços: " + getErrorMessage(err),
      });
    } finally {
      setLoadingLista(false);
    }
  }

  useEffect(() => {
    carregarServicos();
  }, []);

  function limparForm() {
    setForm({
      id: null,
      nome: "",
      preco: "",
      duracaoMinutos: "",
      descricao: "",
    });
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function salvar(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setAlert({ type: "", text: "" });

      const nome = form.nome.trim();
      if (!nome)
        return setAlert({ type: "error", text: "Informe o nome do serviço." });

      const precoNum = Number(form.preco.replace(",", "."));
      if (!precoNum || precoNum < 0)
        return setAlert({
          type: "error",
          text: 'Informe um preço válido. Ex: "45" ou "45,50".',
        });

      const duracao = Number(form.duracaoMinutos);
      if (!duracao || duracao <= 0)
        return setAlert({
          type: "error",
          text: "Informe uma duração válida em minutos (ex: 30).",
        });

      const payload = {
        nome,
        descricao: form.descricao || "",
        preco: precoNum,
        duracaoMinutos: duracao,
        ativo: true, // 🔥 alinhado com backend
      };

      if (editando) {
        await api.put(`/servicos/${form.id}`, payload);
        setAlert({ type: "success", text: "Serviço atualizado com sucesso." });
      } else {
        await api.post("/servicos", payload);
        setAlert({ type: "success", text: "Serviço cadastrado com sucesso." });
      }

      limparForm();
      await carregarServicos();
    } catch (err) {
      setAlert({
        type: "error",
        text: "Erro ao salvar: " + getErrorMessage(err),
      });
    } finally {
      setSaving(false);
    }
  }

  function editar(servico) {
    setAlert({ type: "", text: "" });

    setForm({
      id: servico.id,
      nome: servico.nome || "",
      preco: String(servico.preco || ""),
      duracaoMinutos: String(servico.duracaoMinutos || ""),
      descricao: servico.descricao || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function excluir(servico) {
    const confirmar = window.confirm(
      `Deseja realmente desativar o serviço "${servico.nome}"?`
    );
    if (!confirmar) return;

    try {
      setDeletingId(servico.id);
      setAlert({ type: "", text: "" });

      await api.delete(`/servicos/${servico.id}`);

      setAlert({ type: "success", text: "Serviço desativado com sucesso." });

      if (form.id === servico.id) limparForm();

      await carregarServicos();
    } catch (err) {
      setAlert({
        type: "error",
        text: "Não foi possível excluir: " + getErrorMessage(err),
      });
    } finally {
      setDeletingId(null);
    }
  }

  const busy = saving || deletingId !== null;

  return (
    <div className="stack">
      <div className="spread">
        <div>
          <h1 style={{ margin: 0 }}>Serviços</h1>
          <div className="badge" style={{ marginTop: 8 }}>
            {loadingLista ? "Carregando..." : `${servicos.length} cadastrados`}
          </div>
        </div>

        <div className="row" style={{ justifyContent: "flex-end" }}>
          <button className="btn" onClick={carregarServicos} disabled={busy}>
            Recarregar
          </button>
          <button className="btn ghost" onClick={limparForm} disabled={busy}>
            Novo / Limpar
          </button>
        </div>
      </div>

      {alert.text && (
        <div className={`alert ${alert.type || "info"}`}>{alert.text}</div>
      )}

      <div className="card">
        <h3>{editando ? "Editar serviço" : "Novo serviço"}</h3>

        <form onSubmit={salvar}>
          <div className="row">
            <input
              className="input"
              name="nome"
              placeholder="Nome do serviço"
              value={form.nome}
              onChange={handleChange}
              disabled={busy}
              required
            />
            <input
              className="input"
              name="preco"
              placeholder="Preço (ex: 45,00)"
              value={form.preco}
              onChange={handleChange}
              disabled={busy}
              required
            />
            <input
              className="input"
              name="duracaoMinutos"
              placeholder="Duração (min)"
              value={form.duracaoMinutos}
              onChange={handleChange}
              disabled={busy}
              required
            />
          </div>

          <div className="row" style={{ marginTop: 12 }}>
            <input
              className="input"
              name="descricao"
              placeholder="Descrição (opcional)"
              value={form.descricao}
              onChange={handleChange}
              disabled={busy}
            />
          </div>

          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn primary" type="submit" disabled={busy}>
              {saving ? "Salvando..." : editando ? "Atualizar" : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3>Lista de serviços</h3>

        {loadingLista ? (
          <p>Carregando...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Duração</th>
                <th>Preço</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {servicos.map((s) => (
                <tr key={s.id}>
                  <td>{s.nome}</td>
                  <td>{s.duracaoMinutos} min</td>
                  <td>{formatMoedaBRL(s.preco)}</td>
                  <td>
                    <span
                      className={`badge ${
                        s.ativo ? "success" : "error"
                      }`}
                    >
                      {s.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn"
                        onClick={() => editar(s)}
                        disabled={busy}
                      >
                        Editar
                      </button>
                      <button
                        className="btn danger"
                        onClick={() => excluir(s)}
                        disabled={busy}
                      >
                        {deletingId === s.id ? "Processando..." : "Desativar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}