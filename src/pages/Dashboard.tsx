import { useState } from "react";
import { Link } from "react-router-dom";
import { Plane, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDemoMode } from "@/hooks/useDemoMode";
import { useTripStore } from "@/hooks/useTripStore";
import { mockPreferences } from "@/data/mockData";

import AgentStatus from "@/components/dashboard/AgentStatus";
import LastAgentAction from "@/components/dashboard/LastAgentAction";
import LiveActivityFeed from "@/components/dashboard/LiveActivityFeed";
import BestFlights from "@/components/dashboard/BestFlights";
import BestLodging from "@/components/dashboard/BestLodging";
import ImpactMetrics from "@/components/dashboard/ImpactMetrics";
import Controls from "@/components/dashboard/Controls";
import FlightPreferences from "@/components/dashboard/FlightPreferences";
import LodgingPreferences from "@/components/dashboard/LodgingPreferences";
import DemoToggle from "@/components/dashboard/DemoToggle";
import TripSwitcher from "@/components/dashboard/TripSwitcher";

type DashboardTab = "flights" | "lodging";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("flights");

  const {
    isDemo,
    setIsDemo,
    agentState,
    setAgentState,
    currentStep,
    actions,
    metrics,
    addAction,
  } = useDemoMode();

  const tripStore = useTripStore(addAction, setAgentState);

  const lastAction = actions[0];

  const bothSelected = tripStore.selectedFlightId && tripStore.selectedLodgingId;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border/30 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
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
              <span className="font-bold tracking-tight">TripMaster</span>
            </div>
            <div className="h-4 w-px bg-border/50 mx-1" />
            <TripSwitcher
              trips={tripStore.trips}
              activeTrip={tripStore.activeTrip}
              onSwitchTrip={tripStore.switchTrip}
              onCreateTrip={tripStore.createTrip}
            />
          </div>

          <DemoToggle isDemo={isDemo} onToggle={setIsDemo} />
        </div>
      </header>

      {/* Subnav tabs */}
      <nav className="border-b border-border/20 bg-card/40 backdrop-blur-sm sticky top-14 z-40">
        <div className="container mx-auto px-4 flex items-center gap-1 h-11">
          <button
            onClick={() => setActiveTab("flights")}
            className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-md ${
              activeTab === "flights"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Flights
            {activeTab === "flights" && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("lodging")}
            className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-md ${
              activeTab === "lodging"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Lodging
            {activeTab === "lodging" && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
            )}
          </button>
          <button
            disabled
            className="px-4 py-2 text-sm font-medium text-muted-foreground/40 cursor-not-allowed"
          >
            Activities
            <span className="ml-1.5 text-[10px] font-mono uppercase">Soon</span>
          </button>
        </div>
      </nav>

      {/* Dashboard grid */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Trip status banner */}
        {bothSelected && (
          <div className="rounded-xl bg-success/5 px-4 py-3 flex items-center justify-between animate-slide-up shadow-sm">
            <div className="flex items-center gap-2">
              <Badge variant="success" className="text-xs">Ready to book</Badge>
              <span className="text-sm text-muted-foreground">
                Flight and lodging selected — your trip is locked in.
              </span>
            </div>
          </div>
        )}

        {/* Row 1: Agent Status + Last Action */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AgentStatus
            state={agentState}
            trip={tripStore.activeTrip}
            currentStep={currentStep}
          />
          {lastAction && <LastAgentAction action={lastAction} />}
        </div>

        {/* Row 2: Impact Metrics */}
        <ImpactMetrics metrics={metrics} />

        {/* Row 3: Activity Feed */}
        <LiveActivityFeed actions={actions} />

        {/* Row 4: Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {activeTab === "flights" ? (
            <>
              <div className="lg:col-span-8">
                <BestFlights
                  flights={tripStore.flights}
                  selectedId={tripStore.selectedFlightId}
                  getDecision={tripStore.getDecision}
                  onSelect={(id) => tripStore.selectOption(id, "flight")}
                  onReject={(id, reason) => tripStore.rejectOption(id, "flight", reason)}
                  onToggleMonitor={tripStore.toggleMonitor}
                  onUnselect={(id) => tripStore.unselectOption(id, "flight")}
                />
              </div>
              <div className="lg:col-span-4 space-y-4">
                <Controls />
                <FlightPreferences initial={mockPreferences} />
              </div>
            </>
          ) : (
            <>
              <div className="lg:col-span-8">
                <BestLodging
                  lodging={tripStore.lodging}
                  selectedId={tripStore.selectedLodgingId}
                  getDecision={tripStore.getDecision}
                  onSelect={(id) => tripStore.selectOption(id, "lodging")}
                  onReject={(id, reason) => tripStore.rejectOption(id, "lodging", reason)}
                  onToggleMonitor={tripStore.toggleMonitor}
                  onUnselect={(id) => tripStore.unselectOption(id, "lodging")}
                />
              </div>
              <div className="lg:col-span-4 space-y-4">
                <Controls />
                <LodgingPreferences initial={mockPreferences} />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
