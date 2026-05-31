import axios from "axios";
import { setTokens, clearTokens } from "./authStorage";
import { API_BASE_URL } from "./env";

export async function login(username: string, password: string) {
  const res = await axios.post(`${API_BASE_URL}/api/auth/token/`, { username, password });
  await setTokens(res.data.access, res.data.refresh);
}

export async function logout() {
  await clearTokens();
}
