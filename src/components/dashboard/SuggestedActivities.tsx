import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ActivityOption, ActivityCategory, ActivityRejectReason } from "@/types/travel";
import type { ActivityDecision } from "@/hooks/useActivityStore";
import ActivityThumbnail, { categoryConfig } from "./ActivityThumbnail";
import {
  Sparkles,
  Star,
  ExternalLink,
  Check,
  ThumbsDown,
  MapPin,
} from "lucide-react";

const REJECT_REASONS: ActivityRejectReason[] = [
  "Not interested",
  "Too expensive",
  "Too far",
  "Bad reviews",
  "Wrong vibe",
  "Already planned something similar",
];

const tagVariant: Record<string, "success" | "accent" | "status"> = {
  "Top Pick": "success",
  "Local Gem": "accent",
  "Must Do": "status",
};

type FilterKey = "All" | ActivityCategory;

interface SuggestedActivitiesProps {
  activities: ActivityOption[];
  getDecision: (id: string) => ActivityDecision | undefined;
  onSelect: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}

export default function SuggestedActivities({
  activities,
  getDecision,
  onSelect,
  onReject,
}: SuggestedActivitiesProps) {
  const [filter, setFilter] = useState<FilterKey>("All");

  const filters: FilterKey[] = ["All", "Restaurant", "Hike", "Sightseeing", "Activity"];
  const filtered = filter === "All" ? activities : activities.filter((a) => a.category === filter);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Suggested Activities & Food
          </CardTitle>
          <span className="text-[11px] text-muted-foreground">
            {filtered.length} results
          </span>
        </div>
        {/* Category filter chips */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {filters.map((f) => {
            const count = f === "All" ? activities.length : activities.filter((a) => a.category === f).length;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  filter === f
                    ? "bg-primary/15 text-primary font-medium"
                    : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                }`}
              >
                {f} ({count})
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No suggestions in this category
          </p>
        )}
        {filtered.map((a) => {
          const decision = getDecision(a.id);
          const isReplacing = decision?.status === "replacing";

          if (isReplacing) {
            return (
              <div
                key={a.id}
                className="rounded-lg bg-secondary/20 p-3.5 space-y-2.5 animate-pulse"
              >
                <div className="flex gap-3">
                  <Skeleton className="h-16 w-20 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                </div>
                <p className="text-xs text-primary font-medium animate-pulse-glow">
                  TripMaster is finding a better option…
                </p>
              </div>
            );
          }

          return (
            <ActivityCard
              key={a.id}
              activity={a}
              onSelect={() => onSelect(a.id)}
              onReject={(reason) => onReject(a.id, reason)}
            />
          );
        })}
      </CardContent>
    </Card>
  );
}

function ActivityCard({
  activity,
  onSelect,
  onReject,
}: {
  activity: ActivityOption;
  onSelect: () => void;
  onReject: (reason: string) => void;
}) {
  const [showReasons, setShowReasons] = useState(false);
  const [otherReason, setOtherReason] = useState("");
  const [showOtherInput, setShowOtherInput] = useState(false);

  const cat = categoryConfig[activity.category];
  const CatIcon = cat.icon;

  const handleReasonSelect = (reason: string) => {
    onReject(reason);
    setShowReasons(false);
    setShowOtherInput(false);
    setOtherReason("");
  };

  const handleOtherSubmit = () => {
    if (otherReason.trim()) {
      onReject(otherReason.trim());
      setShowReasons(false);
      setShowOtherInput(false);
      setOtherReason("");
    }
  };

  const mapsQuery = encodeURIComponent(activity.title + ", " + activity.address);
  const mapsUrl = `https://maps.google.com/maps?q=${mapsQuery}`;

  return (
    <div className="rounded-lg p-3.5 bg-elevated/50 hover:bg-elevated/80 hover:shadow-sm transition-all duration-200 animate-fade-in-card">
      {/* Top row: thumbnail + info */}
      <div className="flex gap-3 mb-2">
        <ActivityThumbnail activity={activity} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold text-sm truncate">{activity.title}</span>
              {activity.tag && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="shrink-0">
                      <Badge variant={tagVariant[activity.tag]} className="text-[10px] cursor-help">
                        {activity.tag}
                      </Badge>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    Agent-recommended based on your trip context
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            {activity.price && (
              <span className="text-sm font-bold font-mono text-primary shrink-0">
                {activity.price}
              </span>
            )}
          </div>

          {/* Type + Rating */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <div className={`h-4 w-4 rounded ${cat.bg} flex items-center justify-center shrink-0`}>
              <CatIcon className={`h-2.5 w-2.5 ${cat.color}`} />
            </div>
            <span>{activity.type}</span>
            <span className="flex items-center gap-0.5 ml-auto shrink-0">
              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
              <span className="font-medium text-foreground">{activity.rating}</span>
            </span>
          </div>

          {/* Address */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{activity.address}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      {activity.description && (
        <p className="text-xs text-muted-foreground leading-snug mb-2 line-clamp-2">
          {activity.description}
        </p>
      )}

      {/* Actions */}
      <div className="pt-3 mt-1 border-t border-border/20 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {activity.website ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={activity.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-primary hover:underline flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Website
                  </a>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  Opens external page
                </TooltipContent>
              </Tooltip>
            ) : null}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-primary hover:underline flex items-center gap-1 transition-colors"
            >
              <MapPin className="h-3 w-3" />
              Map
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="success"
              size="sm"
              className="h-8 text-xs px-4 font-medium"
              onClick={onSelect}
            >
              <Check className="h-3.5 w-3.5 mr-1.5" />
              Add to Plan
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs px-3 border-destructive/30 text-destructive/80 hover:text-destructive hover:bg-destructive/10 hover:border-destructive/50"
              onClick={() => setShowReasons(true)}
            >
              <ThumbsDown className="h-3.5 w-3.5 mr-1.5" />
              Reject
            </Button>
          </div>
        </div>

        {showReasons && (
          <div className="animate-slide-up space-y-2 bg-secondary/30 rounded-lg p-3">
            <p className="text-xs text-muted-foreground font-medium">
              Tell TripMaster why — it adapts future suggestions
            </p>
            <div className="flex flex-wrap gap-1.5">
              {REJECT_REASONS.map((reason) => (
                <button
                  key={reason}
                  className="text-xs px-2.5 py-1.5 rounded-md bg-secondary hover:bg-destructive/20 hover:text-destructive text-secondary-foreground transition-colors cursor-pointer"
                  onClick={() => handleReasonSelect(reason)}
                >
                  {reason}
                </button>
              ))}
              <button
                className={`text-xs px-2.5 py-1.5 rounded-md transition-colors cursor-pointer ${
                  showOtherInput
                    ? "bg-primary/20 text-primary"
                    : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                }`}
                onClick={() => setShowOtherInput(!showOtherInput)}
              >
                Other…
              </button>
            </div>
            {showOtherInput && (
              <div className="flex gap-1.5 animate-slide-up">
                <Input
                  placeholder="Tell TripMaster why…"
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  className="h-7 text-xs"
                  maxLength={100}
                  onKeyDown={(e) => e.key === "Enter" && handleOtherSubmit()}
                />
                <Button
                  size="sm"
                  className="h-7 text-xs px-3"
                  disabled={!otherReason.trim()}
                  onClick={handleOtherSubmit}
                >
                  Send
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
