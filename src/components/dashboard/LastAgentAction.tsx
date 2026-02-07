import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AgentAction } from "@/types/travel";
import { Zap, MessageSquare } from "lucide-react";

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

interface LastAgentActionProps {
  action: AgentAction;
}

export default function LastAgentAction({ action }: LastAgentActionProps) {
  return (
    <Card className="h-full border-primary/20 glow-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Last Agent Action
          </CardTitle>
          <span className="text-xs font-mono text-muted-foreground">{formatTime(action.timestamp)}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <p className="font-semibold text-sm leading-snug">{action.summary}</p>
          {action.smsSent && (
            <Badge variant="accent" className="shrink-0 text-xs">
              <MessageSquare className="h-3 w-3 mr-1" />
              SMS
            </Badge>
          )}
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">{action.detail}</p>

        {action.rationale && action.rationale.length > 0 && (
          <ul className="space-y-1.5 pt-1">
            {action.rationale.map((r, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
