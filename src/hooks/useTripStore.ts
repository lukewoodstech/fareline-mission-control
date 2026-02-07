import { useState, useCallback, useRef } from "react";
import type {
  Trip,
  FlightOption,
  LodgingOption,
  OptionDecision,
  AgentAction,
  AgentState,
} from "@/types/travel";
import {
  mockTrips,
  mockFlights,
  mockLodging,
  replacementFlights,
  replacementLodging,
} from "@/data/mockData";

interface TripStore {
  trips: Trip[];
  activeTrip: Trip;
  flights: FlightOption[];
  lodging: LodgingOption[];
  decisions: OptionDecision[];
  switchTrip: (tripId: string) => void;
  createTrip: (trip: Omit<Trip, "id" | "status">) => void;
  selectOption: (optionId: string, category: "flight" | "lodging") => void;
  unselectOption: (optionId: string, category: "flight" | "lodging") => void;
  rejectOption: (optionId: string, category: "flight" | "lodging", reason: string) => void;
  toggleMonitor: (optionId: string) => void;
  getDecision: (optionId: string) => OptionDecision | undefined;
  selectedFlightId: string | null;
  selectedLodgingId: string | null;
  addAction: (action: AgentAction) => void;
  setAgentState: (state: AgentState) => void;
  reoptimize: (category: "flight" | "lodging", strategy: string) => void;
}

