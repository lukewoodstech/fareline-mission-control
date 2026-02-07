export type AgentState =
  | "Idle"
  | "Searching Flights"
  | "Searching Lodging"
  | "Re-optimizing"
  | "Waiting for Approval"
  | "Monitoring";

export interface Trip {
  id: string;
  origin: string;
  destination: string;
  departDate: string;
  returnDate: string;
  budget: number;
  travelers: number;
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
  type: "search" | "compare" | "alert" | "optimize" | "monitor" | "sms";
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
