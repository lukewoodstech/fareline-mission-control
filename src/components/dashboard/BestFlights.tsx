import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { FlightOption, OptionDecision } from "@/types/travel";
import { Plane, Clock, ArrowRight, Check } from "lucide-react";
import OptionActions from "./OptionActions";

const tagLabels: Record<string, string> = {
  "Best Value": "Best Value — based on your preferences",
  "Fastest": "Fastest option found so far",
  "Most Flexible": "Most Flexible — change-friendly fare",
};

const tagVariant: Record<string, "success" | "accent" | "status"> = {
  "Best Value": "success",
  "Fastest": "status",
  "Most Flexible": "accent",
};

interface BestFlightsProps {
  flights: FlightOption[];
  selectedId: string | null;
  getDecision: (id: string) => OptionDecision | undefined;
  onSelect: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onToggleMonitor: (id: string) => void;
  onUnselect: (id: string) => void;
}

export default function BestFlights({
  flights,
  selectedId,
  getDecision,
  onSelect,
  onReject,
  onToggleMonitor,
  onUnselect,
}: BestFlightsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Plane className="h-4 w-4" />
            Best Flights
          </CardTitle>
          <span className="text-[11px] text-muted-foreground">
            Monitoring for better prices
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {flights.map((f) => {
          const decision = getDecision(f.id);
          const isReplacing = decision?.status === "replacing";
          const isSelected = f.id === selectedId;
          const isDeemphasized = selectedId !== null && !isSelected;

          if (isReplacing) {
            return (
              <div
                key={f.id}
                className="rounded-lg bg-secondary/20 p-3.5 space-y-2.5 animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-14" />
                </div>
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-3 w-36" />
                <p className="text-xs text-primary font-medium animate-pulse-glow">
                  TripMaster is finding a better option…
                </p>
              </div>
            );
          }

          return (
            <div
              key={f.id}
              className={`rounded-lg p-3.5 transition-all duration-200 ${
                isSelected
                  ? "bg-primary/8 ring-1 ring-primary/30 shadow-md shadow-primary/5"
                  : isDeemphasized
                  ? "bg-secondary/10 opacity-40 hover:opacity-60"
                  : "bg-elevated/50 hover:bg-elevated/80 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isSelected && <Check className="h-3.5 w-3.5 text-success" />}
                  <span className="font-semibold text-sm">{f.airline}</span>
                  {f.tag && (
                    <Badge variant={tagVariant[f.tag]} className="text-[10px]">
                      {tagLabels[f.tag] ?? f.tag}
                    </Badge>
                  )}
                </div>
                <span className="text-lg font-bold font-mono text-primary">${f.price}</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-1.5">
                <span className="font-mono">{f.departure}</span>
                <ArrowRight className="h-3 w-3" />
                <span className="font-mono">{f.arrival}</span>
                <span className="flex items-center gap-1 ml-auto">
                  <Clock className="h-3 w-3" />
                  {f.duration}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{f.stops === 0 ? "Nonstop" : `${f.stops} stop`}</span>
                <span>·</span>
                <span>{f.cabin}</span>
                <span>·</span>
                <span className="font-mono">Class {f.bookingClass}</span>
              </div>

              <OptionActions
                optionId={f.id}
                category="flight"
                bookingUrl={f.bookingUrl}
                decision={decision}
                isSelected={isSelected}
                onSelect={() => onSelect(f.id)}
                onReject={(reason) => onReject(f.id, reason)}
                onToggleMonitor={() => onToggleMonitor(f.id)}
                onUnselect={() => onUnselect(f.id)}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
