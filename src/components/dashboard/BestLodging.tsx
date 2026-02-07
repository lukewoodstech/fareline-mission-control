import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { LodgingOption, OptionDecision } from "@/types/travel";
import { Building2, Star, MapPin, Check } from "lucide-react";
import OptionActions from "./OptionActions";

const tagLabels: Record<string, string> = {
  "Best Value": "Best Value — based on your preferences",
  "Top Rated": "Top Rated — highest guest scores",
  "Best Location": "Best Location — closest to your plans",
};

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
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Best Lodging
          </CardTitle>
          <span className="text-[11px] text-muted-foreground">
            Monitoring for better prices
          </span>
        </div>
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
                className="rounded-lg bg-secondary/20 p-3.5 space-y-2.5 animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-14" />
                </div>
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-3 w-36" />
                <Skeleton className="h-3 w-24" />
                <p className="text-xs text-primary font-medium animate-pulse-glow">
                  TripMaster is finding a better option…
                </p>
              </div>
            );
          }

          return (
            <div
              key={l.id}
              className={`rounded-lg p-3.5 transition-all duration-200 ${
                isSelected
                  ? "bg-primary/8 ring-1 ring-primary/30 shadow-md shadow-primary/5"
                  : isDeemphasized
                  ? "bg-secondary/10 opacity-40 hover:opacity-60"
                  : "bg-elevated/50 hover:bg-elevated/80 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isSelected && <Check className="h-3.5 w-3.5 text-success" />}
                  <span className="font-semibold text-sm">{l.name}</span>
                  {l.tag && (
                    <Badge variant={tagVariant[l.tag]} className="text-[10px]">
                      {tagLabels[l.tag] ?? l.tag}
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold font-mono text-primary">${l.price}</span>
                  <p className="text-[11px] text-muted-foreground">${l.perNight}/night</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-1.5">
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

              <div className="flex flex-wrap gap-1.5 mb-1.5">
                {l.amenities.slice(0, 4).map((a) => (
                  <span key={a} className="text-[11px] px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">
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
