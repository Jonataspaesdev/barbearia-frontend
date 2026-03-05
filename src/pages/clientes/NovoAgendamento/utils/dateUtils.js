// src/pages/agendamentos/novo/utils/dateUtils.js

// =======================
// Datas (Wizard)
// =======================
export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// ISO local "YYYY-MM-DD" (sem UTC)
export function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function weekdayShortPt(date) {
  const map = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  return map[date.getDay()];
}

// Recebe "YYYY-MM-DD" e retorna "DD/MM"
export function formatBRDate(isoDate) {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}`;
}

// =======================
// Horários (slots)
// =======================
export function parseTimeToMinutes(hhmm) {
  if (!hhmm) return 0;
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function minutesToTime(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// =======================
// Agendamento (payload)
// =======================

// ✅ IMPORTANTE: manda pro backend LocalDateTime sem UTC, com segundos
// ex: "2026-03-05T10:00:00"
export function combineDateTimeISO(dateISO, timeHHmm) {
  if (!dateISO || !timeHHmm) return "";
  const hh = timeHHmm.slice(0, 2);
  const mm = timeHHmm.slice(3, 5);
  return `${dateISO}T${hh}:${mm}:00`;
}

// ✅ compara dia do agendamento com dateISO ("YYYY-MM-DD")
export function isSameISODate(dateTimeISO, dateISO) {
  if (!dateTimeISO || !dateISO) return false;
  return String(dateTimeISO).slice(0, 10) === String(dateISO);
}