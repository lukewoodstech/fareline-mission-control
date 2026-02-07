import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PlannedActivity } from "@/types/travel";
import {
  CalendarCheck,
  Clock,
  ExternalLink,
  RotateCcw,
  UtensilsCrossed,
  TreePine,
  Palette,
  PartyPopper,
  Leaf,
} from "lucide-react";

const categoryIcons = {
  Food: UtensilsCrossed,
  Outdoor: TreePine,
  Culture: Palette,
  Event: PartyPopper,
  Relaxation: Leaf,
};

const categoryColors = {
  Food: "text-orange-400",
  Outdoor: "text-emerald-400",
  Culture: "text-violet-400",
  Event: "text-amber-400",
  Relaxation: "text-sky-400",
};

interface PlannedActivitiesProps {
  planned: PlannedActivity[];
  tripDepartDate: string;
  onRemove: (activityId: string) => void;
}

function getDayDate(departDate: string, dayNumber: number): string {
  const d = new Date(departDate);
  d.setDate(d.getDate() + dayNumber - 1);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function PlannedActivities({
  planned,
  tripDepartDate,
  onRemove,
}: PlannedActivitiesProps) {
  // Group by day
  const byDay = planned.reduce<Record<number, PlannedActivity[]>>((acc, p) => {
    if (!acc[p.day]) acc[p.day] = [];
    acc[p.day].push(p);
    return acc;
  }, {});

  const sortedDays = Object.keys(byDay)
    .map(Number)
    .sort((a, b) => a - b);

  if (planned.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <CalendarCheck className="h-4 w-4" />
            Planned Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">No activities planned yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Select activities from the suggestions to build your itinerary
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <CalendarCheck className="h-4 w-4" />
            Planned Activities
          </CardTitle>
          <Badge variant="success" className="text-[10px]">
            {planned.length} planned
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedDays.map((day) => {
          const dayActivities = byDay[day].sort((a, b) => a.order - b.order);
          return (
            <div key={day}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono font-semibold text-primary">
                  Day {day}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  — {getDayDate(tripDepartDate, day)}
                </span>
              </div>
              <div className="space-y-1.5 ml-3 border-l border-border/30 pl-3">
                {dayActivities.map((p) => {
                  const CatIcon = categoryIcons[p.activity.category];
                  const catColor = categoryColors[p.activity.category];
                  return (
                    <div
                      key={p.activityId}
                      className="rounded-lg bg-primary/5 ring-1 ring-primary/15 p-2.5 animate-fade-in"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <CatIcon className={`h-3.5 w-3.5 ${catColor}`} />
                          <span className="text-sm font-medium">{p.activity.title}</span>
                        </div>
                        <span className="text-xs font-mono text-primary">
                          {p.activity.price === null ? "Free" : `$${p.activity.price}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {p.activity.suggestedTime ?? p.activity.duration}
                        </span>
                        <span>·</span>
                        <span>{p.activity.duration}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-border/10">
                        {p.activity.bookingUrl ? (
                          <a
                            href={p.activity.bookingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Book
                          </a>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/50">No booking needed</span>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[11px] px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => onRemove(p.activityId)}
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
