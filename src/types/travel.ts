export type AgentState =
  | "Idle"
  | "Initializing"
  | "Searching Flights"
  | "Searching Lodging"
  | "Searching Activities"
  | "Re-optimizing"
  | "Re-optimizing (Flights)"
  | "Re-optimizing (Lodging)"
  | "Re-optimizing (Activities)"
  | "Waiting for Approval"
  | "Monitoring"
  | "Paused";

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

export type ActivityCategory = "Food" | "Outdoor" | "Culture" | "Event" | "Relaxation";

export interface ActivityOption {
  id: string;
  title: string;
  category: ActivityCategory;
  description: string;
  duration: string;
  suggestedDay: number;
  suggestedTime?: string;
  price: number | null;
  tag?: "Top Pick" | "Local Gem" | "Must Do";
  bookingUrl?: string;
}

export type ActivityRejectReason =
  | "Not interested"
  | "Too expensive"
  | "Wrong vibe"
  | "Too long"
  | "Bad timing"
  | "Already planned something similar";

export interface PlannedActivity {
  activityId: string;
  activity: ActivityOption;
  day: number;
  order: number;
}

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
