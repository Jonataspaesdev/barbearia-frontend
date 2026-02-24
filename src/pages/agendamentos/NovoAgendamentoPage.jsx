import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

const DURACAO_MIN = 30;

function pad(n) {
  return String(n).padStart(2, "0");
}

function toISO(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatBR(dateISO) {
  const [y, m, d] = dateISO.split("-");
  return `${d}/${m}/${y}`;
}

function gerarSlots(inicio = "09:00", fim = "18:30") {
  const [h1, m1] = inicio.split(":").map(Number);
  const [h2, m2] = fim.split(":").map(Number);

  const start = h1 * 60 + m1;
  const end = h2 * 60 + m2;

  const arr = [];
  for (let t = start; t <= end - DURACAO_MIN; t += DURACAO_MIN) {
    arr.push(`${pad(Math.floor(t / 60))}:${pad(t % 60)}`);
  }
  return arr;
}

export default function NovoAgendamentoPage() {
  const navigate = useNavigate();
  const clienteId = Number(localStorage.getItem("clienteId"));

  const [step, setStep] = useState(1);

  const [servicos, setServicos] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);

  const [servico, setServico] = useState(null);
  const [barbeiro, setBarbeiro] = useState(null);
  const [dateISO, setDateISO] = useState("");
  const [hora, setHora] = useState("");

  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const s = await api.get("/servicos");
        setServicos(s.data || []);
      } catch {}
      try {
        const b = await api.get("/barbeiros");
        setBarbeiros(b.data || []);
      } catch {}
    }
    load();
  }, []);

  useEffect(() => {
    if (!barbeiro || !dateISO) return;

    async function fetchSlots() {
      setLoadingSlots(true);
      try {
        const resp = await api.get(
          `/agendamentos/disponibilidade?barbeiroId=${barbeiro.id}&data=${dateISO}`
        );

        const entrada = resp.data?.horaEntrada || "09:00";
        const saida = resp.data?.horaSaida || "18:30";
        const ocupados = new Set(
          (resp.data?.ocupados || []).map((h) => h.slice(0, 5))
        );

        const todos = gerarSlots(entrada.slice(0, 5), saida.slice(0, 5));

        setSlots(
          todos.map((h) => ({
            hora: h,
            disponivel: !ocupados.has(h),
          }))
        );
      } catch {
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    }

    fetchSlots();
  }, [barbeiro, dateISO]);

  async function confirmar() {
    if (!servico || !barbeiro || !dateISO || !hora) return;

    setErro("");
    setLoading(true);

    try {
      await api.post("/agendamentos", {
        clienteId,
        barbeiroId: barbeiro.id,
        servicoId: servico.id,
        dataHora: `${dateISO}T${hora}:00`,
      });

      navigate("/agendamentos");
    } catch {
      setErro("Não foi possível confirmar.");
    } finally {
      setLoading(false);
    }
  }

  const dias = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return {
        iso: toISO(d),
        label: formatBR(toISO(d)),
      };
    });
  }, []);

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <h1 style={styles.title}>Escolha o serviço</h1>
            <div style={styles.grid}>
              {servicos.map((s) => (
                <button
                  key={s.id}
                  style={{
                    ...styles.card,
                    ...(servico?.id === s.id ? styles.cardActive : {}),
                  }}
                  onClick={() => {
                    setServico(s);
                    setStep(2);
                  }}
                >
                  <div style={styles.cardTitle}>{s.nome}</div>
                  <div style={styles.cardPrice}>
                    {Number(s.preco).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <h1 style={styles.title}>Escolha o barbeiro</h1>
            <div style={styles.grid}>
              {barbeiros.map((b) => (
                <button
                  key={b.id}
                  style={{
                    ...styles.card,
                    ...(barbeiro?.id === b.id ? styles.cardActive : {}),
                  }}
                  onClick={() => {
                    setBarbeiro(b);
                    setStep(3);
                  }}
                >
                  <div style={styles.cardTitle}>{b.nome}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <h1 style={styles.title}>Escolha a data</h1>
            <div style={styles.dateRow}>
              {dias.map((d) => (
                <button
                  key={d.iso}
                  style={{
                    ...styles.dateBtn,
                    ...(dateISO === d.iso ? styles.cardActive : {}),
                  }}
                  onClick={() => {
                    setDateISO(d.iso);
                    setStep(4);
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <>
            <h1 style={styles.title}>Escolha o horário</h1>

            {loadingSlots ? (
              <div style={{ opacity: 0.6 }}>Carregando...</div>
            ) : (
              <div style={styles.grid}>
                {slots.map((s) => (
                  <button
                    key={s.hora}
                    disabled={!s.disponivel}
                    style={{
                      ...styles.card,
                      ...(hora === s.hora ? styles.cardActive : {}),
                      opacity: s.disponivel ? 1 : 0.25,
                    }}
                    onClick={() => setHora(s.hora)}
                  >
                    <div style={styles.cardTitle}>{s.hora}</div>
                  </button>
                ))}
              </div>
            )}

            {erro && <div style={styles.error}>{erro}</div>}

            <button
              style={styles.confirmBtn}
              disabled={!hora || loading}
              onClick={confirmar}
            >
              {loading ? "Confirmando..." : "Confirmar Agendamento"}
            </button>
          </>
        )}

      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  wrapper: {
    minHeight: "100vh",
    background: "#0a0a0a",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: 24,
  },
  container: {
    width: "100%",
    maxWidth: 500,
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 800,
    letterSpacing: 0.5,
  },
  grid: {
    display: "grid",
    gap: 14,
  },
  card: {
    padding: 20,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s ease",
  },
  cardActive: {
    border: "1px solid rgba(255,255,255,0.25)",
    background: "#1a1a1a",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 700,
  },
  cardPrice: {
    marginTop: 6,
    opacity: 0.7,
  },
  dateRow: {
    display: "grid",
    gap: 10,
  },
  dateBtn: {
    padding: 16,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
  },
  confirmBtn: {
    marginTop: 10,
    padding: 18,
    borderRadius: 18,
    border: "none",
    background: "#ffffff",
    color: "#000",
    fontWeight: 800,
    fontSize: 16,
    cursor: "pointer",
  },
  error: {
    marginTop: 10,
    color: "#ff6b6b",
  },
};