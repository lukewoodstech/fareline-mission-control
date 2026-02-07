import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingDown,
  Armchair,
  PauseCircle,
  BellRing,
  MessageSquare,
  Settings2,
} from "lucide-react";
import { toast } from "sonner";

const controls = [
  {
    icon: TrendingDown,
    label: "Re-optimize cheaper",
    description: "Focus on lowest price",
    hint: "Will replace current options",
    strategy: "cheaper",
    triggersReopt: true,
  },
  {
    icon: Armchair,
    label: "Re-optimize comfort",
    description: "Prioritize quality",
    hint: "May increase price",
    strategy: "comfort",
    triggersReopt: true,
  },
  {
    icon: PauseCircle,
    label: "Pause monitoring",
    description: "Stop live tracking",
    hint: "You can resume anytime",
    strategy: "",
    triggersReopt: false,
  },
  {
    icon: BellRing,
    label: "Set alert threshold",
    description: "Customize price alerts",
    hint: "Get notified on drops",
    strategy: "",
    triggersReopt: false,
  },
  {
    icon: MessageSquare,
    label: "Request shortlist via SMS",
    description: "Get summary texted",
    hint: "Uses your past rejections",
    strategy: "",
    triggersReopt: false,
  },
];

interface ControlsProps {
  activeTab: "flights" | "lodging";
  onReoptimize: (category: "flight" | "lodging", strategy: string) => void;
}

export default function Controls({ activeTab, onReoptimize }: ControlsProps) {
  const handleAction = (control: (typeof controls)[0]) => {
    if (control.triggersReopt) {
      const category = activeTab === "flights" ? "flight" : "lodging";
      onReoptimize(category, control.strategy);
    } else {
      toast.success(`${control.label} — command sent to TripMaster`, {
        description: "The agent will adjust its strategy on the next cycle.",
      });
    }
  };

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
            key={c.label}
            variant="control"
            className="w-full justify-start h-auto py-2 px-3 group"
            onClick={() => handleAction(c)}
          >
            <c.icon className="h-4 w-4 mr-3 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
            <div className="text-left flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{c.label}</p>
              </div>
              <p className="text-xs text-muted-foreground font-normal">{c.description}</p>
              <p className="text-[10px] text-muted-foreground/60 font-normal mt-0.5">{c.hint}</p>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
