import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { setToken } from "../auth/auth";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@admin.com");
  const [senha, setSenha] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, senha });
      setToken(res.data.token);
      navigate("/dashboard");
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      setErro(`Falhou (${status ?? "?"}): ${JSON.stringify(data ?? "")}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <div style={{ width: 360, padding: 24, border: "1px solid #333", borderRadius: 12 }}>
        <h1>Login</h1>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10, marginTop: 16 }}>
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

          {erro && <div style={{ color: "red" }}>{erro}</div>}

          <button type="submit" disabled={loading} style={{ padding: 12, borderRadius: 10 }}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}