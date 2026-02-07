import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Sparkles } from "lucide-react";

interface ActivityPreferencesProps {
  onReoptimize?: (strategy: string) => void;
}

export default function ActivityPreferences({ onReoptimize }: ActivityPreferencesProps) {
  const [prefs, setPrefs] = useState({
    foodDrink: true,
    outdoor: false,
    cultural: true,
    eveningHeavy: false,
  });

  const toggle = (key: keyof typeof prefs, label: string) => {
    setPrefs((p) => {
      const next = { ...p, [key]: !p[key] };
      onReoptimize?.(`${label}: ${next[key] ? "on" : "off"}`);
      return next;
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Activity Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2.5">
          <p className="text-[11px] font-mono uppercase text-muted-foreground/60 tracking-wider">
            Interests
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm">Prefer food & drink</span>
            <Switch
              checked={prefs.foodDrink}
              onCheckedChange={() => toggle("foodDrink", "Prefer food & drink")}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Prefer outdoor activities</span>
            <Switch
              checked={prefs.outdoor}
              onCheckedChange={() => toggle("outdoor", "Prefer outdoor")}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Prefer cultural experiences</span>
            <Switch
              checked={prefs.cultural}
              onCheckedChange={() => toggle("cultural", "Prefer cultural")}
            />
          </div>
        </div>

        <div className="space-y-2.5">
          <p className="text-[11px] font-mono uppercase text-muted-foreground/60 tracking-wider">
            Schedule
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm">Evening-heavy schedule</span>
            <Switch
              checked={prefs.eveningHeavy}
              onCheckedChange={() => toggle("eveningHeavy", "Evening-heavy schedule")}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
