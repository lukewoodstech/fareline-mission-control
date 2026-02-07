import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import type { Preferences } from "@/types/travel";
import { useState } from "react";
import { Plane } from "lucide-react";

interface FlightPreferencesProps {
  initial: Preferences;
}

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
      <CardContent className="space-y-4">
        {/* Timing */}
        <div className="space-y-2.5">
          <p className="text-[11px] font-mono uppercase text-muted-foreground/60 tracking-wider">Timing</p>
          <div className="flex items-center justify-between">
            <span className="text-sm">Avoid red-eyes</span>
            <Switch
              checked={prefs.avoidRedEyes as boolean}
              onCheckedChange={() => togglePref("avoidRedEyes")}
            />
          </div>
        </div>

        {/* Comfort */}
        <div className="space-y-2.5">
          <p className="text-[11px] font-mono uppercase text-muted-foreground/60 tracking-wider">Comfort</p>
          <div className="flex items-center justify-between">
            <span className="text-sm">Prefer nonstop</span>
            <Switch
              checked={prefs.preferNonstop as boolean}
              onCheckedChange={() => togglePref("preferNonstop")}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Window seat</span>
            <Switch
              checked={prefs.preferWindow as boolean}
              onCheckedChange={() => togglePref("preferWindow")}
            />
          </div>
        </div>

        {/* Constraints */}
        <div className="space-y-2.5">
          <p className="text-[11px] font-mono uppercase text-muted-foreground/60 tracking-wider">Constraints</p>
          <div className="flex items-center justify-between">
            <span className="text-sm">Max stops</span>
            <span className="text-sm font-mono text-primary">{prefs.maxStops}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
