// src/pages/clientes/ClientesPage.jsx
import { useEffect, useMemo, useState } from "react";
import { atualizarCliente, criarCliente, listarClientes } from "./clientesService";
import { isAdmin } from "../../auth/auth";

export default function ClientesPage() {
  const admin = isAdmin();

  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [editandoId, setEditandoId] = useState(null);

  const [busca, setBusca] = useState("");

  useEffect(() => {
    if (admin) carregar();
    // eslint-disable-next-line
  }, []);

  async function carregar() {
    try {
      setLoading(true);
      const data = await listarClientes();
      setClientes(Array.isArray(data) ? data : []);
    } catch {
      setErro("Erro ao carregar clientes.");
    } finally {
      setLoading(false);
    }
  }

  function limpar() {
    setNome("");
    setEmail("");
    setTelefone("");
    setEditandoId(null);
    setErro("");
  }

  function editar(c) {
    setEditandoId(c.id);
    setNome(c.nome || "");
    setEmail(c.email || "");
    setTelefone(c.telefone || "");
  }

  async function salvar(e) {
    e.preventDefault();

    if (!nome.trim()) {
      setErro("Nome é obrigatório.");
      return;
    }

    const payload = {
      nome: nome.trim(),
      email: email || null,
      telefone: telefone || null,
    };

    try {
      if (editandoId) {
        await atualizarCliente(editandoId, payload);
      } else {
        await criarCliente(payload);
      }

      limpar();
      if (admin) await carregar();
    } catch {
      setErro("Erro ao salvar cliente.");
    }
  }

  const clientesFiltrados = useMemo(() => {
    if (!busca.trim()) return clientes;
    const t = busca.toLowerCase();
    return clientes.filter(
      (c) =>
        c.nome?.toLowerCase().includes(t) ||
        c.email?.toLowerCase().includes(t) ||
        c.telefone?.toLowerCase().includes(t)
    );
  }, [clientes, busca]);

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h1 style={styles.title}>Clientes</h1>

        {/* FORM */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>
            {editandoId ? "Editar Cliente" : "Novo Cliente"}
          </h2>

          {erro && <div style={styles.error}>{erro}</div>}

          <form onSubmit={salvar} style={styles.form}>
            <input
              style={styles.input}
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />

            <input
              style={styles.input}
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              style={styles.input}
              placeholder="Telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />

            <div style={{ display: "flex", gap: 10 }}>
              <button style={styles.primaryBtn}>
                {editandoId ? "Atualizar" : "Salvar"}
              </button>

              {editandoId && (
                <button type="button" style={styles.secondaryBtn} onClick={limpar}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* LISTA ADMIN */}
        {admin && (
          <div style={styles.card}>
            <div style={styles.headerRow}>
              <h2 style={styles.sectionTitle}>Lista de Clientes</h2>
              <input
                style={{ ...styles.input, maxWidth: 260 }}
                placeholder="Buscar..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            {loading && <div>Carregando...</div>}

            {!loading && clientesFiltrados.length === 0 && (
              <div style={styles.empty}>Nenhum cliente encontrado.</div>
            )}

            {!loading && clientesFiltrados.length > 0 && (
              <div style={styles.list}>
                {clientesFiltrados.map((c) => (
                  <div key={c.id} style={styles.listCard}>
                    <div>
                      <div style={styles.nome}>{c.nome}</div>
                      <div style={styles.sub}>{c.telefone || "-"}</div>
                      <div style={styles.sub}>{c.email || "-"}</div>
                    </div>

                    <button
                      style={styles.secondaryBtn}
                      onClick={() => editar(c)}
                    >
                      Editar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ===================== STYLES ===================== */

const styles = {
  wrapper: {
    padding: 40,
    display: "flex",
    justifyContent: "center",
  },
  container: {
    width: "100%",
    maxWidth: 1000,
    display: "flex",
    flexDirection: "column",
    gap: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: 800,
  },
  card: {
    padding: 30,
    borderRadius: 20,
    background: "#111",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  sectionTitle: {
    marginBottom: 20,
    fontSize: 20,
    fontWeight: 800,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  input: {
    padding: 14,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "#1a1a1a",
    color: "#fff",
    fontSize: 15,
  },
  primaryBtn: {
    padding: 14,
    borderRadius: 14,
    border: "none",
    background: "#fff",
    color: "#000",
    fontWeight: 800,
    cursor: "pointer",
  },
  secondaryBtn: {
    padding: 14,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "transparent",
    color: "#fff",
    cursor: "pointer",
  },
  list: {
    display: "grid",
    gap: 14,
  },
  listCard: {
    padding: 18,
    borderRadius: 16,
    background: "#1a1a1a",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nome: {
    fontSize: 16,
    fontWeight: 800,
  },
  sub: {
    fontSize: 13,
    opacity: 0.7,
  },
  empty: {
    opacity: 0.6,
  },
  error: {
    marginBottom: 10,
    color: "#ff6b6b",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    flexWrap: "wrap",
    gap: 10,
  },
};