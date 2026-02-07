import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ExternalLink, Check, ThumbsDown, RotateCcw, Eye } from "lucide-react";
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
  onUnselect: () => void;
}

export default function OptionActions({
  category,
  bookingUrl,
  decision,
  isSelected,
  onSelect,
  onReject,
  onToggleMonitor,
  onUnselect,
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
      <div className="pt-3 mt-3 border-t border-border/20 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="success" className="text-xs gap-1 py-0.5">
              <Check className="h-3 w-3" />
              Selected
            </Badge>
            <span className="text-[11px] text-muted-foreground">
              TripMaster is optimizing around this choice
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={bookingUrl ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
              >
                <ExternalLink className="h-3 w-3" />
                Book on {category === "flight" ? "airline" : "hotel"} site
              </a>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Opens external booking page
            </TooltipContent>
          </Tooltip>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleMonitor}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                decision?.monitorPrice
                  ? "bg-primary/15 text-primary"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <Eye className="h-3 w-3" />
              {decision?.monitorPrice ? "Monitoring price" : "Watch price"}
            </button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs px-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={onUnselect}
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Unselect
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-3 mt-3 border-t border-border/20 space-y-2">
      <div className="flex items-center justify-between">
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href={bookingUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-primary hover:underline flex items-center gap-1 transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              Book on {category === "flight" ? "airline" : "hotel"} site
            </a>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Opens external booking page
          </TooltipContent>
        </Tooltip>
        <div className="flex items-center gap-2">
          <Button
            variant="success"
            size="sm"
            className="h-8 text-xs px-4 font-medium"
            onClick={onSelect}
          >
            <Check className="h-3.5 w-3.5 mr-1.5" />
            Select
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs px-3 border-destructive/30 text-destructive/80 hover:text-destructive hover:bg-destructive/10 hover:border-destructive/50"
            onClick={handleRejectClick}
          >
            <ThumbsDown className="h-3.5 w-3.5 mr-1.5" />
            Reject
          </Button>
        </div>
      </div>

      {showReasons && (
        <div className="animate-slide-up space-y-2 bg-secondary/30 rounded-lg p-3">
          <p className="text-xs text-muted-foreground font-medium">
            Tell TripMaster why — it learns from your feedback
          </p>
          <div className="flex flex-wrap gap-1.5">
            {reasons.map((reason) => (
              <button
                key={reason}
                className="text-xs px-2.5 py-1.5 rounded-md bg-secondary hover:bg-destructive/20 hover:text-destructive text-secondary-foreground transition-colors cursor-pointer"
                onClick={() => handleReasonSelect(reason)}
              >
                {reason}
              </button>
            ))}
            <button
              className={`text-xs px-2.5 py-1.5 rounded-md transition-colors cursor-pointer ${
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
                placeholder="Tell TripMaster why…"
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
