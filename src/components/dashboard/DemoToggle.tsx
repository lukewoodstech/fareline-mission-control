import { Switch } from "@/components/ui/switch";
import { Radio } from "lucide-react";

interface DemoToggleProps {
  isDemo: boolean;
  onToggle: (v: boolean) => void;
}

export default function DemoToggle({ isDemo, onToggle }: DemoToggleProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-elevated/60 px-4 py-2">
      <Radio className={`h-4 w-4 ${isDemo ? "text-success animate-pulse-glow" : "text-muted-foreground"}`} />
      <span className="text-sm font-medium">Demo Mode</span>
      <Switch checked={isDemo} onCheckedChange={onToggle} />
      {isDemo && (
        <span className="text-xs text-success font-mono">LIVE</span>
      )}
    </div>
  );
}
