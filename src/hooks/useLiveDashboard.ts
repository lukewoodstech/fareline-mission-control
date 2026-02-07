/**
 * useLiveDashboard — orchestrates all API data + client-side state.
 *
 * Data flow:
 *   Trip / Flights / Lodging / AgentState → polled from backend API
 *   Reasoning + Logs → merged into a unified activity feed
 *   Decisions (select / reject) → client-side only
 *   Budget → client-side overlay (backend doesn't track budget)
 *   Metrics → computed from available API data
 *   Activities → handled separately by useActivityStore (mock)
 */
import { useState, useCallback, useMemo, useEffect } from "react";
import {
  useTripQuery,
  useReasoningQuery,
  useLogsQuery,
  useSimulateDelay,
  useSimulateCancel,
  useApproveTrip,
  useModifyTrip,
} from "./useApi";
import type {
  AgentAction,
  AgentState,
  FlightOption,
  LodgingOption,
  OptionDecision,
  ImpactMetrics,
  Trip,
} from "@/types/travel";

export function useLiveDashboard() {
  // ── API queries (poll every 5 s) ──
  const tripQuery = useTripQuery();
  const reasoningQuery = useReasoningQuery();
  const logsQuery = useLogsQuery();

  // ── Mutations ──
  const simulateDelay = useSimulateDelay();
  const simulateCancel = useSimulateCancel();
  const approve = useApproveTrip();
  const modify = useModifyTrip();

  // ── Client-side overlay state ──
  const [localActions, setLocalActions] = useState<AgentAction[]>([]);
  const [localAgentState, setLocalAgentState] = useState<AgentState | null>(null);
  const [decisions, setDecisions] = useState<OptionDecision[]>([]);
  const [budget, setBudget] = useState(0);

  // ── API-derived data ──
  const apiTrip = tripQuery.data?.trip ?? null;
  const apiAgentState = tripQuery.data?.agentState ?? "Idle";
  const flights: FlightOption[] = tripQuery.data?.flights ?? [];
  const lodging: LodgingOption[] = tripQuery.data?.lodging ?? [];

  // Merge local budget into the trip object so components can read trip.budget
  const trip: Trip | null = useMemo(() => {
    if (!apiTrip) return null;
    return { ...apiTrip, budget };
  }, [apiTrip, budget]);

  // ── Agent state: local override resets when API state changes ──
  const agentState: AgentState = localAgentState ?? apiAgentState;

  useEffect(() => {
    setLocalAgentState(null);
  }, [apiAgentState]);

  // ── Merged activity feed (local events + API reasoning + API logs) ──
  const actions: AgentAction[] = useMemo(() => {
    const reasoning = reasoningQuery.data ?? [];
    const logs = logsQuery.data ?? [];
    return [...localActions, ...reasoning, ...logs];
  }, [localActions, reasoningQuery.data, logsQuery.data]);

  // ── Computed metrics ──
  const metrics: ImpactMetrics = useMemo(
    () => ({
      moneySaved: 0,
      baselinePrice: 0,
      timeSavedHours: 0,
      alertsSent: actions.filter((a) => a.smsSent).length,
      optionsEvaluated: flights.length + lodging.length,
    }),
    [actions, flights.length, lodging.length],
  );

  // ── Decision helpers ──
  const selectedFlightId =
    decisions.find((d) => d.category === "flight" && d.status === "selected")?.optionId ?? null;
  const selectedLodgingId =
    decisions.find((d) => d.category === "lodging" && d.status === "selected")?.optionId ?? null;

  const getDecision = useCallback(
    (id: string) => decisions.find((d) => d.optionId === id),
    [decisions],
  );

  // ── Callbacks for child components ──
  const addAction = useCallback((action: AgentAction) => {
    setLocalActions((prev) => [action, ...prev]);
  }, []);

  const setAgentState = useCallback((state: AgentState) => {
    setLocalAgentState(state);
  }, []);

  // ── Client-side decision management ──
  const selectOption = useCallback(
    (optionId: string, category: "flight" | "lodging") => {
      setDecisions((prev) => {
        const filtered = prev.filter(
          (d) => !(d.category === category && d.status === "selected"),
        );
        return [
          ...filtered.filter((d) => d.optionId !== optionId),
          {
            optionId,
            category,
            status: "selected" as const,
            monitorPrice: false,
            timestamp: new Date().toISOString(),
          },
        ];
      });
    },
    [],
  );

  const unselectOption = useCallback(
    (optionId: string, _category: "flight" | "lodging") => {
      setDecisions((prev) => prev.filter((d) => d.optionId !== optionId));
      addAction({
        id: `act-unselect-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: "optimize",
        summary: "Selection cleared",
        detail: "Ready to pick a new option.",
        smsSent: false,
      });
    },
    [addAction],
  );

  const rejectOption = useCallback(
    (optionId: string, category: "flight" | "lodging", reason: string) => {
      setDecisions((prev) => [
        ...prev.filter((d) => d.optionId !== optionId),
        {
          optionId,
          category,
          status: "replacing" as const,
          rejectReason: reason,
          timestamp: new Date().toISOString(),
        },
      ]);

      setLocalAgentState(
        category === "flight" ? "Re-optimizing (Flights)" : "Re-optimizing (Lodging)",
      );

      addAction({
        id: `act-reject-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: "reject",
        summary: `Rejected ${category} option — "${reason}"`,
        detail: "Feedback recorded. Agent will re-optimize on next cycle.",
        smsSent: false,
      });

      // Notify backend to re-optimize
      modify.mutate();
    },
    [addAction, modify],
  );

  const toggleMonitor = useCallback((optionId: string) => {
    setDecisions((prev) =>
      prev.map((d) =>
        d.optionId === optionId ? { ...d, monitorPrice: !d.monitorPrice } : d,
      ),
    );
  }, []);

  const reoptimize = useCallback(
    (category: "flight" | "lodging", strategy: string) => {
      setLocalAgentState(
        category === "flight" ? "Re-optimizing (Flights)" : "Re-optimizing (Lodging)",
      );
      addAction({
        id: `act-reopt-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: "optimize",
        summary: `Re-optimizing ${category}s — ${strategy}`,
        detail: `Requesting the agent to find better ${category} options.`,
        smsSent: false,
      });
      modify.mutate();
    },
    [addAction, modify],
  );

  const updateBudget = useCallback((n: number) => setBudget(n), []);

  // ── Loading / error ──
  const isLoading = tripQuery.isLoading;
  const error =
    tripQuery.error?.message ??
    reasoningQuery.error?.message ??
    logsQuery.error?.message ??
    null;

  return {
    // API-sourced
    trip,
    agentState,
    flights,
    lodging,
    actions,
    isLoading,
    error,

    // Client-side decisions
    decisions,
    selectedFlightId,
    selectedLodgingId,
    getDecision,
    selectOption,
    unselectOption,
    rejectOption,
    toggleMonitor,
    reoptimize,

    // Budget (client-side)
    budget,
    updateBudget,

    // Metrics (computed)
    metrics,

    // Child-component callbacks
    addAction,
    setAgentState,

    // Mutations for simulation controls
    simulateDelay,
    simulateCancel,
    approve,
    modify,
  };
}
