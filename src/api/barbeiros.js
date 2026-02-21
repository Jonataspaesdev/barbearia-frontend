import { http } from "./http";

export async function listarBarbeiros() {
  const { data } = await http.get("/barbeiros");
  return data;
}