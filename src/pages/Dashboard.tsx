import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plane, ArrowLeft, MessageSquare, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useLiveDashboard } from "@/hooks/useLiveDashboard";
import { useDemoDashboard } from "@/hooks/useDemoDashboard";
import { useActivityStore } from "@/hooks/useActivityStore";
import { mockPreferences } from "@/data/mockData";
import DemoToggle from "@/components/dashboard/DemoToggle";

import AgentStatus from "@/components/dashboard/AgentStatus";
import LastAgentAction from "@/components/dashboard/LastAgentAction";
import LiveActivityFeed from "@/components/dashboard/LiveActivityFeed";
import BestFlights from "@/components/dashboard/BestFlights";
import BestLodging from "@/components/dashboard/BestLodging";
import ImpactMetrics from "@/components/dashboard/ImpactMetrics";
import Controls from "@/components/dashboard/Controls";
import FlightPreferences from "@/components/dashboard/FlightPreferences";
import LodgingPreferences from "@/components/dashboard/LodgingPreferences";

import TripSwitcher from "@/components/dashboard/TripSwitcher";
import SuggestedActivities from "@/components/dashboard/SuggestedActivities";
import PlannedActivities from "@/components/dashboard/PlannedActivities";
import ActivityPreferences from "@/components/dashboard/ActivityPreferences";
import BudgetTracker from "@/components/dashboard/BudgetTracker";
import EmptyTripState from "@/components/dashboard/EmptyTripState";

