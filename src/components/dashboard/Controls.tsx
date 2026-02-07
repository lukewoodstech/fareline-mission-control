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
import type { AgentState } from "@/types/travel";

interface ControlsProps {
  activeTab: "flights" | "lodging";
  agentState: AgentState;
  onReoptimize: (category: "flight" | "lodging", strategy: string) => void;
  onSetAgentState: (state: AgentState) => void;
}

export default function Controls({
  activeTab,
  agentState,
  onReoptimize,
  onSetAgentState,
}: ControlsProps) {
  const [smsSending, setSmsSending] = useState(false);
  const [alertThreshold, setAlertThreshold] = useState("");
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
    const value = Number(alertThreshold);
    if (!value || value <= 0) return;
    setAlertOpen(false);
    toast.success("Alert threshold updated. We'll notify you when this condition is met.", {
      position: "top-center",
    });
    setAlertThreshold("");
  };

  const handleSmsRequest = () => {
    setSmsSending(true);
    setTimeout(() => {
      setSmsSending(false);
      toast.success("Shortlist sent to your phone.", {
        position: "top-center",
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
                <p className="text-sm font-medium">Set alert threshold</p>
                <p className="text-xs text-muted-foreground font-normal">Customize price alerts</p>
                <p className="text-[10px] text-muted-foreground/60 font-normal mt-0.5">Get notified on drops</p>
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent side="left" align="start" className="w-72 p-4 space-y-3">
            <p className="text-sm font-medium">Price alert threshold</p>
            <p className="text-xs text-muted-foreground">
              Notify me if {activeTab === "flights" ? "a flight" : "lodging"} price drops below:
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-muted-foreground">$</span>
              <Input
                type="number"
                min={1}
                placeholder="e.g. 150"
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(e.target.value)}
                className="h-8 text-sm font-mono"
                onKeyDown={(e) => e.key === "Enter" && handleAlertSave()}
              />
            </div>
            <Button
              size="sm"
              className="w-full h-8 text-xs"
              disabled={!alertThreshold || Number(alertThreshold) <= 0}
              onClick={handleAlertSave}
            >
              Save threshold
            </Button>
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
