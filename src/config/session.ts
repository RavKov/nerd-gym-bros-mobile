let onSessionExpired: (() => void) | null = null;

export function setOnSessionExpired(handler: (() => void) | null): void {
  onSessionExpired = handler;
}

export function notifySessionExpired(): void {
  onSessionExpired?.();
}
