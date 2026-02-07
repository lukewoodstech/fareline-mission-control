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
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  useTripQuery,
  useReasoningQuery,
  useLogsQuery,
  useSimulateDelay,
  useSimulateCancel,
  useApproveTrip,
  useModifyTrip,
} from "./useApi";
import {
  mockFlights,
  mockLodging,
  replacementFlights,
  replacementLodging,
} from "@/data/mockData";
import type {
  AgentAction,
  AgentState,
  FlightOption,
  LodgingOption,
  OptionDecision,
  ImpactMetrics,
  Trip,
} from "@/types/travel";

export function useLiveDashboard(enabled = true) {
  // ── API queries (poll every 5 s, disabled in demo mode) ──
  const tripQuery = useTripQuery(enabled);
  const reasoningQuery = useReasoningQuery(enabled);
  const logsQuery = useLogsQuery(enabled);

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

  // ── Local trip management ──
  const [localTrips, setLocalTrips] = useState<Trip[]>([]);
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [flights, setFlights] = useState<FlightOption[]>(mockFlights);
  const [lodging, setLodging] = useState<LodgingOption[]>(mockLodging);
  const replacementFlightIdx = useRef(0);
  const replacementLodgingIdx = useRef(0);

  // ── API-derived data ──
  const apiTrip = tripQuery.data?.trip ?? null;
  const apiAgentState = tripQuery.data?.agentState ?? "Idle";
  const apiFlights: FlightOption[] = tripQuery.data?.flights ?? [];
  const apiLodging: LodgingOption[] = tripQuery.data?.lodging ?? [];

  // Merge API trip into local trips list (avoid duplicates)
  const trips: Trip[] = useMemo(() => {
    const combined = [...localTrips];
    if (apiTrip && !combined.some((t) => t.id === apiTrip.id)) {
      combined.unshift(apiTrip);
    }
    return combined;
  }, [localTrips, apiTrip]);

  // Resolve active trip: use activeTripId if set, otherwise fall back to API trip
  const trip: Trip | null = useMemo(() => {
    if (activeTripId) {
      const found = trips.find((t) => t.id === activeTripId);
      if (found) return { ...found, budget };
    }
    if (apiTrip) return { ...apiTrip, budget };
    return trips.length > 0 ? { ...trips[0], budget } : null;
  }, [activeTripId, trips, apiTrip, budget]);

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
      const currentIds =
        category === "flight"
          ? flights.filter((f) => f.id !== selectedFlightId).map((f) => f.id)
          : lodging.filter((l) => l.id !== selectedLodgingId).map((l) => l.id);

      setDecisions((prev) => {
        const filtered = prev.filter((d) => !currentIds.includes(d.optionId));
        return [
          ...filtered,
          ...currentIds.map((id) => ({
            optionId: id,
            category,
            status: "replacing" as const,
            timestamp: new Date().toISOString(),
          })),
        ];
      });

      setLocalAgentState(
        category === "flight" ? "Re-optimizing (Flights)" : "Re-optimizing (Lodging)",
      );
      addAction({
        id: `act-reopt-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: "optimize",
        summary: `Re-optimizing ${category}s — ${strategy}`,
        detail: `TripMaster is replacing current ${category} options based on the "${strategy}" strategy.`,
        smsSent: false,
      });

      modify.mutate();

      setTimeout(() => {
        if (category === "flight") {
          setFlights((prev) =>
            prev.map((f) => {
              if (f.id === selectedFlightId) return f;
              const idx = replacementFlightIdx.current % replacementFlights.length;
              const replacement = { ...replacementFlights[idx], id: `fl-rep-${Date.now()}-${idx}` };
              replacementFlightIdx.current += 1;
              return replacement;
            }),
          );
        } else {
          setLodging((prev) =>
            prev.map((l) => {
              if (l.id === selectedLodgingId) return l;
              const idx = replacementLodgingIdx.current % replacementLodging.length;
              const replacement = { ...replacementLodging[idx], id: `lg-rep-${Date.now()}-${idx}` };
              replacementLodgingIdx.current += 1;
              return replacement;
            }),
          );
        }

        setDecisions((prev) => prev.filter((d) => !currentIds.includes(d.optionId)));
        setLocalAgentState(null);

        addAction({
          id: `act-reopt-done-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: "optimize",
          summary: `Found new ${category} options — ${strategy}`,
          detail: `Replaced ${currentIds.length} options with better matches.`,
          smsSent: false,
        });
      }, 1800);
    },
    [flights, lodging, selectedFlightId, selectedLodgingId, addAction, modify],
  );

  const updateBudget = useCallback((n: number) => setBudget(n), []);

  // ── Trip management ──
  const switchTrip = useCallback(
    (tripId: string) => {
      setActiveTripId(tripId);
      setDecisions([]);
      setFlights(mockFlights);
      setLodging(mockLodging);
    },
    [],
  );

  const createTrip = useCallback(
    (tripData: Omit<Trip, "id" | "status">) => {
      const newTrip: Trip = {
        ...tripData,
        id: `trip-${Date.now()}`,
        status: "Planning",
      };
      setLocalTrips((prev) => [...prev, newTrip]);
      setActiveTripId(newTrip.id);
      setDecisions([]);
      setFlights(mockFlights);
      setLodging(mockLodging);

      addAction({
        id: `act-trip-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: "trip",
        summary: `Trip created: ${tripData.origin} → ${tripData.destination}`,
        detail: `New trip for ${tripData.travelers} traveler(s), ${tripData.departDate} to ${tripData.returnDate}, budget $${tripData.budget}.`,
        smsSent: false,
      });

      setLocalAgentState("Initializing");
      setTimeout(() => setLocalAgentState("Searching Flights"), 2000);
      setTimeout(() => setLocalAgentState(null), 5000);
    },
    [addAction],
  );

  const deleteTrip = useCallback(
    (tripId: string) => {
      setLocalTrips((prev) => {
        const remaining = prev.filter((t) => t.id !== tripId);
        if (tripId === activeTripId && remaining.length > 0) {
          setActiveTripId(remaining[0].id);
        } else if (tripId === activeTripId) {
          setActiveTripId(null);
        }
        return remaining;
      });
      setDecisions([]);

      addAction({
        id: `act-delete-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: "trip",
        summary: "Trip deleted",
        detail: "TripMaster removed the trip and its associated selections.",
        smsSent: false,
      });
    },
    [activeTripId, addAction],
  );

  // ── Loading / error ──
  const isLoading = tripQuery.isLoading;
  const error =
    tripQuery.error?.message ??
    reasoningQuery.error?.message ??
    logsQuery.error?.message ??
    null;

  return {
    // Data
    trip,
    trips,
    agentState,
    flights,
    lodging,
    actions,
    isLoading,
    error,

    // Trip management
    switchTrip,
    createTrip,
    deleteTrip,

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
