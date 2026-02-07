import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import type { Preferences } from "@/types/travel";
import { useState } from "react";
import { Brain } from "lucide-react";

interface PreferencesPanelProps {
  initial: Preferences;
}

const preferenceItems: { key: keyof Preferences; label: string; type: "toggle" | "value" }[] = [
  { key: "avoidRedEyes", label: "Avoid red-eyes", type: "toggle" },
  { key: "preferNonstop", label: "Prefer nonstop", type: "toggle" },
  { key: "preferWindow", label: "Window seat", type: "toggle" },
  { key: "earlyCheckIn", label: "Early check-in", type: "toggle" },
];

export default function PreferencesPanel({ initial }: PreferencesPanelProps) {
  const [prefs, setPrefs] = useState(initial);

  const togglePref = (key: keyof Preferences) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Brain className="h-4 w-4" />
          Preferences Learned
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {preferenceItems.map((item) => (
          <div key={item.key} className="flex items-center justify-between">
            <span className="text-sm">{item.label}</span>
            <Switch
              checked={prefs[item.key] as boolean}
              onCheckedChange={() => togglePref(item.key)}
            />
          </div>
        ))}

        <div className="pt-2 border-t border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Max stops</span>
            <span className="text-sm font-mono text-primary">{prefs.maxStops}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Min hotel rating</span>
            <span className="text-sm font-mono text-primary">{prefs.minHotelRating}+</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
