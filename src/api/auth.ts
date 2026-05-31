import { api } from "@/src/api/client";

export type RegisterPayload = {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
};

export async function registerUser(payload: RegisterPayload): Promise<void> {
  await api.post("/api/register/", payload);
}
