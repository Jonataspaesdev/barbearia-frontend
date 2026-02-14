import { useEffect, useState } from "react";
import AppLayout from "../../layouts/AppLayout";
import { atualizarCliente, criarCliente, listarClientes } from "./clientesService";
import { isAdmin } from "../../auth/auth";

export default function ClientesPage() {
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ só admin vê lista/editar
  const admin = isAdmin();

  // lista
  const [clientes, setClientes] = useState([]);

  // form
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");

  // modo edição (só admin)
  const [editandoId, setEditandoId] = useState(null);

  async function carregarClientes() {
    if (!admin) return;

    try {
      setLoading(true);
      const data = await listarClientes();
      setClientes(Array.isArray(data) ? data : []);
    } catch (e) {
      setErro("Erro ao carregar clientes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function limparFormulario() {
    setNome("");
    setEmail("");
    setTelefone("");
    setEditandoId(null);
    setErro("");
  }

  function clicarEditar(cliente) {
    if (!admin) return;

    setErro("");
    setEditandoId(cliente.id);
    setNome(cliente.nome || "");
    setEmail(cliente.email || "");
    setTelefone(cliente.telefone || "");
  }

  async function salvarOuAtualizar(e) {
    e.preventDefault();

    if (!nome.trim()) {
      setErro("Nome é obrigatório.");
      return;
    }

    const payload = {
      nome: nome.trim(),
      email: email ? email.trim() : null,
      telefone: telefone ? telefone.trim() : null,
    };

    try {
      setErro("");

      // ✅ editar só admin
      if (editandoId && !admin) {
        setErro("Apenas administrador pode editar clientes.");
        return;
      }

      if (editandoId) {
        await atualizarCliente(editandoId, payload);
      } else {
        await criarCliente(payload);
      }

      limparFormulario();

      // ✅ lista só admin
      await carregarClientes();
    } catch (err) {
      setErro(editandoId ? "Erro ao atualizar cliente." : "Erro ao salvar cliente.");
    }
  }

  return (
    <AppLayout title="Clientes">
      <div
        style={{
          minHeight: "calc(100vh - 120px)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          paddingTop: 30,
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        {/* ✅ CADASTRO NORMAL (liberado para todos) */}
        <div className="card" style={{ width: 460, maxWidth: "100%" }}>
          <h2 style={{ marginTop: 0 }}>
            {editandoId ? `Editar Cliente #${editandoId}` : "Cadastrar Cliente"}
          </h2>

          {!admin ? (
            <p style={{ opacity: 0.8, marginTop: -6 }}>
              Cadastro liberado ✅ <br />
              Lista e edição: somente administrador 🔒
            </p>
          ) : null}

          {erro ? <p style={{ color: "var(--danger)" }}>{erro}</p> : null}

          <form onSubmit={salvarOuAtualizar}>
            <input
              className="input"
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <br />
            <br />

            <input
              className="input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <br />
            <br />

            <input
              className="input"
              placeholder="Telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
            <br />
            <br />

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn primary" type="submit">
                {editandoId ? "Atualizar" : "Salvar"}
              </button>

              {editandoId ? (
                <button className="btn" type="button" onClick={limparFormulario}>
                  Cancelar
                </button>
              ) : null}
            </div>
          </form>
        </div>

        {/* ✅ LISTA + EDITAR SÓ ADMIN */}
        {admin ? (
          <div className="card" style={{ width: 560, maxWidth: "100%" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h2 style={{ marginTop: 0 }}>Lista de Clientes</h2>
              <button className="btn" type="button" onClick={carregarClientes}>
                Recarregar
              </button>
            </div>

            {loading ? <p>Carregando...</p> : null}

            {!loading && clientes.length === 0 ? <p>Nenhum cliente cadastrado.</p> : null}

            {!loading && clientes.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #333" }}>
                        Nome
                      </th>
                      <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #333" }}>
                        Telefone
                      </th>
                      <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #333" }}>
                        Email
                      </th>
                      <th style={{ padding: 8, borderBottom: "1px solid #333" }}>Ações</th>
                    </tr>
                  </thead>

                  <tbody>
                    {clientes.map((c) => (
                      <tr key={c.id}>
                        <td style={{ padding: 8, borderBottom: "1px solid #222" }}>{c.nome}</td>
                        <td style={{ padding: 8, borderBottom: "1px solid #222" }}>
                          {c.telefone || "-"}
                        </td>
                        <td style={{ padding: 8, borderBottom: "1px solid #222" }}>
                          {c.email || "-"}
                        </td>
                        <td style={{ padding: 8, borderBottom: "1px solid #222", textAlign: "center" }}>
                          <button className="btn" type="button" onClick={() => clicarEditar(c)}>
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
}