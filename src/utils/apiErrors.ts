import { Alert } from "react-native";
import axios from "axios";

import { devWarn } from "@/src/utils/devLog";

export type ApiErrorPayload = {
  detail?: string;
  message?: string;
  [key: string]: unknown;
};

export function parseApiErrorMessage(data: unknown, fallback = "Something went wrong."): string {
  if (typeof data === "string") {
    if (/<html|<!doctype html/i.test(data)) {
      return "Server returned an unexpected HTML response. Check the backend logs.";
    }
    return data.slice(0, 200);
  }

  if (data && typeof data === "object") {
    const payload = data as ApiErrorPayload;
    if (typeof payload.detail === "string") return payload.detail;
    if (typeof payload.message === "string") return payload.message;

    const fieldMessages = Object.entries(payload)
      .filter(([, value]) => Array.isArray(value))
      .flatMap(([key, value]) => (value as unknown[]).map((item) => `${key}: ${String(item)}`));
    if (fieldMessages.length > 0) return fieldMessages.join("\n");
  }

  return fallback;
}

export function getErrorMessage(
  err: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (axios.isAxiosError(err)) {
    return parseApiErrorMessage(err.response?.data, err.message);
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
}

export function alertAxiosError(title: string, err: unknown): void {
  if (!axios.isAxiosError(err)) {
    Alert.alert(title, err instanceof Error ? err.message : "Unknown error");
    return;
  }

  const message = getErrorMessage(err);
  devWarn(`[${title}]`, err.response?.status, err.response?.data);
  Alert.alert(title, message);
}
