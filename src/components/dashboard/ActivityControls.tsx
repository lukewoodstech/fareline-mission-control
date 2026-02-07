import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Compass,
  Armchair,
  Wand2,
  PauseCircle,
  PlayCircle,
  Settings2,
} from "lucide-react";
import { toast } from "sonner";
import type { AgentState } from "@/types/travel";

interface ActivityControlsProps {
  agentState: AgentState;
  onReoptimize: (strategy: string) => void;
  onSetAgentState: (state: AgentState) => void;
}

export default function ActivityControls({
  agentState,
  onReoptimize,
  onSetAgentState,
}: ActivityControlsProps) {
  const isPaused = agentState === "Paused";

  const handlePauseResume = () => {
    if (isPaused) {
      onSetAgentState("Monitoring");
      toast.success("Activity planning resumed.", { position: "top-center" });
    } else {
      onSetAgentState("Paused");
      toast.success("Activity planning paused.", { position: "top-center" });
    }
  };

  const controls = [
    {
      key: "vibe-culture",
      icon: Compass,
      label: "Re-optimize vibe",
      description: "Culture & sightseeing focus",
      hint: "More museums, tours, history",
      onClick: () => onReoptimize("culture & sightseeing"),
      disabled: isPaused,
    },
    {
      key: "relaxation",
      icon: Armchair,
      label: "Re-optimize relaxation",
      description: "Chill experiences only",
      hint: "Spas, beaches, slow dining",
      onClick: () => onReoptimize("relaxation"),
      disabled: isPaused,
    },
    {
      key: "fill",
      icon: Wand2,
      label: "Fill open days",
      description: "Auto-suggest for gaps",
      hint: "Agent picks based on context",
      onClick: () => onReoptimize("fill open days"),
      disabled: isPaused,
    },
    {
      key: "pause",
      icon: isPaused ? PlayCircle : PauseCircle,
      label: isPaused ? "Resume planning" : "Pause planning",
      description: isPaused ? "Restart activity curation" : "Stop activity curation",
      hint: isPaused ? "Agent will resume suggesting" : "You can resume anytime",
      onClick: handlePauseResume,
      disabled: false,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          Activity Controls
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
      </CardContent>
    </Card>
  );
}
