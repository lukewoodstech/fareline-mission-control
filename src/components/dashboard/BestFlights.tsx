import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FlightOption } from "@/types/travel";
import { Plane, Clock, ArrowRight } from "lucide-react";

const tagVariant: Record<string, "success" | "accent" | "status"> = {
  "Best Value": "success",
  "Fastest": "status",
  "Most Flexible": "accent",
};

interface BestFlightsProps {
  flights: FlightOption[];
}

export default function BestFlights({ flights }: BestFlightsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Plane className="h-4 w-4" />
          Best Flights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {flights.map((f) => (
          <div
            key={f.id}
            className="rounded-lg border border-border bg-secondary/30 p-4 hover:border-primary/30 transition-colors"
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
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
