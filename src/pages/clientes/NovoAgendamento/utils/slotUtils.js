import {
  parseTimeToMinutes,
  minutesToTime,
  isSameISODate,
} from "./dateUtils";

// Regras fixas do seu caso:
export const DURACAO_MIN = 30;

// Gera slots de 30 em 30, ex: 09:00 ... 18:00 (pois 18:00-18:30 fecha)
export function gerarSlotsTrabalho(horaEntrada, horaSaida) {
  const start = parseTimeToMinutes(horaEntrada); // 09:00
  const end = parseTimeToMinutes(horaSaida); // 18:30
  const slots = [];

  // último início permitido é end - DURACAO_MIN
  for (let t = start; t <= end - DURACAO_MIN; t += DURACAO_MIN) {
    slots.push(minutesToTime(t));
  }
  return slots;
}

function overlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

export function normalizarAgendamentosDoDia(agendamentos, barbeiroId, dateISO) {
  if (!Array.isArray(agendamentos)) return [];

  return agendamentos
    .filter((a) => String(a.barbeiroId) === String(barbeiroId))
    .filter((a) => a.status !== "CANCELADO")
    .filter((a) => isSameISODate(a.dataHora, dateISO))
    .map((a) => {
      const inicio = a.dataHora?.slice(11, 16); // HH:mm
      // se não tiver fim, assume 30 minutos
      const fim = a.dataHoraFim?.slice(11, 16);

      return { inicio, fim };
    })
    .filter((x) => x.inicio);
}

export function slotDisponivel(timeHHmm, ocupados) {
  const slotStart = parseTimeToMinutes(timeHHmm);
  const slotEnd = slotStart + DURACAO_MIN;

  for (const o of ocupados) {
    const oStart = parseTimeToMinutes(o.inicio);
    const oEnd = o.fim ? parseTimeToMinutes(o.fim) : oStart + DURACAO_MIN;

    if (overlap(slotStart, slotEnd, oStart, oEnd)) return false;
  }
  return true;
}