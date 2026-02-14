import { useEffect, useState } from "react";
import AppLayout from "../../layouts/AppLayout";
import { criarCliente } from "./clientesService";

export default function ClientesPage() {
  const [erro, setErro] = useState("");

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");

  useEffect(() => {
    // não precisa carregar lista (lista escondida)
  }, []);

  async function salvar(e) {
    e.preventDefault();

    if (!nome.trim()) {
      setErro("Nome é obrigatório.");
      return;
    }

    try {
      setErro("");

      await criarCliente({
        nome,
        email: email || null,
        telefone: telefone || null,
      });

      setNome("");
      setEmail("");
      setTelefone("");
    } catch (err) {
      setErro("Erro ao salvar cliente.");
    }
  }

  return (
    <AppLayout title="Clientes">
      <div
  style={{
    height: "calc(100vh - 120px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
>
        <div className="card" style={{ width: 460, maxWidth: "100%" }}>
          <h2 style={{ marginTop: 0 }}>Cadastrar Cliente</h2>

          {erro ? <p style={{ color: "var(--danger)" }}>{erro}</p> : null}

          <form onSubmit={salvar}>
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

            <button className="btn primary" type="submit">
              Salvar
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}