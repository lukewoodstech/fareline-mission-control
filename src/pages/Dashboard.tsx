import { Link } from "react-router-dom";
import { Plane, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemoMode } from "@/hooks/useDemoMode";
import { mockTrip, mockFlights, mockLodging, mockPreferences } from "@/data/mockData";

import AgentStatus from "@/components/dashboard/AgentStatus";
import LastAgentAction from "@/components/dashboard/LastAgentAction";
import LiveActivityFeed from "@/components/dashboard/LiveActivityFeed";
import BestFlights from "@/components/dashboard/BestFlights";
import BestLodging from "@/components/dashboard/BestLodging";
import ImpactMetrics from "@/components/dashboard/ImpactMetrics";
import Controls from "@/components/dashboard/Controls";
import PreferencesPanel from "@/components/dashboard/PreferencesPanel";
import DemoToggle from "@/components/dashboard/DemoToggle";

export default function Dashboard() {
  const {
    isDemo,
    setIsDemo,
    agentState,
    currentStep,
    actions,
    metrics,
  } = useDemoMode();

  const lastAction = actions[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-3 w-3 mr-1" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-primary/20 flex items-center justify-center">
                <Plane className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="font-bold tracking-tight">Fareline</span>
              <span className="text-xs text-muted-foreground font-mono">/ Mission Control</span>
            </div>
          </div>

          <DemoToggle isDemo={isDemo} onToggle={setIsDemo} />
        </div>
      </header>

      {/* Dashboard grid */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Row 1: Agent Status + Last Action */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AgentStatus
            state={agentState}
            trip={mockTrip}
            currentStep={currentStep}
          />
          {lastAction && <LastAgentAction action={lastAction} />}
        </div>

        {/* Row 2: Impact Metrics */}
        <ImpactMetrics metrics={metrics} />

        {/* Row 3: Activity Feed */}
        <LiveActivityFeed actions={actions} />

        {/* Row 4: Best Options + Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4">
            <BestFlights flights={mockFlights} />
          </div>
          <div className="lg:col-span-4">
            <BestLodging lodging={mockLodging} />
          </div>
          <div className="lg:col-span-4 space-y-4">
            <Controls />
            <PreferencesPanel initial={mockPreferences} />
          </div>
        </div>
      </main>
    </div>
  );
}
