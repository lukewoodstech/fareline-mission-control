import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import type { Preferences } from "@/types/travel";
import { useState } from "react";
import { Building2 } from "lucide-react";

interface LodgingPreferencesProps {
  initial: Preferences;
}

export default function LodgingPreferences({ initial }: LodgingPreferencesProps) {
  const [prefs, setPrefs] = useState(initial);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Lodging Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">Early check-in</span>
          <Switch
            checked={prefs.earlyCheckIn}
            onCheckedChange={(v) => setPrefs((p) => ({ ...p, earlyCheckIn: v }))}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Free cancellation only</span>
          <Switch
            checked={false}
            onCheckedChange={() => {}}
          />
        </div>

        <div className="pt-2 border-t border-border/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Min hotel rating</span>
            <span className="text-sm font-mono text-primary">{prefs.minHotelRating}+</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
