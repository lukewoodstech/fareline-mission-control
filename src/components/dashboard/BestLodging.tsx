import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { LodgingOption, OptionDecision } from "@/types/travel";
import { Building2, Star, MapPin } from "lucide-react";
import OptionActions from "./OptionActions";

const tagVariant: Record<string, "success" | "accent" | "status"> = {
  "Best Value": "success",
  "Top Rated": "accent",
  "Best Location": "status",
};

interface BestLodgingProps {
  lodging: LodgingOption[];
  selectedId: string | null;
  getDecision: (id: string) => OptionDecision | undefined;
  onSelect: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onToggleMonitor: (id: string) => void;
  onUnselect: (id: string) => void;
}

export default function BestLodging({
  lodging,
  selectedId,
  getDecision,
  onSelect,
  onReject,
  onToggleMonitor,
  onUnselect,
}: BestLodgingProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Best Lodging
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {lodging.map((l) => {
          const decision = getDecision(l.id);
          const isReplacing = decision?.status === "replacing";
          const isSelected = l.id === selectedId;
          const isDeemphasized = selectedId !== null && !isSelected;

          if (isReplacing) {
            return (
              <div
                key={l.id}
                className="rounded-lg bg-secondary/20 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-3 w-36" />
                <Skeleton className="h-3 w-24" />
                <p className="text-xs text-muted-foreground animate-pulse-glow">
                  TripMaster is finding a better option…
                </p>
              </div>
            );
          }

          return (
            <div
              key={l.id}
              className={`rounded-lg p-4 transition-all ${
                isSelected
                  ? "bg-primary/5 ring-1 ring-primary/30 shadow-sm shadow-primary/10"
                  : isDeemphasized
                  ? "bg-secondary/10 opacity-50"
                  : "bg-elevated/50 hover:bg-elevated/80"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{l.name}</span>
                  {l.tag && <Badge variant={tagVariant[l.tag]}>{l.tag}</Badge>}
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold font-mono text-primary">${l.price}</span>
                  <p className="text-xs text-muted-foreground">${l.perNight}/night</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-accent fill-accent" />
                  {l.rating}
                </span>
                <span className="text-xs">({l.reviewCount.toLocaleString()} reviews)</span>
                <span className="flex items-center gap-1 ml-auto">
                  <MapPin className="h-3 w-3" />
                  {l.neighborhood}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-2">
                {l.amenities.slice(0, 4).map((a) => (
                  <span key={a} className="text-xs px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">
                    {a}
                  </span>
                ))}
              </div>

              <p className="text-xs text-muted-foreground">{l.cancellation}</p>

              <OptionActions
                optionId={l.id}
                category="lodging"
                bookingUrl={l.bookingUrl}
                decision={decision}
                isSelected={isSelected}
                onSelect={() => onSelect(l.id)}
                onReject={(reason) => onReject(l.id, reason)}
                onToggleMonitor={() => onToggleMonitor(l.id)}
                onUnselect={() => onUnselect(l.id)}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
