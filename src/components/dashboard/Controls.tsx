import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  TrendingDown,
  Armchair,
  PauseCircle,
  PlayCircle,
  BellRing,
  MessageSquare,
  Settings2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import type { AgentAction, AgentState } from "@/types/travel";

interface ControlsProps {
  activeTab: "flights" | "lodging";
  agentState: AgentState;
  onReoptimize: (category: "flight" | "lodging", strategy: string) => void;
  onSetAgentState: (state: AgentState) => void;
  onAddAction?: (action: AgentAction) => void;
}

export default function Controls({
  activeTab,
  agentState,
  onReoptimize,
  onSetAgentState,
  onAddAction,
}: ControlsProps) {
  const [smsSending, setSmsSending] = useState(false);
  const [alertInput, setAlertInput] = useState("");
  const [savedThreshold, setSavedThreshold] = useState<number | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);

  const isPaused = agentState === "Paused";
  const category = activeTab === "flights" ? "flight" : "lodging";

  const handlePauseResume = () => {
    if (isPaused) {
      onSetAgentState("Monitoring");
      toast.success("Monitoring resumed.", {
        position: "top-center",
        className: "bg-success/10 border-success/30",
      });
    } else {
      onSetAgentState("Paused");
      toast.success("Monitoring paused. You can resume at any time.", {
        position: "top-center",
        className: "bg-success/10 border-success/30",
      });
    }
  };

  const handleAlertSave = () => {
    const value = Number(alertInput);
    if (!value || value <= 0) return;
    setSavedThreshold(value);
    setAlertOpen(false);
    toast.success("Alert threshold updated. We'll notify you when this condition is met.", {
      position: "top-center",
    });
    setAlertInput("");
  };

  const handleSmsRequest = () => {
    setSmsSending(true);

    // Log SMS request to activity feed
    onAddAction?.({
      id: `act-sms-req-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: "sms",
      summary: `Shortlist requested via SMS — ${activeTab}`,
      detail: `TripMaster is compiling your best ${activeTab} options based on your rejections and preferences.`,
      smsSent: true,
    });

    setTimeout(() => {
      setSmsSending(false);
      toast.success("Shortlist sent to your phone.", {
        position: "top-center",
      });

      // Log SMS delivery
      onAddAction?.({
        id: `act-sms-sent-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: "sms",
        summary: `SMS shortlist delivered — top 3 ${activeTab}`,
        detail: `Your curated ${activeTab} shortlist was sent via SMS. Check your phone for the summary.`,
        smsSent: true,
      });
    }, 1500);
  };

  const controls = [
    {
      key: "cheaper",
      icon: TrendingDown,
      label: "Re-optimize cheaper",
      description: "Focus on lowest price",
      hint: "Will replace current options",
      onClick: () => onReoptimize(category, "cheaper"),
      disabled: isPaused,
    },
    {
      key: "comfort",
      icon: Armchair,
      label: "Re-optimize comfort",
      description: "Prioritize quality",
      hint: "May increase price",
      onClick: () => onReoptimize(category, "comfort"),
      disabled: isPaused,
    },
    {
      key: "pause",
      icon: isPaused ? PlayCircle : PauseCircle,
      label: isPaused ? "Resume monitoring" : "Pause monitoring",
      description: isPaused ? "Restart live tracking" : "Stop live tracking",
      hint: isPaused ? "Agent will resume watching" : "You can resume anytime",
      onClick: handlePauseResume,
      disabled: false,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          Agent Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {controls.map((c) => (
          <Button
            key={c.key}
            variant="control"
            className="w-full justify-start h-auto py-2 px-3 group"
            onClick={c.onClick}
            disabled={c.disabled}
          >
            <c.icon className="h-4 w-4 mr-3 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
            <div className="text-left flex-1">
              <p className="text-sm font-medium">{c.label}</p>
              <p className="text-xs text-muted-foreground font-normal">{c.description}</p>
              <p className="text-[10px] text-muted-foreground/60 font-normal mt-0.5">{c.hint}</p>
            </div>
          </Button>
        ))}

        {/* Alert threshold — popover */}
        <Popover open={alertOpen} onOpenChange={setAlertOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="control"
              className="w-full justify-start h-auto py-2 px-3 group"
            >
              <BellRing className="h-4 w-4 mr-3 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
              <div className="text-left flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">Set alert threshold</p>
                  {savedThreshold !== null && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/15 text-primary">
                      &lt; ${savedThreshold}
                    </span>
                  )}
                </div>
                {savedThreshold !== null ? (
                  <p className="text-xs text-primary/80 font-normal">
                    Alert when below ${savedThreshold}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground font-normal">Customize price alerts</p>
                )}
                <p className="text-[10px] text-muted-foreground/60 font-normal mt-0.5">Get notified on drops</p>
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent side="left" align="start" className="w-72 p-4 space-y-3">
            <p className="text-sm font-medium">Price alert threshold</p>
            <p className="text-xs text-muted-foreground">
              Notify me if {activeTab === "flights" ? "a flight" : "lodging"} price drops below:
            </p>
            {savedThreshold !== null && (
              <p className="text-xs text-primary font-mono">
                Current: &lt; ${savedThreshold}
              </p>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-muted-foreground">$</span>
              <Input
                type="number"
                min={1}
                placeholder={savedThreshold ? `${savedThreshold}` : "e.g. 150"}
                value={alertInput}
                onChange={(e) => setAlertInput(e.target.value)}
                className="h-8 text-sm font-mono"
                onKeyDown={(e) => e.key === "Enter" && handleAlertSave()}
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 h-8 text-xs"
                disabled={!alertInput || Number(alertInput) <= 0}
                onClick={handleAlertSave}
              >
                Save threshold
              </Button>
              {savedThreshold !== null && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    setSavedThreshold(null);
                    setAlertOpen(false);
                    toast.success("Alert threshold removed.", { position: "top-center" });
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* SMS shortlist */}
        <Button
          variant="control"
          className="w-full justify-start h-auto py-2 px-3 group"
          onClick={handleSmsRequest}
          disabled={smsSending}
        >
          {smsSending ? (
            <Loader2 className="h-4 w-4 mr-3 shrink-0 text-primary animate-spin" />
          ) : (
            <MessageSquare className="h-4 w-4 mr-3 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
          )}
          <div className="text-left flex-1">
            <p className="text-sm font-medium">
              {smsSending ? "Sending shortlist…" : "Request shortlist via SMS"}
            </p>
            <p className="text-xs text-muted-foreground font-normal">
              {smsSending ? "Compiling your best options" : "Get summary texted"}
            </p>
            <p className="text-[10px] text-muted-foreground/60 font-normal mt-0.5">Uses your past rejections</p>
          </div>
        </Button>
      </CardContent>
    </Card>
  );
}
