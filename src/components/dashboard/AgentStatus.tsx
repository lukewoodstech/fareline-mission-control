import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { AgentState, Trip } from "@/types/travel";
import { Activity, Loader2, Pause, Search, CheckCircle2, Eye } from "lucide-react";

const stateConfig: Record<AgentState, { icon: React.ElementType; color: string; badgeVariant: "status" | "success" | "accent" | "muted" }> = {
  "Idle": { icon: Pause, color: "text-muted-foreground", badgeVariant: "muted" },
  "Searching Flights": { icon: Search, color: "text-primary", badgeVariant: "status" },
  "Searching Lodging": { icon: Search, color: "text-primary", badgeVariant: "status" },
  "Re-optimizing": { icon: Loader2, color: "text-accent", badgeVariant: "accent" },
  "Waiting for Approval": { icon: CheckCircle2, color: "text-accent", badgeVariant: "accent" },
  "Monitoring": { icon: Eye, color: "text-success", badgeVariant: "success" },
};

interface AgentStatusProps {
  state: AgentState;
  trip: Trip;
  currentStep: number;
  totalSteps?: number;
}

export default function AgentStatus({ state, trip, currentStep, totalSteps = 5 }: AgentStatusProps) {
  const config = stateConfig[state];
  const Icon = config.icon;
  const isAnimating = state === "Searching Flights" || state === "Searching Lodging" || state === "Re-optimizing";

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

        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Progress</span>
            <span className="font-mono">Step {currentStep}/{totalSteps}</span>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-1.5" />
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className={`h-2 w-2 rounded-full ${isAnimating ? "bg-primary animate-status-pulse" : state === "Monitoring" ? "bg-success" : "bg-muted-foreground"}`} />
          <span>{isAnimating ? "Agent is actively working…" : state === "Monitoring" ? "Watching for changes" : "Standing by"}</span>
        </div>
      </CardContent>
    </Card>
  );
}
