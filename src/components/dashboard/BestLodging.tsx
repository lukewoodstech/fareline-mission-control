import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LodgingOption } from "@/types/travel";
import { Building2, Star, MapPin } from "lucide-react";

const tagVariant: Record<string, "success" | "accent" | "status"> = {
  "Best Value": "success",
  "Top Rated": "accent",
  "Best Location": "status",
};

interface BestLodgingProps {
  lodging: LodgingOption[];
}

export default function BestLodging({ lodging }: BestLodgingProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Best Lodging
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {lodging.map((l) => (
          <div
            key={l.id}
            className="rounded-lg border border-border bg-secondary/30 p-4 hover:border-primary/30 transition-colors"
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
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
