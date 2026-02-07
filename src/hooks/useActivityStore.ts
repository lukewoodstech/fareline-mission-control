import { useState, useCallback, useRef } from "react";
import type {
  ActivityOption,
  PlannedActivity,
  AgentAction,
  AgentState,
} from "@/types/travel";
import { mockActivities, replacementActivities } from "@/data/mockActivities";

export interface ActivityDecision {
  activityId: string;
  status: "replacing" | "none";
  rejectReason?: string;
  timestamp?: string;
}

interface ActivityStore {
  suggestions: ActivityOption[];
  planned: PlannedActivity[];
  decisions: ActivityDecision[];
  selectActivity: (id: string) => void;
  rejectActivity: (id: string, reason: string) => void;
  removeFromPlan: (activityId: string) => void;
  getActivityDecision: (id: string) => ActivityDecision | undefined;
  reoptimizeActivities: (strategy: string) => void;
}

export function useActivityStore(
  onAddAction: (action: AgentAction) => void,
  onSetAgentState: (state: AgentState) => void,
): ActivityStore {
  const [suggestions, setSuggestions] = useState<ActivityOption[]>(mockActivities);
  const [planned, setPlanned] = useState<PlannedActivity[]>([]);
  const [decisions, setDecisions] = useState<ActivityDecision[]>([]);
  const replacementIdx = useRef(0);

  const getActivityDecision = useCallback(
    (id: string) => decisions.find((d) => d.activityId === id),
    [decisions],
  );

  const getNextReplacement = useCallback(() => {
    const idx = replacementIdx.current % replacementActivities.length;
    const replacement = {
      ...replacementActivities[idx],
      id: `act-rep-${Date.now()}-${idx}`,
    };
    replacementIdx.current += 1;
    return replacement;
  }, []);

  const selectActivity = useCallback(
    (id: string) => {
      const activity = suggestions.find((a) => a.id === id);
      if (!activity) return;

      // Replace the selected suggestion with a new one from the pool
      const replacement = getNextReplacement();
      setSuggestions((prev) =>
        prev.map((a) => (a.id === id ? replacement : a)),
      );

      // Add to planned
      setPlanned((prev) => [
        ...prev,
        { activityId: activity.id, activity },
      ]);

      const action: AgentAction = {
        id: `act-activity-select-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: "optimize",
        summary: `Activity added: ${activity.title}`,
        detail: `Added to your itinerary. TripMaster is adjusting remaining suggestions.`,
        smsSent: false,
      };
      onAddAction(action);
    },
    [suggestions, onAddAction, getNextReplacement],
  );

  const rejectActivity = useCallback(
    (id: string, reason: string) => {
      setDecisions((prev) => [
        ...prev.filter((d) => d.activityId !== id),
        { activityId: id, status: "replacing" as const, rejectReason: reason, timestamp: new Date().toISOString() },
      ]);

      onSetAgentState("Re-optimizing (Activities)");

      const rejectAction: AgentAction = {
        id: `act-activity-reject-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: "reject",
        summary: `Rejected activity — "${reason}"`,
        detail: `TripMaster is finding a better option based on your feedback.`,
        smsSent: false,
      };
      onAddAction(rejectAction);

      setTimeout(() => {
        const replacement = getNextReplacement();

        setSuggestions((prev) => prev.map((a) => (a.id === id ? replacement : a)));
        setDecisions((prev) => prev.filter((d) => d.activityId !== id));
        onSetAgentState("Monitoring");

        const replaceAction: AgentAction = {
          id: `act-activity-replace-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: "optimize",
          summary: `Found new option: ${replacement.title}`,
          detail: `Replaced based on your feedback: "${reason}".`,
          smsSent: false,
        };
        onAddAction(replaceAction);
      }, 2200);
    },
    [onAddAction, onSetAgentState, getNextReplacement],
  );

  const removeFromPlan = useCallback(
    (activityId: string) => {
      const removedActivity = planned.find((p) => p.activityId === activityId);
      setPlanned((prev) => prev.filter((p) => p.activityId !== activityId));

      if (removedActivity) {
        const replacement = getNextReplacement();
        setSuggestions((prev) => [...prev, replacement]);

        const action: AgentAction = {
          id: `act-activity-remove-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: "optimize",
          summary: `Removed ${removedActivity.activity.title} from plan`,
          detail: `TripMaster suggested a replacement option.`,
          smsSent: false,
        };
        onAddAction(action);
      }
    },
    [planned, onAddAction, getNextReplacement],
  );

  const reoptimizeActivities = useCallback(
    (strategy: string) => {
      const currentIds = suggestions.map((a) => a.id);

      setDecisions((prev) => {
        const filtered = prev.filter((d) => !currentIds.includes(d.activityId));
        return [
          ...filtered,
          ...currentIds.map((id) => ({
            activityId: id,
            status: "replacing" as const,
            timestamp: new Date().toISOString(),
          })),
        ];
      });

      onSetAgentState("Re-optimizing (Activities)");

      const reoptAction: AgentAction = {
        id: `act-activity-reopt-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: "optimize",
        summary: `Re-optimizing activities — ${strategy}`,
        detail: `TripMaster is curating new options based on "${strategy}" preference.`,
        smsSent: false,
      };
      onAddAction(reoptAction);

      setTimeout(() => {
        setSuggestions((prev) =>
          prev.map(() => {
            const replacement = getNextReplacement();
            return replacement;
          }),
        );

        setDecisions((prev) => prev.filter((d) => !currentIds.includes(d.activityId)));
        onSetAgentState("Monitoring");

        const doneAction: AgentAction = {
          id: `act-activity-reopt-done-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: "optimize",
          summary: `Found new activities — ${strategy}`,
          detail: `Replaced ${currentIds.length} activities with better matches.`,
          smsSent: false,
        };
        onAddAction(doneAction);
      }, 2000);
    },
    [suggestions, onAddAction, onSetAgentState, getNextReplacement],
  );

  return {
    suggestions,
    planned,
    decisions,
    selectActivity,
    rejectActivity,
    removeFromPlan,
    getActivityDecision,
    reoptimizeActivities,
  };
}
