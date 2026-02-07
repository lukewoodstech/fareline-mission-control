import { Card, CardContent } from "@/components/ui/card";
import type { ImpactMetrics as ImpactMetricsType } from "@/types/travel";
import { DollarSign, Clock, BellRing, BarChart3 } from "lucide-react";

interface ImpactMetricsProps {
  metrics: ImpactMetricsType;
}

const metricItems = (m: ImpactMetricsType) => [
  {
    icon: DollarSign,
    label: "Money Saved",
    value: `$${m.moneySaved}`,
    sub: `vs $${m.baselinePrice} baseline`,
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: Clock,
    label: "Time Saved",
    value: `${m.timeSavedHours}h`,
    sub: "vs manual booking",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: BellRing,
    label: "Alerts Sent",
    value: m.alertsSent.toString(),
    sub: "SMS notifications",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: BarChart3,
    label: "Options Evaluated",
    value: m.optionsEvaluated.toLocaleString(),
    sub: "flights + lodging",
    color: "text-primary",
    bg: "bg-primary/10",
  },
];

export default function ImpactMetrics({ metrics }: ImpactMetricsProps) {
  const items = metricItems(metrics);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((item) => (
        <Card key={item.label} className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`h-8 w-8 rounded-lg ${item.bg} flex items-center justify-center`}>
                <item.icon className={`h-4 w-4 ${item.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono">{item.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{item.label}</p>
            <p className="text-[10px] text-muted-foreground/70">{item.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
