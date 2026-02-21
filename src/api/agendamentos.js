import { http } from "./http";

export async function listarAgendamentos() {
  // Sem depender de filtro no backend (você pediu só front por agora)
  const { data } = await http.get("/agendamentos");
  return data;
}

export async function criarAgendamento(payload) {
  const { data } = await http.post("/agendamentos", payload);
  return data;
}