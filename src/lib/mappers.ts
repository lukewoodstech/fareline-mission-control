/**
 * Maps backend API types → frontend display types.
 *
 * The frontend has a richer data model (multiple options, tags, amenities, etc.)
 * so these mappers provide sensible defaults for fields the backend doesn't supply.
 */
import type { ApiTrip, FlightOffer, HotelOffer, TripState } from "@/types/api";
import type {
  Trip,
  TripStatus,
  FlightOption,
  LodgingOption,
  AgentAction,
  AgentState,
} from "@/types/travel";

// ── Trip State mapping ──

const stateToStatus: Record<TripState, TripStatus> = {
  idle: "Planning",
  collecting_info: "Planning",
  planning: "Planning",
  monitoring: "Monitoring",
  recovery: "Monitoring",
  completed: "Locked",
};

const stateToAgentState: Record<TripState, AgentState> = {
  idle: "Idle",
  collecting_info: "Initializing",
  planning: "Searching Flights",
  monitoring: "Monitoring",
  recovery: "Re-optimizing",
  completed: "Idle",
};

export function mapApiTripToTrip(apiTrip: ApiTrip): Trip {
  return {
    id: apiTrip.id,
    origin: apiTrip.constraints.from ?? "???",
    destination: apiTrip.constraints.to ?? "???",
    departDate: apiTrip.constraints.depart ?? "",
    returnDate: apiTrip.constraints.return ?? "",
    budget: 0, // Backend doesn't track budget; frontend can overlay
    travelers: apiTrip.constraints.travelers ?? 1,
    status: stateToStatus[apiTrip.state],
  };
}

export function mapApiTripToAgentState(apiTrip: ApiTrip): AgentState {
  return stateToAgentState[apiTrip.state];
}

// ── Flight mapping ──

export function mapFlightOfferToOption(
  offer: FlightOffer,
  index: number,
): FlightOption {
  const tags: FlightOption["tag"][] = ["Best Value", "Fastest", "Most Flexible"];

  return {
    id: offer.id,
    airline: extractAirline(offer.from, offer.to),
    price: parseFloat(offer.price) || 0,
    departure: formatTime(offer.depart),
    arrival: "", // Backend doesn't provide arrival time
    duration: "", // Backend doesn't provide duration
    stops: 0, // Backend doesn't provide stop count
    cabin: "Economy",
    bookingClass: "",
    bookingUrl: offer.bookingLink,
    tag: index < tags.length ? tags[index] : undefined,
  };
}

// ── Hotel mapping ──

export function mapHotelOfferToLodging(
  offer: HotelOffer,
  index: number,
): LodgingOption {
  const tags: LodgingOption["tag"][] = ["Best Value", "Top Rated", "Best Location"];
  const nights = calculateNights(offer.checkin, offer.checkout);
  const totalPrice = parseFloat(offer.price) || 0;

  return {
    id: offer.id,
    name: offer.name,
    price: totalPrice,
    perNight: nights > 0 ? Math.round(totalPrice / nights) : totalPrice,
    rating: 0, // Backend doesn't provide rating
    reviewCount: 0,
    amenities: [],
    neighborhood: offer.city,
    cancellation: "",
    bookingUrl: offer.bookingLink,
    tag: index < tags.length ? tags[index] : undefined,
  };
}

// ── Reasoning / Logs → AgentAction mapping ──

export function mapReasoningToActions(reasoning: string[]): AgentAction[] {
  return reasoning.map((text, i) => ({
    id: `reason-${i}`,
    timestamp: new Date().toISOString(),
    type: "compare" as const,
    summary: text.length > 80 ? text.slice(0, 77) + "…" : text,
    detail: text,
    smsSent: false,
  }));
}

export function mapLogsToActions(logs: string[]): AgentAction[] {
  return logs.map((text, i) => ({
    id: `log-${i}`,
    timestamp: new Date().toISOString(),
    type: inferLogType(text),
    summary: text.length > 80 ? text.slice(0, 77) + "…" : text,
    detail: text,
    smsSent: text.toLowerCase().includes("sms"),
  }));
}

// ── Helpers ──

function extractAirline(_from: string, _to: string): string {
  return "Airline"; // Placeholder — backend doesn't provide airline name
}

function formatTime(isoString: string): string {
  try {
    return new Date(isoString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

function calculateNights(checkin: string, checkout: string): number {
  try {
    const diff = new Date(checkout).getTime() - new Date(checkin).getTime();
    return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
  } catch {
    return 1;
  }
}

function inferLogType(text: string): AgentAction["type"] {
  const lower = text.toLowerCase();
  if (lower.includes("sms") || lower.includes("message")) return "sms";
  if (lower.includes("search") || lower.includes("scan")) return "search";
  if (lower.includes("alert") || lower.includes("drop")) return "alert";
  if (lower.includes("optim") || lower.includes("re-")) return "optimize";
  if (lower.includes("monitor")) return "monitor";
  return "compare";
}
