/**
 * React Query hooks for TripMaster backend API.
 *
 * These hooks can be swapped in for mock data when the backend is available.
 * Usage: const { data, isLoading, error } = useTripQuery();
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  mapApiTripToTrip,
  mapApiTripToAgentState,
  mapFlightOfferToOption,
  mapHotelOfferToLodging,
  mapReasoningToActions,
  mapLogsToActions,
} from "@/lib/mappers";
import type { Trip, FlightOption, LodgingOption, AgentAction, AgentState } from "@/types/travel";

// ── Query keys ──

export const queryKeys = {
  trip: ["trip"] as const,
  reasoning: ["reasoning"] as const,
  logs: ["logs"] as const,
};

// ── Hooks ──

/** Fetch current trip and map to frontend types */
export function useTripQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.trip,
    queryFn: async () => {
      const { trip } = await api.getTrip();
      if (!trip) return null;

      const mapped: {
        trip: Trip;
        agentState: AgentState;
        flights: FlightOption[];
        lodging: LodgingOption[];
      } = {
        trip: mapApiTripToTrip(trip),
        agentState: mapApiTripToAgentState(trip),
        flights: trip.plan?.flightOptions.map(mapFlightOfferToOption) ?? [],
        lodging: trip.plan?.hotelOptions.map(mapHotelOfferToLodging) ?? [],
      };

      return mapped;
    },
    enabled,
    refetchInterval: 5000, // Poll every 5s for live updates
  });
}

/** Fetch AI reasoning logs */
export function useReasoningQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.reasoning,
    queryFn: async (): Promise<AgentAction[]> => {
      const { reasoning } = await api.getReasoning();
      return mapReasoningToActions(reasoning);
    },
    enabled,
    refetchInterval: 5000,
  });
}

/** Fetch system logs */
export function useLogsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.logs,
    queryFn: async (): Promise<AgentAction[]> => {
      const { logs } = await api.getLogs();
      return mapLogsToActions(logs);
    },
    enabled,
    refetchInterval: 5000,
  });
}

// ── Mutations ──

export function useSimulateDelay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.simulateDelay,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.trip });
      qc.invalidateQueries({ queryKey: queryKeys.logs });
    },
  });
}

export function useSimulateCancel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.simulateCancel,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.trip });
      qc.invalidateQueries({ queryKey: queryKeys.logs });
    },
  });
}

export function useApproveTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.approve,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.trip });
    },
  });
}

export function useModifyTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.modify,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.trip });
    },
  });
}
