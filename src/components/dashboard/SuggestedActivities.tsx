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
import type { ActivityOption, ActivityRejectReason } from "@/types/travel";
import type { ActivityDecision } from "@/hooks/useActivityStore";
import {
  Sparkles,
  Clock,
  CalendarDays,
  ExternalLink,
  Check,
  ThumbsDown,
  UtensilsCrossed,
  TreePine,
  Palette,
  PartyPopper,
  Leaf,
} from "lucide-react";

const REJECT_REASONS: ActivityRejectReason[] = [
  "Not interested",
  "Too expensive",
  "Wrong vibe",
  "Too long",
  "Bad timing",
  "Already planned something similar",
];

const categoryConfig = {
  Food: { icon: UtensilsCrossed, color: "text-orange-400", bg: "bg-orange-400/10" },
  Outdoor: { icon: TreePine, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  Culture: { icon: Palette, color: "text-violet-400", bg: "bg-violet-400/10" },
  Event: { icon: PartyPopper, color: "text-amber-400", bg: "bg-amber-400/10" },
  Relaxation: { icon: Leaf, color: "text-sky-400", bg: "bg-sky-400/10" },
};

const tagVariant: Record<string, "success" | "accent" | "status"> = {
  "Top Pick": "success",
  "Local Gem": "accent",
  "Must Do": "status",
};

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
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Suggested Activities
          </CardTitle>
          <span className="text-[11px] text-muted-foreground">
            Curated for your trip
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.map((a) => {
          const decision = getDecision(a.id);
          const isReplacing = decision?.status === "replacing";

          if (isReplacing) {
            return (
              <div
                key={a.id}
                className="rounded-lg bg-secondary/20 p-3.5 space-y-2.5 animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-5 w-14" />
                </div>
                <Skeleton className="h-3 w-56" />
                <Skeleton className="h-3 w-32" />
                <p className="text-xs text-primary font-medium animate-pulse-glow">
                  TripMaster is finding a better activity…
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

  return (
    <div className="rounded-lg p-3.5 bg-elevated/50 hover:bg-elevated/80 hover:shadow-sm transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`h-6 w-6 rounded-md ${cat.bg} flex items-center justify-center`}>
            <CatIcon className={`h-3.5 w-3.5 ${cat.color}`} />
          </div>
          <span className="font-semibold text-sm">{activity.title}</span>
          {activity.tag && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
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
        <span className="text-lg font-bold font-mono text-primary">
          {activity.price === null ? "Free" : `$${activity.price}`}
        </span>
      </div>

      <p className="text-sm text-muted-foreground mb-2 leading-snug">{activity.description}</p>

      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-1">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {activity.duration}
        </span>
        <span className="flex items-center gap-1">
          <CalendarDays className="h-3 w-3" />
          Day {activity.suggestedDay}
          {activity.suggestedTime && ` · ${activity.suggestedTime}`}
        </span>
        <Badge variant="muted" className="text-[10px] ml-auto">{activity.category}</Badge>
      </div>

      {/* Actions */}
      <div className="pt-3 mt-3 border-t border-border/20 space-y-2">
        <div className="flex items-center justify-between">
          {activity.bookingUrl ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={activity.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-primary hover:underline flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  View details
                </a>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Opens external page
              </TooltipContent>
            </Tooltip>
          ) : (
            <span className="text-xs text-muted-foreground/50">No booking needed</span>
          )}
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
