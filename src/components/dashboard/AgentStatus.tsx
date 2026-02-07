import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AgentState, Trip } from "@/types/travel";
import { Activity, Loader2, Pause, Search, CheckCircle2, Eye, PauseCircle } from "lucide-react";
import { useState, useEffect } from "react";

const stateConfig: Record<AgentState, { icon: React.ElementType; color: string; badgeVariant: "status" | "success" | "accent" | "muted" | "destructive"; modeText: string; taskText: string }> = {
  "Idle": { icon: Pause, color: "text-muted-foreground", badgeVariant: "muted", modeText: "Idle", taskText: "Standing by" },
  "Initializing": { icon: Loader2, color: "text-primary", badgeVariant: "status", modeText: "Initializing", taskText: "Connecting to booking sources…" },
  "Searching Flights": { icon: Search, color: "text-primary", badgeVariant: "status", modeText: "Searching", taskText: "Scanning airlines and fare classes…" },
  "Searching Lodging": { icon: Search, color: "text-primary", badgeVariant: "status", modeText: "Searching", taskText: "Filtering lodging by your preferences…" },
  "Searching Activities": { icon: Search, color: "text-primary", badgeVariant: "status", modeText: "Searching", taskText: "Discovering activities for your trip…" },
  "Re-optimizing": { icon: Loader2, color: "text-accent", badgeVariant: "accent", modeText: "Re-optimizing", taskText: "Re-ranking options with new criteria…" },
  "Re-optimizing (Flights)": { icon: Loader2, color: "text-accent", badgeVariant: "accent", modeText: "Re-optimizing", taskText: "Comparing nonstop flight options…" },
  "Re-optimizing (Lodging)": { icon: Loader2, color: "text-accent", badgeVariant: "accent", modeText: "Re-optimizing", taskText: "Comparing lodging alternatives…" },
  "Re-optimizing (Activities)": { icon: Loader2, color: "text-accent", badgeVariant: "accent", modeText: "Re-optimizing", taskText: "Curating better activities for you…" },
  "Waiting for Approval": { icon: CheckCircle2, color: "text-accent", badgeVariant: "accent", modeText: "Awaiting approval", taskText: "Waiting for your decision…" },
  "Monitoring": { icon: Eye, color: "text-success", badgeVariant: "success", modeText: "Monitoring", taskText: "Watching for price drops and new deals" },
  "Paused": { icon: PauseCircle, color: "text-muted-foreground", badgeVariant: "muted", modeText: "Paused", taskText: "Monitoring paused" },
};

interface AgentStatusProps {
  state: AgentState;
  trip: Trip;
}

export default function AgentStatus({ state, trip }: AgentStatusProps) {
  const config = stateConfig[state];
  const Icon = config.icon;
  const isActive = !["Idle", "Paused"].includes(state);
  const isMonitoring = state === "Monitoring";
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setElapsed(0);
      return;
    }
    setElapsed(0);
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [isActive, state]);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Agent Status
          </CardTitle>
          <Badge variant={config.badgeVariant} className="text-xs">
            <Icon className={`h-3 w-3 mr-1 ${isActive && !isMonitoring ? "animate-spin" : ""}`} />
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

        {/* Agent Mode — honest, non-linear indicator */}
        <div className="rounded-lg bg-secondary/40 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Agent Mode</span>
            {isActive && !isMonitoring && (
              <span className="text-[11px] font-mono text-primary">{elapsed}s elapsed</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Heartbeat dot */}
            <div className="relative flex items-center justify-center">
              <div className={`h-3 w-3 rounded-full ${
                isMonitoring ? "bg-success" :
                isActive ? "bg-primary" :
                "bg-muted-foreground/40"
              }`} />
              {(isActive || isMonitoring) && (
                <div className={`absolute inset-0 h-3 w-3 rounded-full animate-ping opacity-75 ${
                  isMonitoring ? "bg-success" : "bg-primary"
                }`} />
              )}
            </div>
            <p className="text-sm font-medium">
              {isMonitoring
                ? "Monitoring prices and options in real time"
                : isActive
                ? config.taskText
                : config.taskText
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className={`h-2 w-2 rounded-full ${isActive ? "bg-primary animate-status-pulse" : isMonitoring ? "bg-success" : "bg-muted-foreground"}`} />
          <span className="font-mono">{config.taskText}</span>
        </div>
      </CardContent>
    </Card>
  );
}
