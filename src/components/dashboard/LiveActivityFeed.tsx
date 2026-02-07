import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AgentAction } from "@/types/travel";
import {
  Search,
  GitCompare,
  BellRing,
  Settings2,
  Eye,
  MessageSquare,
  Activity,
  ThumbsDown,
} from "lucide-react";

const typeIcons: Record<AgentAction["type"], React.ElementType> = {
  search: Search,
  compare: GitCompare,
  alert: BellRing,
  optimize: Settings2,
  monitor: Eye,
  sms: MessageSquare,
  trip: Search,
  reject: ThumbsDown,
};

const typeLabels: Record<AgentAction["type"], string> = {
  search: "Search",
  compare: "Compare",
  alert: "Alert",
  optimize: "Optimize",
  monitor: "Monitor",
  sms: "SMS Sent",
  trip: "Trip",
  reject: "Rejected",
};

const typeBadgeVariant: Record<AgentAction["type"], "muted" | "accent" | "destructive"> = {
  search: "muted",
  compare: "muted",
  alert: "accent",
  optimize: "muted",
  monitor: "muted",
  sms: "accent",
  trip: "muted",
  reject: "destructive",
};

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true });
}

interface LiveActivityFeedProps {
  actions: AgentAction[];
}

export default function LiveActivityFeed({ actions }: LiveActivityFeedProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Live Activity Feed
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-muted-foreground font-mono">{actions.length} events</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[240px] pr-4">
          <div className="space-y-0.5">
            {actions.map((action, idx) => {
              const Icon = typeIcons[action.type];
              return (
                <div
                  key={action.id}
                  className={`flex items-start gap-3 py-2 px-3 rounded-lg transition-all hover:bg-secondary/50 ${
                    idx === 0 ? "animate-slide-up bg-secondary/30" : ""
                  }`}
                >
                  <div className={`mt-0.5 h-6 w-6 rounded-md flex items-center justify-center shrink-0 ${
                    action.type === "reject" ? "bg-destructive/15" :
                    action.type === "alert" || action.type === "sms" ? "bg-accent/15" :
                    "bg-secondary"
                  }`}>
                    <Icon className={`h-3 w-3 ${
                      action.type === "reject" ? "text-destructive" :
                      action.type === "alert" || action.type === "sms" ? "text-accent" :
                      "text-muted-foreground"
                    }`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[11px] font-mono text-muted-foreground">{formatTime(action.timestamp)}</span>
                      <Badge variant={typeBadgeVariant[action.type] ?? "muted"} className="text-[10px] py-0 px-1.5">
                        {typeLabels[action.type]}
                      </Badge>
                      {action.smsSent && (
                        <Badge variant="accent" className="text-[10px] py-0 px-1.5">
                          <MessageSquare className="h-2.5 w-2.5 mr-0.5" />
                          SMS
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm leading-snug">{action.summary}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
