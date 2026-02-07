/**
 * useDemoDashboard — provides the same interface as useLiveDashboard
 * but powered entirely by mock data + client-side simulation.
 *
 * Used when the backend API is unreachable (e.g. in Lovable preview).
 */
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import type {
  AgentAction,
  AgentState,
  FlightOption,
  LodgingOption,
  OptionDecision,
  ImpactMetrics,
  Trip,
} from "@/types/travel";
import {
  mockTrip,
  mockFlights,
  mockLodging,
  mockMetrics,
  initialActions,
  demoAgentStates,
  demoNewActions,
} from "@/data/mockData";

export function useDemoDashboard() {
  // ── Demo simulation state ──
  const [agentState, setAgentStateRaw] = useState<AgentState>("Monitoring");
  const [actions, setActions] = useState<AgentAction[]>(initialActions);
  const [metrics, setMetrics] = useState<ImpactMetrics>(mockMetrics);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stateIndexRef = useRef(0);
  const actionIndexRef = useRef(0);

  // ── Client-side overlay state ──
  const [decisions, setDecisions] = useState<OptionDecision[]>([]);
  const [budget, setBudget] = useState(mockTrip.budget);

  // ── Static mock data ──
  const trip: Trip = useMemo(() => ({ ...mockTrip, budget }), [budget]);
  const flights: FlightOption[] = mockFlights;
  const lodging: LodgingOption[] = mockLodging;

  // ── Demo event simulation (every 5–10s) ──
  const addDemoEvent = useCallback(() => {
    const stateIdx = stateIndexRef.current % demoAgentStates.length;
    const actionIdx = actionIndexRef.current % demoNewActions.length;

    setAgentStateRaw(demoAgentStates[stateIdx]);

    const template = demoNewActions[actionIdx];
    const newAction: AgentAction = {
      ...template,
      id: `demo-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    setActions((prev) => [newAction, ...prev]);

    setMetrics((prev) => ({
      ...prev,
      optionsEvaluated: prev.optionsEvaluated + Math.floor(Math.random() * 30 + 10),
      moneySaved: prev.moneySaved + Math.floor(Math.random() * 8),
      alertsSent: prev.alertsSent + (template.smsSent ? 1 : 0),
    }));

    stateIndexRef.current += 1;
    actionIndexRef.current += 1;
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      addDemoEvent();
    }, 5000 + Math.random() * 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [addDemoEvent]);

  // ── Decision helpers (same interface as useLiveDashboard) ──
  const selectedFlightId =
    decisions.find((d) => d.category === "flight" && d.status === "selected")?.optionId ?? null;
  const selectedLodgingId =
    decisions.find((d) => d.category === "lodging" && d.status === "selected")?.optionId ?? null;

  const getDecision = useCallback(
    (id: string) => decisions.find((d) => d.optionId === id),
    [decisions],
  );

  const addAction = useCallback((action: AgentAction) => {
    setActions((prev) => [action, ...prev]);
  }, []);

  const setAgentState = useCallback((state: AgentState) => {
    setAgentStateRaw(state);
  }, []);

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

      setAgentStateRaw(
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
    },
    [addAction],
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
      setAgentStateRaw(
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
    },
    [addAction],
  );

  const updateBudget = useCallback((n: number) => setBudget(n), []);

  // ── Stub mutations (no-op in demo) ──
  const stubMutation = { mutate: () => {}, isPending: false };

  return {
    // Data
    trip,
    agentState,
    flights,
    lodging,
    actions,
    isLoading: false,
    error: null,

    // Decisions
    decisions,
    selectedFlightId,
    selectedLodgingId,
    getDecision,
    selectOption,
    unselectOption,
    rejectOption,
    toggleMonitor,
    reoptimize,

    // Budget
    budget,
    updateBudget,

    // Metrics
    metrics,

    // Callbacks
    addAction,
    setAgentState,

    // Stub mutations
    simulateDelay: stubMutation,
    simulateCancel: stubMutation,
    approve: stubMutation,
    modify: stubMutation,
  };
}
