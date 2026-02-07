import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import type { Preferences } from "@/types/travel";
import { useState } from "react";
import { Plane } from "lucide-react";

interface FlightPreferencesProps {
  initial: Preferences;
}

const flightPrefs: { key: keyof Preferences; label: string }[] = [
  { key: "avoidRedEyes", label: "Avoid red-eyes" },
  { key: "preferNonstop", label: "Prefer nonstop" },
  { key: "preferWindow", label: "Window seat" },
];

export default function FlightPreferences({ initial }: FlightPreferencesProps) {
  const [prefs, setPrefs] = useState(initial);

  const togglePref = (key: keyof Preferences) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Plane className="h-4 w-4" />
          Flight Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {flightPrefs.map((item) => (
          <div key={item.key} className="flex items-center justify-between">
            <span className="text-sm">{item.label}</span>
            <Switch
              checked={prefs[item.key] as boolean}
              onCheckedChange={() => togglePref(item.key)}
            />
          </div>
        ))}

        <div className="pt-2 border-t border-border/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Max stops</span>
            <span className="text-sm font-mono text-primary">{prefs.maxStops}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
