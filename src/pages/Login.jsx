import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { setAuth } from "../auth/auth";

export default function Login() {
  const navigate = useNavigate();

  const [modoCadastro, setModoCadastro] = useState(false);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  function limparMensagens() {
    setErro("");
    setSucesso("");
  }

  async function handleLogin(e) {
    e.preventDefault();
    limparMensagens();
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, senha });

      setAuth({
        token: res.data.token,
        role: res.data.role,
        nome: res.data.nome,
        email: res.data.email,
        clienteId: res.data.clienteId ?? null,
      });

      // redireciona baseado na role
      if ((res.data.role || "").toUpperCase().includes("ADMIN")) {
        navigate("/dashboard");
      } else {
        navigate("/agendamentos");
      }
    } catch (err) {
      setErro("Email ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCadastro(e) {
    e.preventDefault();
    limparMensagens();
    setLoading(true);

    try {
      await api.post("/auth/register", {
        nome,
        email,
        telefone,
        senha,
      });

      setSucesso("Conta criada com sucesso! Agora faça login.");
      setModoCadastro(false);

      setNome("");
      setTelefone("");
      setSenha("");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.erro ||
        "Erro ao criar conta. Verifique os dados e tente novamente.";
      setErro(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <div
        style={{
          width: 380,
          padding: 24,
          border: "1px solid #333",
          borderRadius: 12,
        }}
      >
        <h1 style={{ margin: 0 }}>{modoCadastro ? "Criar conta" : "Entrar"}</h1>

        {erro && (
          <div style={{ color: "red", marginTop: 12 }}>
            {erro}
          </div>
        )}
        {sucesso && (
          <div style={{ color: "green", marginTop: 12 }}>
            {sucesso}
          </div>
        )}

        <form
          onSubmit={modoCadastro ? handleCadastro : handleLogin}
          style={{ display: "grid", gap: 10, marginTop: 16 }}
        >
          {modoCadastro && (
            <>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome"
                required
                style={{ padding: 10, borderRadius: 8 }}
              />

              <input
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="Telefone"
                style={{ padding: 10, borderRadius: 8 }}
              />
            </>
          )}

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            required
            style={{ padding: 10, borderRadius: 8 }}
          />

          <input
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Senha"
            type="password"
            required
            style={{ padding: 10, borderRadius: 8 }}
          />

          <button type="submit" disabled={loading} style={{ padding: 12, borderRadius: 10 }}>
            {loading ? "Processando..." : modoCadastro ? "Criar conta" : "Entrar"}
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: "center" }}>
          {modoCadastro ? (
            <button
              onClick={() => {
                setModoCadastro(false);
                limparMensagens();
              }}
              style={{ background: "none", border: "none", color: "#4ea8ff", cursor: "pointer" }}
              type="button"
            >
              Já tem conta? Entrar
            </button>
          ) : (
            <button
              onClick={() => {
                setModoCadastro(true);
                limparMensagens();
              }}
              style={{ background: "none", border: "none", color: "#4ea8ff", cursor: "pointer" }}
              type="button"
            >
              Não tem conta? Criar conta
            </button>
          )}
        </div>
      </div>
    </div>
  );
}