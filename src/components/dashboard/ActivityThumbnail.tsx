import { useState } from "react";
import type { ActivityOption, ActivityCategory } from "@/types/travel";
import {
  UtensilsCrossed,
  Mountain,
  Camera,
  Ticket,
} from "lucide-react";

const categoryConfig: Record<ActivityCategory, { icon: typeof UtensilsCrossed; color: string; bg: string }> = {
  Restaurant: { icon: UtensilsCrossed, color: "text-orange-400", bg: "bg-orange-400/10" },
  Hike: { icon: Mountain, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  Sightseeing: { icon: Camera, color: "text-violet-400", bg: "bg-violet-400/10" },
  Activity: { icon: Ticket, color: "text-amber-400", bg: "bg-amber-400/10" },
};

export { categoryConfig };

interface ActivityThumbnailProps {
  activity: ActivityOption;
  size?: "sm" | "lg";
}

export default function ActivityThumbnail({ activity, size = "lg" }: ActivityThumbnailProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const cat = categoryConfig[activity.category];
  const CatIcon = cat.icon;

  const sizeClasses = size === "lg"
    ? "h-16 w-20 rounded-lg"
    : "h-12 w-16 rounded-md";

  const iconSize = size === "lg" ? "h-6 w-6" : "h-4 w-4";

  if (activity.thumbnail && !imgFailed) {
    return (
      <img
        src={activity.thumbnail}
        alt={activity.title}
        referrerPolicy="no-referrer"
        className={`${sizeClasses} object-cover shrink-0 bg-secondary`}
        onError={() => setImgFailed(true)}
      />
    );
  }

  return (
    <div className={`${sizeClasses} ${cat.bg} flex items-center justify-center shrink-0`}>
      <CatIcon className={`${iconSize} ${cat.color}`} />
    </div>
  );
}
