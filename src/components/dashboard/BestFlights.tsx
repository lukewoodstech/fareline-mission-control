import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { FlightOption, OptionDecision } from "@/types/travel";
import { Plane, Clock, ArrowRight } from "lucide-react";
import OptionActions from "./OptionActions";

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
}

export default function BestFlights({
  flights,
  selectedId,
  getDecision,
  onSelect,
  onReject,
  onToggleMonitor,
}: BestFlightsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Plane className="h-4 w-4" />
          Best Flights
        </CardTitle>
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
                className="rounded-lg border border-border bg-secondary/30 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-3 w-36" />
                <p className="text-xs text-muted-foreground animate-pulse-glow">
                  Finding a better option…
                </p>
              </div>
            );
          }

          return (
            <div
              key={f.id}
              className={`rounded-lg border p-4 transition-all ${
                isSelected
                  ? "border-success/50 bg-success/5 ring-1 ring-success/20"
                  : isDeemphasized
                  ? "border-border bg-secondary/10 opacity-60"
                  : "border-border bg-secondary/30 hover:border-primary/30"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{f.airline}</span>
                  {f.tag && <Badge variant={tagVariant[f.tag]}>{f.tag}</Badge>}
                </div>
                <span className="text-xl font-bold font-mono text-primary">${f.price}</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
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
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
