/**
 * Lightweight postMessage bridge for communicating with the Profy shell
 * when this app runs inside an iframe. Silent no-op when standalone.
 */

export const isEmbedded =
  typeof window !== "undefined" && window.parent !== window;

export function notifyReady(): void {
  if (!isEmbedded) return;
  window.parent.postMessage({ type: "profy:iframe-ready" }, "*");
}

export function notifyTaskState(
  phase: "started" | "finished",
  opts?: {
    apiPath?: string;
    status?: "success" | "failed";
    error?: string;
  },
): void {
  if (!isEmbedded) return;
  window.parent.postMessage(
    { type: "profy:task-state-changed", phase, ...opts },
    "*",
  );
}

export function notifyInsufficientBalance(opts?: {
  apiPath?: string;
}): void {
  if (!isEmbedded) return;
  window.parent.postMessage(
    { type: "profy:insufficient-balance", ...opts },
    "*",
  );
}
