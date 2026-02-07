/**
 * Backend API types — exact match to the TripMaster backend contract.
 * These should NOT be modified unless the backend contract changes.
 */

export type TripState =
  | "idle"
  | "collecting_info"
  | "planning"
  | "monitoring"
  | "recovery"
  | "completed";

export interface TripConstraints {
  from?: string | null;
  to?: string | null;
  depart?: string | null; // YYYY-MM-DD
  return?: string | null; // YYYY-MM-DD
  travelers?: number | null;
}

export interface FlightOffer {
  id: string;
  from: string;
  to: string;
  depart: string; // ISO Date string
  price: string; // Total price as string
  bookingLink: string;
  status: "on-time" | "delayed" | "cancelled";
}

export interface HotelOffer {
  id: string;
  name: string;
  city: string;
  checkin: string; // YYYY-MM-DD
  checkout: string; // YYYY-MM-DD
  price: string; // Total price as string
  bookingLink: string;
}

export interface TripPlan {
  flight: FlightOffer;
  hotel: HotelOffer;
  flightOptions: FlightOffer[];
  hotelOptions: HotelOffer[];
}

export interface ApiTrip {
  id: string;
  userPhone: string;
  state: TripState;
  constraints: TripConstraints;
  plan: TripPlan | null;
  reasoning: string[];
  logs: string[];
}

// ── Response shapes ──

export interface TripResponse {
  trip: ApiTrip | null;
}

export interface ReasoningResponse {
  reasoning: string[];
}

export interface LogsResponse {
  logs: string[];
}

export interface ActionResponse {
  success: boolean;
  message?: string;
}