export function useTripStore(
  onAddAction: (action: AgentAction) => void,
  onSetAgentState: (state: AgentState) => void,
): TripStore {
  const [trips, setTrips] = useState<Trip[]>(mockTrips);
  const [activeTripId, setActiveTripId] = useState(mockTrips[0].id);
  const [flights, setFlights] = useState<FlightOption[]>(mockFlights);
  const [lodging, setLodging] = useState<LodgingOption[]>(mockLodging);
  const [decisions, setDecisions] = useState<OptionDecision[]>([]);
  const replacementFlightIdx = useRef(0);
  const replacementLodgingIdx = useRef(0);

  const activeTrip = trips.find((t) => t.id === activeTripId) ?? trips[0];

  const selectedFlightId =
    decisions.find((d) => d.category === "flight" && d.status === "selected")?.optionId ?? null;
  const selectedLodgingId =
    decisions.find((d) => d.category === "lodging" && d.status === "selected")?.optionId ?? null;

  const getDecision = useCallback(
    (optionId: string) => decisions.find((d) => d.optionId === optionId),
    [decisions],
  );

  const switchTrip = useCallback((tripId: string) => {
    setActiveTripId(tripId);
    setDecisions([]);
  }, []);

  const createTrip = useCallback(
    (tripData: Omit<Trip, "id" | "status">) => {
      const newTrip: Trip = {
        ...tripData,
        id: `trip-${Date.now()}`,
        status: "Planning",
      };
      setTrips((prev) => [...prev, newTrip]);
      setActiveTripId(newTrip.id);
      setDecisions([]);
      setFlights(mockFlights);
      setLodging(mockLodging);

      const action: AgentAction = {
        id: `act-trip-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: "trip",
        summary: `Trip created: ${tripData.origin} → ${tripData.destination}`,
        detail: `New trip for ${tripData.travelers} traveler(s), ${tripData.departDate} to ${tripData.returnDate}, budget $${tripData.budget}.`,
        smsSent: false,
      };
      onAddAction(action);

      onSetAgentState("Initializing");
      setTimeout(() => onSetAgentState("Searching Flights"), 2000);
      setTimeout(() => {
        onSetAgentState("Searching Lodging");
        const searchAction: AgentAction = {
          id: `act-search-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: "search",
          summary: `TripMaster initiated search for ${tripData.origin} → ${tripData.destination}`,
          detail: `Scanning flights and lodging for your trip.`,
          smsSent: false,
        };
        onAddAction(searchAction);
      }, 4000);
      setTimeout(() => onSetAgentState("Monitoring"), 6000);
    },
    [onAddAction, onSetAgentState],
  );

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

      const otherCategory = category === "flight" ? "lodging" : "flight";
      const otherSelected = decisions.find(
        (d) => d.category === otherCategory && d.status === "selected",
      );

      if (otherSelected) {
        setTrips((prev) =>
          prev.map((t) => (t.id === activeTripId ? { ...t, status: "Locked" as const } : t)),
        );
      }
    },
    [decisions, activeTripId],
  );

  const unselectOption = useCallback(
    (optionId: string, category: "flight" | "lodging") => {
      setDecisions((prev) => prev.filter((d) => d.optionId !== optionId));

      // If trip was locked, downgrade back to monitoring
      setTrips((prev) =>
        prev.map((t) =>
          t.id === activeTripId && t.status === "Locked"
            ? { ...t, status: "Monitoring" as const }
            : t,
        ),
      );

      const action: AgentAction = {
        id: `act-unselect-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: "optimize",
        summary: `${category === "flight" ? "Flight" : "Lodging"} selection cleared`,
        detail: `TripMaster is ready to help you pick a new ${category} option.`,
        smsSent: false,
      };
      onAddAction(action);
    },
    [activeTripId, onAddAction],
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

      onSetAgentState(
        category === "flight" ? "Re-optimizing (Flights)" : "Re-optimizing (Lodging)",
      );

      const rejectAction: AgentAction = {
        id: `act-reject-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: "reject",
        summary: `Rejected ${category} option — "${reason}"`,
        detail: `User declined an option. TripMaster is finding a replacement based on the feedback.`,
        smsSent: false,
      };
      onAddAction(rejectAction);

      setTimeout(() => {
        if (category === "flight") {
          const idx = replacementFlightIdx.current % replacementFlights.length;
          const replacement = {
            ...replacementFlights[idx],
            id: `fl-rep-${Date.now()}`,
          };
          replacementFlightIdx.current += 1;

          setFlights((prev) => prev.map((f) => (f.id === optionId ? replacement : f)));
        } else {
          const idx = replacementLodgingIdx.current % replacementLodging.length;
          const replacement = {
            ...replacementLodging[idx],
            id: `lg-rep-${Date.now()}`,
          };
          replacementLodgingIdx.current += 1;

          setLodging((prev) => prev.map((l) => (l.id === optionId ? replacement : l)));
        }

        setDecisions((prev) => prev.filter((d) => d.optionId !== optionId));
        onSetAgentState("Monitoring");

        const replaceAction: AgentAction = {
          id: `act-replace-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: "optimize",
          summary: `Replaced ${category} option with a new find`,
          detail: `Found a better match based on your feedback: "${reason}".`,
          smsSent: false,
        };
        onAddAction(replaceAction);
      }, 2500);
    },
    [onAddAction, onSetAgentState],
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
      // Mark all non-selected options as replacing
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

      onSetAgentState(
        category === "flight" ? "Re-optimizing (Flights)" : "Re-optimizing (Lodging)",
      );

      const reoptAction: AgentAction = {
        id: `act-reopt-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: "optimize",
        summary: `Re-optimizing ${category}s — ${strategy}`,
        detail: `TripMaster is replacing current ${category} options based on the "${strategy}" strategy.`,
        smsSent: false,
      };
      onAddAction(reoptAction);

      setTimeout(() => {
        if (category === "flight") {
          setFlights((prev) =>
            prev.map((f) => {
              if (f.id === selectedFlightId) return f;
              const idx = replacementFlightIdx.current % replacementFlights.length;
              const replacement = {
                ...replacementFlights[idx],
                id: `fl-rep-${Date.now()}-${idx}`,
              };
              replacementFlightIdx.current += 1;
              return replacement;
            }),
          );
        } else {
          setLodging((prev) =>
            prev.map((l) => {
              if (l.id === selectedLodgingId) return l;
              const idx = replacementLodgingIdx.current % replacementLodging.length;
              const replacement = {
                ...replacementLodging[idx],
                id: `lg-rep-${Date.now()}-${idx}`,
              };
              replacementLodgingIdx.current += 1;
              return replacement;
            }),
          );
        }

        setDecisions((prev) => prev.filter((d) => !currentIds.includes(d.optionId)));
        onSetAgentState("Monitoring");

        const doneAction: AgentAction = {
          id: `act-reopt-done-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: "optimize",
          summary: `Found new ${category} options — ${strategy}`,
          detail: `Replaced ${currentIds.length} options with better matches.`,
          smsSent: false,
        };
        onAddAction(doneAction);
      }, 1800);
    },
    [flights, lodging, selectedFlightId, selectedLodgingId, onAddAction, onSetAgentState],
  );

  return {
    trips,
    activeTrip,
    flights,
    lodging,
    decisions,
    switchTrip,
    createTrip,
    selectOption,
    unselectOption,
    rejectOption,
    toggleMonitor,
    getDecision,
    selectedFlightId,
    selectedLodgingId,
    addAction: onAddAction,
    setAgentState: onSetAgentState,
    reoptimize,
  };
}