type DashboardTab = "flights" | "lodging" | "activities";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("flights");
  const [isDemo, setIsDemo] = useState(true); // Default to demo in Lovable preview

  // Both hooks are always called (Rules of Hooks), but live is disabled in demo mode
  const live = useLiveDashboard(!isDemo);
  const demo = useDemoDashboard();

  // Auto-switch to demo if live API fails (backend unreachable)
  useEffect(() => {
    if (!isDemo && live.error) {
      setIsDemo(true);
      toast.info("Backend unreachable — switched to demo mode", {
        position: "top-center",
      });
    }
  }, [isDemo, live.error]);

  // Pick the active data source
  const dashboard = isDemo ? demo : live;

  const activityStore = useActivityStore(dashboard.addAction, dashboard.setAgentState);

  const lastAction = dashboard.actions[0];
  const hasTrip = dashboard.trip !== null;

  const bothSelected = hasTrip && dashboard.selectedFlightId && dashboard.selectedLodgingId;

  // Compute budget spend per category
  const flightSpend = useMemo(() => {
    if (!dashboard.selectedFlightId) return 0;
    const flight = dashboard.flights.find((f) => f.id === dashboard.selectedFlightId);
    return flight?.price ?? 0;
  }, [dashboard.selectedFlightId, dashboard.flights]);

  const lodgingSpend = useMemo(() => {
    if (!dashboard.selectedLodgingId) return 0;
    const lodge = dashboard.lodging.find((l) => l.id === dashboard.selectedLodgingId);
    return lodge?.price ?? 0;
  }, [dashboard.selectedLodgingId, dashboard.lodging]);

  const activitySpend = useMemo(() => {
    return activityStore.planned.reduce(
      (sum, p) => sum + (p.activity.estimatedCost ?? 0),
      0,
    );
  }, [activityStore.planned]);

  const handleSendItinerary = () => {
    dashboard.addAction({
      id: `act-itinerary-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: "sms",
      summary: "Itinerary sent via SMS — flight + lodging confirmed",
      detail: "TripMaster compiled your selected flight and lodging into a complete itinerary and sent it to your phone.",
      smsSent: true,
    });
    toast.success("Itinerary sent to your phone!", {
      position: "top-center",
      description: "Check your SMS for the full trip summary.",
    });
  };

  const tabs: { key: DashboardTab; label: string }[] = [
    { key: "flights", label: "Flights" },
    { key: "lodging", label: "Lodging" },
    { key: "activities", label: "Activities" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-white/10 bg-[#1F3A5F] text-white sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
                <ArrowLeft className="h-3 w-3 mr-1" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-white/15 flex items-center justify-center">
                <Plane className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-bold tracking-tight text-white">TripMaster</span>
            </div>
            <div className="h-4 w-px bg-white/20 mx-1" />
            <TripSwitcher
              trips={dashboard.trips}
              activeTrip={dashboard.trip}
              onSwitchTrip={dashboard.switchTrip}
              onCreateTrip={dashboard.createTrip}
              onDeleteTrip={dashboard.deleteTrip}
            />
          </div>
          <DemoToggle isDemo={isDemo} onToggle={setIsDemo} />
        </div>
      </header>

      {/* Loading state (only in live mode) */}
      {!isDemo && dashboard.isLoading ? (
        <main className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
          <div className="text-center space-y-4 animate-fade-in">
            <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
            <p className="text-muted-foreground">Connecting to TripMaster agent…</p>
          </div>
        </main>
      ) : !isDemo && dashboard.error ? (
        /* Error state (only in live mode) */
        <main className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
          <div className="text-center space-y-4 max-w-md animate-fade-in">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold">Connection Error</h2>
              <p className="text-sm text-muted-foreground">{dashboard.error}</p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => window.location.reload()}>
                Retry
              </Button>
              <Button onClick={() => setIsDemo(true)}>
                Switch to Demo
              </Button>
            </div>
          </div>
        </main>
      ) : !hasTrip ? (
        /* Empty state — no active trip */
        <EmptyTripState
          onCreateTrip={dashboard.createTrip}
          onSwitchToDemo={!isDemo ? () => setIsDemo(true) : undefined}
        />
      ) : (
        /* Dashboard grid — live or demo data */
        <main className="container mx-auto px-4 py-6 space-y-6">
          {/* Trip status banner */}
          {bothSelected && (
            <div className="rounded-xl bg-success/5 ring-1 ring-success/20 px-4 py-3 flex items-center justify-between animate-slide-up shadow-sm">
              <div className="flex items-center gap-2">
                <Badge variant="success" className="text-xs">Ready to book</Badge>
                <span className="text-sm text-muted-foreground">
                  TripMaster has locked in your best options
                </span>
              </div>
              <Button
                size="sm"
                className="h-8 text-xs px-4 font-medium gap-1.5"
                onClick={handleSendItinerary}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Send itinerary via SMS
              </Button>
            </div>
          )}

          {/* Row 1: Agent Status + Last Action */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AgentStatus
              state={dashboard.agentState}
              trip={dashboard.trip!}
            />
            {lastAction && <LastAgentAction action={lastAction} />}
          </div>

          {/* Row 2: Impact Metrics + Budget */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ImpactMetrics metrics={dashboard.metrics} />
            <BudgetTracker
              budget={dashboard.budget}
              flightSpend={flightSpend}
              lodgingSpend={lodgingSpend}
              activitySpend={activitySpend}
              onUpdateBudget={dashboard.updateBudget}
            />
          </div>

          {/* Activity Feed */}
          <LiveActivityFeed actions={dashboard.actions} />

          {/* Subnav tabs */}
          <nav className="flex items-center gap-1 border-b border-border/20 pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Tab Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {activeTab === "flights" && (
              <>
                <div className="lg:col-span-8">
                  <BestFlights
                    flights={dashboard.flights}
                    selectedId={dashboard.selectedFlightId}
                    getDecision={dashboard.getDecision}
                    onSelect={(id) => dashboard.selectOption(id, "flight")}
                    onReject={(id, reason) => dashboard.rejectOption(id, "flight", reason)}
                    onToggleMonitor={dashboard.toggleMonitor}
                    onUnselect={(id) => dashboard.unselectOption(id, "flight")}
                  />
                </div>
                <div className="lg:col-span-4 space-y-4">
                  <Controls
                    key="flights"
                    activeTab="flights"
                    agentState={dashboard.agentState}
                    onReoptimize={dashboard.reoptimize}
                    onSetAgentState={dashboard.setAgentState}
                    onAddAction={dashboard.addAction}
                  />
                  <FlightPreferences
                    initial={mockPreferences}
                    onReoptimize={(strategy) => dashboard.reoptimize("flight", strategy)}
                  />
                </div>
              </>
            )}

            {activeTab === "lodging" && (
              <>
                <div className="lg:col-span-8">
                  <BestLodging
                    lodging={dashboard.lodging}
                    selectedId={dashboard.selectedLodgingId}
                    getDecision={dashboard.getDecision}
                    onSelect={(id) => dashboard.selectOption(id, "lodging")}
                    onReject={(id, reason) => dashboard.rejectOption(id, "lodging", reason)}
                    onToggleMonitor={dashboard.toggleMonitor}
                    onUnselect={(id) => dashboard.unselectOption(id, "lodging")}
                  />
                </div>
                <div className="lg:col-span-4 space-y-4">
                  <Controls
                    key="lodging"
                    activeTab="lodging"
                    agentState={dashboard.agentState}
                    onReoptimize={dashboard.reoptimize}
                    onSetAgentState={dashboard.setAgentState}
                    onAddAction={dashboard.addAction}
                  />
                  <LodgingPreferences
                    initial={mockPreferences}
                    destination={dashboard.trip!.destination}
                    onNeighborhoodChange={(neighborhoods) => {
                      if (neighborhoods.length > 0) {
                        dashboard.reoptimize("lodging", `area priority: ${neighborhoods[0]}`);
                      }
                    }}
                    onReoptimize={(strategy) => dashboard.reoptimize("lodging", strategy)}
                  />
                </div>
              </>
            )}

            {activeTab === "activities" && (
              <>
                <div className="lg:col-span-8">
                  <SuggestedActivities
                    activities={activityStore.suggestions}
                    getDecision={activityStore.getActivityDecision}
                    onSelect={activityStore.selectActivity}
                    onReject={activityStore.rejectActivity}
                  />
                </div>
                <div className="lg:col-span-4 space-y-4">
                  <PlannedActivities
                    planned={activityStore.planned}
                    onRemove={activityStore.removeFromPlan}
                  />
                  <ActivityPreferences
                    onReoptimize={activityStore.reoptimizeActivities}
                  />
                </div>
              </>
            )}
          </div>
        </main>
      )}
    </div>
  );
}
