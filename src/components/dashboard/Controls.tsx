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

export default function Controls() {
  const handleAction = (label: string) => {
    toast.success(`${label} — command sent to agent`, {
      description: "The agent will adjust its strategy on the next cycle.",
    });
  };

  const controls = [
    { icon: TrendingDown, label: "Re-optimize cheaper", description: "Focus on lowest price" },
    { icon: Armchair, label: "Re-optimize comfort", description: "Prioritize quality" },
    { icon: PauseCircle, label: "Pause monitoring", description: "Stop live tracking" },
    { icon: BellRing, label: "Set alert threshold", description: "Customize price alerts" },
    { icon: MessageSquare, label: "Request shortlist via SMS", description: "Get summary texted" },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {controls.map((c) => (
          <Button
            key={c.label}
            variant="control"
            className="w-full justify-start h-auto py-2.5 px-3"
            onClick={() => handleAction(c.label)}
          >
            <c.icon className="h-4 w-4 mr-3 shrink-0 text-muted-foreground" />
            <div className="text-left">
              <p className="text-sm font-medium">{c.label}</p>
              <p className="text-xs text-muted-foreground font-normal">{c.description}</p>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
