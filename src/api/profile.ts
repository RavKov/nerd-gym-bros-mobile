import { api } from "@/src/api/client";
import type { ClientProfile } from "@/src/types/clientProfile";

export async function fetchClientProfile(): Promise<ClientProfile> {
  const res = await api.get<ClientProfile>("/api/me/detail/");
  return res.data;
}

export async function verifyAccount(email: string, code: string): Promise<void> {
  await api.post("/api/me/verify/", { email, code });
}

export async function resendVerification(email: string): Promise<void> {
  await api.post("/api/me/resend_verification/", { email });
}
