import React, { useEffect, useMemo, useState } from "react";
import "./NovoAgendamento.css";

import WizardHeader from "./components/WizardHeader";
import StepServico from "./steps/StepServico";
import StepBarbeiro from "./steps/StepBarbeiro";
import StepData from "./steps/StepData";
import StepHorario from "./steps/StepHorario";
import StepConfirmar from "./steps/StepConfirmar";

import { listarServicos } from "../../../api/servicos";
import { listarBarbeiros } from "../../../api/barbeiros";
import { listarAgendamentos, criarAgendamento } from "../../../api/agendamentos";

import { gerarSlotsTrabalho, normalizarAgendamentosDoDia, slotDisponivel } from "./utils/slotUtils";
import { combineDateTimeISO } from "./utils/dateUtils";

const STEPS = ["Serviço", "Barbeiro", "Data", "Horário", "Confirmar"];

function tryGetClienteIdFromStorage() {
  // Tenta várias chaves comuns sem quebrar seu projeto
  const direct =
    localStorage.getItem("clienteId") ||
    localStorage.getItem("userId") ||
    localStorage.getItem("usuarioId");

  if (direct) return Number(direct);

  const jsonKeys = ["usuario", "user", "auth", "login"];
  for (const k of jsonKeys) {
    const raw = localStorage.getItem(k);
    if (!raw) continue;
    try {
      const obj = JSON.parse(raw);
      if (obj?.clienteId) return Number(obj.clienteId);
      if (obj?.id && (obj?.role?.includes("CLIENTE") || obj?.role === "ROLE_CLIENTE")) return Number(obj.id);
      if (obj?.user?.id) return Number(obj.user.id);
    } catch {
      // ignora
    }
  }

  return null;
}

