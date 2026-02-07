import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Preferences } from "@/types/travel";
import { useState } from "react";
import { Building2, MapPin, X } from "lucide-react";

const NEIGHBORHOOD_SUGGESTIONS: Record<string, string[]> = {
  default: ["Downtown", "Old Town", "Midtown", "Waterfront", "Arts District", "University Area"],
  SAN: ["Gaslamp Quarter", "Little Italy", "La Jolla", "Pacific Beach", "Mission Valley", "Coronado"],
  LAX: ["Santa Monica", "Hollywood", "Beverly Hills", "Venice", "Downtown LA", "West Hollywood"],
  MIA: ["South Beach", "Brickell", "Wynwood", "Coconut Grove", "Coral Gables", "Downtown Miami"],
};

interface LodgingPreferencesProps {
  initial: Preferences;
  destination?: string;
}

export default function LodgingPreferences({ initial, destination }: LodgingPreferencesProps) {
  const [prefs, setPrefs] = useState(initial);
  const [neighborhoodInput, setNeighborhoodInput] = useState("");
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = NEIGHBORHOOD_SUGGESTIONS[destination ?? ""] ?? NEIGHBORHOOD_SUGGESTIONS.default;
  const filteredSuggestions = suggestions.filter(
    (s) =>
      !selectedNeighborhoods.includes(s) &&
      s.toLowerCase().includes(neighborhoodInput.toLowerCase()),
  );

  const addNeighborhood = (name: string) => {
    if (!selectedNeighborhoods.includes(name)) {
      setSelectedNeighborhoods((prev) => [...prev, name]);
    }
    setNeighborhoodInput("");
    setShowSuggestions(false);
  };

  const removeNeighborhood = (name: string) => {
    setSelectedNeighborhoods((prev) => prev.filter((n) => n !== name));
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Lodging Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location */}
        <div className="space-y-2.5">
          <p className="text-[11px] font-mono uppercase text-muted-foreground/60 tracking-wider">Location</p>
          <div className="relative">
            <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search neighborhoods…"
              value={neighborhoodInput}
              onChange={(e) => {
                setNeighborhoodInput(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && neighborhoodInput.trim()) {
                  e.preventDefault();
                  addNeighborhood(neighborhoodInput.trim());
                }
              }}
              className="h-8 text-sm pl-8"
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute z-10 top-full mt-1 left-0 right-0 rounded-md border border-border bg-popover shadow-md overflow-hidden animate-fade-in">
                {filteredSuggestions.map((s) => (
                  <button
                    key={s}
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-secondary transition-colors cursor-pointer flex items-center gap-2"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      addNeighborhood(s);
                    }}
                  >
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          {selectedNeighborhoods.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedNeighborhoods.map((n) => (
                <Badge key={n} variant="secondary" className="text-xs gap-1 pr-1">
                  {n}
                  <button
                    onClick={() => removeNeighborhood(n)}
                    className="ml-0.5 rounded-full hover:bg-destructive/20 hover:text-destructive p-0.5 transition-colors cursor-pointer"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <p className="text-[10px] text-muted-foreground/60">
            TripMaster will prioritize lodging in these areas
          </p>
        </div>

        {/* Comfort */}
        <div className="space-y-2.5">
          <p className="text-[11px] font-mono uppercase text-muted-foreground/60 tracking-wider">Comfort</p>
          <div className="flex items-center justify-between">
            <span className="text-sm">Early check-in</span>
            <Switch
              checked={prefs.earlyCheckIn}
              onCheckedChange={(v) => setPrefs((p) => ({ ...p, earlyCheckIn: v }))}
            />
          </div>
        </div>

        {/* Constraints */}
        <div className="space-y-2.5">
          <p className="text-[11px] font-mono uppercase text-muted-foreground/60 tracking-wider">Constraints</p>
          <div className="flex items-center justify-between">
            <span className="text-sm">Free cancellation only</span>
            <Switch
              checked={false}
              onCheckedChange={() => {}}
            />
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