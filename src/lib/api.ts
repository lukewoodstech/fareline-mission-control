/**
 * TripMaster API client.
 *
 * Base URL is read from the VITE_API_BASE_URL env variable,
 * falling back to http://localhost:3000 for local development.
 */
import type {
  TripResponse,
  ReasoningResponse,
  LogsResponse,
  ActionResponse,
} from "@/types/api";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ?? `API error ${res.status}`,
    );
  }

  // Health endpoint returns plain text
  if (res.headers.get("content-type")?.includes("text/plain")) {
    return (await res.text()) as unknown as T;
  }

  return res.json();
}

// ── Dashboard Data ──

export const api = {
  /** Get current trip state */
  getTrip: () => request<TripResponse>("/api/dashboard/trip"),

  /** Get AI reasoning logs */
  getReasoning: () => request<ReasoningResponse>("/api/dashboard/reasoning"),

  /** Get system logs */
  getLogs: () => request<LogsResponse>("/api/dashboard/logs"),

  // ── Simulation & Controls ──

  /** Simulate flight delay */
  simulateDelay: () =>
    request<ActionResponse>("/api/dashboard/simulate-delay", { method: "POST" }),

  /** Simulate flight cancellation */
  simulateCancel: () =>
    request<ActionResponse>("/api/dashboard/simulate-cancel", { method: "POST" }),

  /** Approve trip plan (stub) */
  approve: () =>
    request<ActionResponse>("/api/dashboard/approve", { method: "POST" }),

  /** Modify trip plan (stub) */
  modify: () =>
    request<ActionResponse>("/api/dashboard/modify", { method: "POST" }),

  // ── System ──

  /** Health check */
  health: () => request<string>("/health"),
};
