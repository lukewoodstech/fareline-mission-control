import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, Check, X } from "lucide-react";
import type { FlightRejectReason, LodgingRejectReason, OptionDecision } from "@/types/travel";

const FLIGHT_REASONS: FlightRejectReason[] = [
  "Too expensive",
  "Bad times",
  "Too many stops",
  "Too long",
  "Airline preference",
  "Layover too risky",
];

const LODGING_REASONS: LodgingRejectReason[] = [
  "Too expensive",
  "Wrong location",
  "Low rating",
  "No free cancellation",
  "Not the vibe",
  "Amenities missing",
];

interface OptionActionsProps {
  optionId: string;
  category: "flight" | "lodging";
  bookingUrl?: string;
  decision?: OptionDecision;
  isSelected: boolean;
  onSelect: () => void;
  onReject: (reason: string) => void;
  onToggleMonitor: () => void;
}

export default function OptionActions({
  category,
  bookingUrl,
  decision,
  isSelected,
  onSelect,
  onReject,
  onToggleMonitor,
}: OptionActionsProps) {
  const [showReasons, setShowReasons] = useState(false);
  const [otherReason, setOtherReason] = useState("");
  const [showOtherInput, setShowOtherInput] = useState(false);

  const reasons = category === "flight" ? FLIGHT_REASONS : LODGING_REASONS;

  const handleRejectClick = () => {
    setShowReasons(true);
  };

  const handleReasonSelect = (reason: string) => {
    onReject(reason);
    setShowReasons(false);
    setShowOtherInput(false);
    setOtherReason("");
  };

  const handleOtherSubmit = () => {
    if (otherReason.trim()) {
      onReject(otherReason.trim());
      setShowReasons(false);
      setShowOtherInput(false);
      setOtherReason("");
    }
  };

  if (isSelected) {
    return (
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-border">
        <a
          href={bookingUrl ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          <ExternalLink className="h-3 w-3" />
          Book
        </a>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={decision?.monitorPrice ?? false}
              onChange={onToggleMonitor}
              className="rounded border-border"
            />
            Monitor price
          </label>
          <span className="text-xs text-success font-medium flex items-center gap-1">
            <Check className="h-3 w-3" />
            Selected
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-3 mt-3 border-t border-border space-y-2">
      <div className="flex items-center justify-between">
        <a
          href={bookingUrl ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          <ExternalLink className="h-3 w-3" />
          Book
        </a>
        <div className="flex items-center gap-1.5">
          <Button
            variant="success"
            size="sm"
            className="h-7 text-xs px-2.5"
            onClick={onSelect}
          >
            <Check className="h-3 w-3 mr-1" />
            Yes
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs px-2.5 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleRejectClick}
          >
            <X className="h-3 w-3 mr-1" />
            No
          </Button>
        </div>
      </div>

      {showReasons && (
        <div className="animate-slide-up space-y-2">
          <p className="text-xs text-muted-foreground">Why not this one?</p>
          <div className="flex flex-wrap gap-1.5">
            {reasons.map((reason) => (
              <button
                key={reason}
                className="text-xs px-2.5 py-1 rounded-md bg-secondary hover:bg-destructive/20 hover:text-destructive text-secondary-foreground transition-colors cursor-pointer"
                onClick={() => handleReasonSelect(reason)}
              >
                {reason}
              </button>
            ))}
            <button
              className={`text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                showOtherInput
                  ? "bg-primary/20 text-primary"
                  : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
              }`}
              onClick={() => setShowOtherInput(!showOtherInput)}
            >
              Other…
            </button>
          </div>
          {showOtherInput && (
            <div className="flex gap-1.5 animate-slide-up">
              <Input
                placeholder="Tell the agent why…"
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                className="h-7 text-xs"
                maxLength={100}
                onKeyDown={(e) => e.key === "Enter" && handleOtherSubmit()}
              />
              <Button
                size="sm"
                className="h-7 text-xs px-3"
                disabled={!otherReason.trim()}
                onClick={handleOtherSubmit}
              >
                Send
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
