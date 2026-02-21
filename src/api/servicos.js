import { http } from "./http";

export async function listarServicos() {
  const { data } = await http.get("/servicos");
  return data;
}