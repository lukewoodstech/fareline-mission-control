import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AgentState, Trip } from "@/types/travel";
import { Activity, Loader2, Pause, Search, CheckCircle2, Eye, PauseCircle } from "lucide-react";
import { useState, useEffect } from "react";

const stateConfig: Record<AgentState, { icon: React.ElementType; color: string; badgeVariant: "status" | "success" | "accent" | "muted" | "destructive"; phase: string; taskText: string }> = {
  "Idle": { icon: Pause, color: "text-muted-foreground", badgeVariant: "muted", phase: "Idle", taskText: "Standing by" },
  "Initializing": { icon: Loader2, color: "text-primary", badgeVariant: "status", phase: "Scanning", taskText: "Connecting to booking sources…" },
  "Searching Flights": { icon: Search, color: "text-primary", badgeVariant: "status", phase: "Scanning", taskText: "Scanning airlines and fare classes…" },
  "Searching Lodging": { icon: Search, color: "text-primary", badgeVariant: "status", phase: "Filtering", taskText: "Filtering lodging by your preferences…" },
  "Re-optimizing": { icon: Loader2, color: "text-accent", badgeVariant: "accent", phase: "Ranking", taskText: "Re-ranking options with new criteria…" },
  "Re-optimizing (Flights)": { icon: Loader2, color: "text-accent", badgeVariant: "accent", phase: "Comparing", taskText: "Comparing nonstop flight options…" },
  "Re-optimizing (Lodging)": { icon: Loader2, color: "text-accent", badgeVariant: "accent", phase: "Comparing", taskText: "Comparing lodging alternatives…" },
  "Waiting for Approval": { icon: CheckCircle2, color: "text-accent", badgeVariant: "accent", phase: "Awaiting", taskText: "Waiting for your decision…" },
  "Monitoring": { icon: Eye, color: "text-success", badgeVariant: "success", phase: "Monitoring", taskText: "Watching for price drops and new deals" },
  "Paused": { icon: PauseCircle, color: "text-muted-foreground", badgeVariant: "muted", phase: "Paused", taskText: "Monitoring paused" },
};

const PHASES = ["Scanning", "Filtering", "Ranking", "Comparing", "Monitoring"] as const;

interface AgentStatusProps {
  state: AgentState;
  trip: Trip;
}

export default function AgentStatus({ state, trip }: AgentStatusProps) {
  const config = stateConfig[state];
  const Icon = config.icon;
  const isAnimating = ["Initializing", "Searching Flights", "Searching Lodging", "Re-optimizing", "Re-optimizing (Flights)", "Re-optimizing (Lodging)"].includes(state);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isAnimating) {
      setElapsed(0);
      return;
    }
    setElapsed(0);
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [isAnimating, state]);

  const currentPhaseIndex = PHASES.indexOf(config.phase as typeof PHASES[number]);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Agent Status
          </CardTitle>
          <Badge variant={config.badgeVariant} className="text-xs">
            <Icon className={`h-3 w-3 mr-1 ${isAnimating ? "animate-spin" : ""}`} />
            {state}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Current Objective</p>
          <p className="font-mono text-sm font-medium">
            {trip.origin} → {trip.destination}, {trip.departDate.slice(5)} – {trip.returnDate.slice(5)}, budget ${trip.budget}
          </p>
        </div>

        {/* Phase pipeline instead of numbered steps */}
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Agent Phase</span>
            {isAnimating && (
              <span className="font-mono text-primary">{elapsed}s elapsed</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {PHASES.map((phase, i) => {
              const isActive = config.phase === phase;
              const isPast = currentPhaseIndex >= 0 && i < currentPhaseIndex;
              const isPaused = state === "Paused";
              return (
                <div key={phase} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                      isActive
                        ? "bg-primary animate-pulse"
                        : isPast
                        ? "bg-primary/40"
                        : isPaused
                        ? "bg-muted-foreground/20"
                        : "bg-secondary"
                    }`}
                  />
                  <span
                    className={`text-[9px] font-mono transition-colors ${
                      isActive ? "text-primary font-semibold" : isPast ? "text-muted-foreground" : "text-muted-foreground/40"
                    }`}
                  >
                    {phase}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className={`h-2 w-2 rounded-full ${isAnimating ? "bg-primary animate-status-pulse" : state === "Monitoring" ? "bg-success" : state === "Paused" ? "bg-muted-foreground" : "bg-muted-foreground"}`} />
          <span className="font-mono">{config.taskText}</span>
        </div>
      </CardContent>
    </Card>
  );
}
