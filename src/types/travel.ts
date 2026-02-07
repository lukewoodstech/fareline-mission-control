export type AgentState =
  | "Idle"
  | "Initializing"
  | "Searching Flights"
  | "Searching Lodging"
  | "Re-optimizing"
  | "Re-optimizing (Flights)"
  | "Re-optimizing (Lodging)"
  | "Waiting for Approval"
  | "Monitoring";

export type TripStatus = "Planning" | "Monitoring" | "Locked";

export interface Trip {
  id: string;
  origin: string;
  destination: string;
  departDate: string;
  returnDate: string;
  budget: number;
  travelers: number;
  status: TripStatus;
  dateFlexible?: boolean;
  preferenceBias?: "cheaper" | "comfort" | "balanced";
}

export interface Preferences {
  avoidRedEyes: boolean;
  preferNonstop: boolean;
  maxStops: number;
  minHotelRating: number;
  preferWindow: boolean;
  earlyCheckIn: boolean;
}

export interface AgentAction {
  id: string;
  timestamp: string;
  type: "search" | "compare" | "alert" | "optimize" | "monitor" | "sms" | "trip" | "reject";
  summary: string;
  detail: string;
  rationale?: string[];
  smsSent: boolean;
}

export interface FlightOption {
  id: string;
  airline: string;
  price: number;
  departure: string;
  arrival: string;
  duration: string;
  stops: number;
  tag?: "Best Value" | "Fastest" | "Most Flexible";
  cabin: string;
  bookingClass: string;
  bookingUrl?: string;
}

export interface LodgingOption {
  id: string;
  name: string;
  price: number;
  perNight: number;
  rating: number;
  reviewCount: number;
  amenities: string[];
  tag?: "Best Value" | "Top Rated" | "Best Location";
  neighborhood: string;
  cancellation: string;
  bookingUrl?: string;
}

export type FlightRejectReason =
  | "Too expensive"
  | "Bad times"
  | "Too many stops"
  | "Too long"
  | "Airline preference"
  | "Layover too risky";

export type LodgingRejectReason =
  | "Too expensive"
  | "Wrong location"
  | "Low rating"
  | "No free cancellation"
  | "Not the vibe"
  | "Amenities missing";

export interface OptionDecision {
  optionId: string;
  category: "flight" | "lodging";
  status: "selected" | "rejected" | "replacing" | "none";
  rejectReason?: string;
  monitorPrice?: boolean;
  timestamp?: string;
}

export interface ImpactMetrics {
  moneySaved: number;
  baselinePrice: number;
  timeSavedHours: number;
  alertsSent: number;
  optionsEvaluated: number;
}

export interface SearchRun {
  id: string;
  startedAt: string;
  completedAt?: string;
  status: "running" | "completed" | "paused";
  flightsScanned: number;
  lodgingScanned: number;
}
