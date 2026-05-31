import { api } from "@/src/api/client";

export async function createBugReport(formData: FormData): Promise<void> {
  await api.post("/api/create_bug_report/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function createFeatureRequest(title: string, description: string): Promise<void> {
  await api.post("/api/create_feature_request/", { title, description });
}