export default function NovoAgendamento() {
  const [step, setStep] = useState(1);

  const [loadingInit, setLoadingInit] = useState(true);
  const [errorInit, setErrorInit] = useState("");

  const [servicos, setServicos] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);

  const [servico, setServico] = useState(null);
  const [barbeiro, setBarbeiro] = useState(null);
  const [dateISO, setDateISO] = useState("");
  const [timeHHmm, setTimeHHmm] = useState("");
  const [observacao, setObservacao] = useState("");

  const [loadingSlots, setLoadingSlots] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  // load inicial
  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        setLoadingInit(true);
        setErrorInit("");

        const [s, b, a] = await Promise.all([
          listarServicos(),
          listarBarbeiros(),
          listarAgendamentos(),
        ]);

        if (!alive) return;

        setServicos(Array.isArray(s) ? s : []);
        setBarbeiros(Array.isArray(b) ? b : []);
        setAgendamentos(Array.isArray(a) ? a : []);
      } catch (e) {
        if (!alive) return;
        setErrorInit("Não consegui carregar dados do sistema. Verifique se o backend está rodando e se você está logado.");
      } finally {
        if (alive) setLoadingInit(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, []);

  function resetAll() {
    setStep(1);
    setServico(null);
    setBarbeiro(null);
    setDateISO("");
    setTimeHHmm("");
    setObservacao("");
    setSubmitError("");
    setSubmitSuccess("");
  }

  function back() {
    setSubmitError("");
    setSubmitSuccess("");
    setStep((s) => Math.max(1, s - 1));
  }

  function next() {
    setSubmitError("");
    setSubmitSuccess("");
    setStep((s) => Math.min(5, s + 1));
  }

  // sempre que mudar barbeiro ou data, limpa horário escolhido
  useEffect(() => {
    setTimeHHmm("");
  }, [barbeiro?.id, dateISO]);

  // slots e disponibilidade
  const slots = useMemo(() => {
    const entrada = barbeiro?.horaEntrada || "09:00";
    const saida = barbeiro?.horaSaida || "18:30";
    return gerarSlotsTrabalho(entrada, saida);
  }, [barbeiro?.horaEntrada, barbeiro?.horaSaida]);

  const ocupados = useMemo(() => {
    if (!barbeiro?.id || !dateISO) return [];
    return normalizarAgendamentosDoDia(agendamentos, barbeiro.id, dateISO);
  }, [agendamentos, barbeiro?.id, dateISO]);

  const availabilityMap = useMemo(() => {
    if (!barbeiro?.id || !dateISO) return {};
    const map = {};
    for (const t of slots) {
      map[t] = slotDisponivel(t, ocupados);
    }
    return map;
  }, [slots, ocupados, barbeiro?.id, dateISO]);

  // simula loading quando chega no passo de horário (pra ficar profissional)
  useEffect(() => {
    let timer = null;
    if (step === 4) {
      setLoadingSlots(true);
      timer = setTimeout(() => setLoadingSlots(false), 250);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [step]);

  // badges de resumo no topo
  const badges = useMemo(() => {
    const arr = [];
    if (servico?.nome) arr.push({ label: `Serviço: ${servico.nome}` });
    if (barbeiro?.nome) arr.push({ label: `Barbeiro: ${barbeiro.nome}` });
    if (dateISO) arr.push({ label: `Data: ${dateISO}` });
    if (timeHHmm) arr.push({ label: `Hora: ${timeHHmm}` });
    return arr;
  }, [servico, barbeiro, dateISO, timeHHmm]);

  async function onSubmit() {
    setSubmitError("");
    setSubmitSuccess("");

    const clienteId = tryGetClienteIdFromStorage();
    if (!clienteId) {
      setSubmitError("Não consegui identificar seu clienteId no navegador. Faça login novamente e tente de novo.");
      return;
    }

    if (!servico?.id || !barbeiro?.id || !dateISO || !timeHHmm) {
      setSubmitError("Faltou alguma informação. Volte e selecione serviço, barbeiro, data e horário.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        clienteId,
        barbeiroId: barbeiro.id,
        servicoId: servico.id,
        dataHora: combineDateTimeISO(dateISO, timeHHmm),
        observacao: observacao?.trim() || null,
      };

      await criarAgendamento(payload);

      setSubmitSuccess("Agendamento criado com sucesso! ✅");
      // opcional: reset parcial
      // resetAll();
    } catch (e) {
      setSubmitError("Não consegui criar o agendamento. Verifique se o horário ainda está disponível e tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingInit) {
    return (
      <div className="pageWrap">
        <div style={{ opacity: 0.8 }}>Carregando...</div>
      </div>
    );
  }

  if (errorInit) {
    return (
      <div className="pageWrap">
        <div
          style={{
            padding: 14,
            borderRadius: 14,
            border: "1px solid rgba(255,80,80,0.35)",
            background: "rgba(255,80,80,0.08)",
          }}
        >
          {errorInit}
        </div>
      </div>
    );
  }

  return (
    <div className="pageWrap">
      <WizardHeader
        step={step}
        steps={STEPS}
        onBack={back}
        onReset={resetAll}
      />

      <div className="panel">
        <div className="panelTop">
          <div className="badges">
            {badges.length ? (
              badges.map((b, idx) => (
                <span key={idx} className="badge">{b.label}</span>
              ))
            ) : (
              <span className="badge" style={{ opacity: 0.65 }}>
                Selecione as opções para montar seu agendamento
              </span>
            )}
          </div>
        </div>

        <div className="hr" />

        {step === 1 && (
          <StepServico
            servicos={servicos}
            selected={servico}
            onSelect={(s) => setServico(s)}
            onNext={next}
          />
        )}

        {step === 2 && (
          <StepBarbeiro
            barbeiros={barbeiros}
            selected={barbeiro}
            onSelect={(b) => setBarbeiro(b)}
            onNext={next}
          />
        )}

        {step === 3 && (
          <StepData
            selectedDate={dateISO}
            onSelectDate={(iso) => setDateISO(iso)}
            onNext={next}
          />
        )}

        {step === 4 && (
          <StepHorario
            loading={loadingSlots}
            slots={slots}
            availabilityMap={availabilityMap}
            selectedTime={timeHHmm}
            onPickTime={(t) => setTimeHHmm(t)}
            onNext={next}
          />
        )}

        {step === 5 && (
          <StepConfirmar
            servico={servico}
            barbeiro={barbeiro}
            dateISO={dateISO}
            timeHHmm={timeHHmm}
            observacao={observacao}
            setObservacao={setObservacao}
            submitting={submitting}
            onSubmit={onSubmit}
            error={submitError}
            success={submitSuccess}
          />
        )}

        <div className="footerNav">
          <button className="btn" type="button" onClick={back} disabled={step === 1}>
            Voltar
          </button>

          <button
            className="btn"
            type="button"
            onClick={next}
            disabled={
              (step === 1 && !servico) ||
              (step === 2 && !barbeiro) ||
              (step === 3 && !dateISO) ||
              (step === 4 && !timeHHmm) ||
              step === 5
            }
            title={step === 5 ? "Você já está no final" : "Avançar"}
          >
            Avançar
          </button>
        </div>
      </div>
    </div>
  );
}