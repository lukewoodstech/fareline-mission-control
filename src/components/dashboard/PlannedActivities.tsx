import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PlannedActivity, ActivityCategory } from "@/types/travel";
import ActivityThumbnail, { categoryConfig } from "./ActivityThumbnail";
import {
  CalendarCheck,
  ExternalLink,
  RotateCcw,
  MapPin,
  Star,
} from "lucide-react";

const categoryColors: Record<ActivityCategory, string> = {
  Restaurant: "text-orange-400",
  Hike: "text-emerald-400",
  Sightseeing: "text-violet-400",
  Activity: "text-amber-400",
};

interface PlannedActivitiesProps {
  planned: PlannedActivity[];
  onRemove: (activityId: string) => void;
}

export default function PlannedActivities({
  planned,
  onRemove,
}: PlannedActivitiesProps) {
  if (planned.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <CalendarCheck className="h-4 w-4" />
            Your Itinerary
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
            Your Itinerary
          </CardTitle>
          <Badge variant="success" className="text-[10px]">
            {planned.length} planned
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {planned.map((p) => {
          const cat = categoryConfig[p.activity.category];
          const CatIcon = cat.icon;
          const catColor = categoryColors[p.activity.category];

          const mapsQuery = encodeURIComponent(p.activity.title + ", " + p.activity.address);
          const mapsUrl = `https://www.google.com/maps/search/${mapsQuery}`;

          return (
            <div
              key={p.activityId}
              className="rounded-lg bg-primary/5 ring-1 ring-primary/15 p-2.5 animate-fade-in"
            >
              <div className="flex gap-2.5 mb-1">
                <ActivityThumbnail activity={p.activity} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <CatIcon className={`h-3 w-3 shrink-0 ${catColor}`} />
                      <span className="text-sm font-medium truncate">{p.activity.title}</span>
                    </div>
                    {p.activity.price && (
                      <span className="text-xs font-mono text-primary shrink-0 ml-2">
                        {p.activity.price}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{p.activity.type}</span>
                    <span className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      {p.activity.rating}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-border/10">
                <div className="flex items-center gap-2">
                  {p.activity.website && (
                    <a
                      href={p.activity.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Website
                    </a>
                  )}
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-primary hover:underline flex items-center gap-1 font-medium"
                  >
                    <MapPin className="h-3 w-3" />
                    Map
                  </a>
                </div>
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
      </CardContent>
    </Card>
  );
}
