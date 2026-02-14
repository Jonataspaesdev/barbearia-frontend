import api from "../../api/api";

export async function listarClientes() {
  const res = await api.get("/clientes");
  return res.data;
}

export async function criarCliente(payload) {
  const res = await api.post("/clientes", payload);
  return res.data;
}