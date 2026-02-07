import { useState, useEffect, useCallback, useRef } from "react";
import type { AgentAction, AgentState, ImpactMetrics } from "@/types/travel";
import {
  demoAgentStates,
  demoNewActions,
  initialActions,
  mockMetrics,
} from "@/data/mockData";

export function useDemoMode() {
  const [isDemo, setIsDemo] = useState(false);
  const [agentState, setAgentState] = useState<AgentState>("Monitoring");
  const [currentStep, setCurrentStep] = useState(5);
  const [actions, setActions] = useState<AgentAction[]>(initialActions);
  const [metrics, setMetrics] = useState<ImpactMetrics>(mockMetrics);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stateIndexRef = useRef(0);
  const actionIndexRef = useRef(0);

  const addAction = useCallback((action: AgentAction) => {
    setActions((prev) => [action, ...prev]);
  }, []);

  const addDemoEvent = useCallback(() => {
    const stateIdx = stateIndexRef.current % demoAgentStates.length;
    const actionIdx = actionIndexRef.current % demoNewActions.length;

    setAgentState(demoAgentStates[stateIdx]);
    setCurrentStep((prev) => (prev % 5) + 1);

    const template = demoNewActions[actionIdx];
    const newAction: AgentAction = {
      ...template,
      id: `demo-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    setActions((prev) => [newAction, ...prev]);

    setMetrics((prev) => ({
      ...prev,
      optionsEvaluated: prev.optionsEvaluated + Math.floor(Math.random() * 30 + 10),
      moneySaved: prev.moneySaved + Math.floor(Math.random() * 8),
      alertsSent: prev.alertsSent + (template.smsSent ? 1 : 0),
    }));

    stateIndexRef.current += 1;
    actionIndexRef.current += 1;
  }, []);

  useEffect(() => {
    if (isDemo) {
      intervalRef.current = setInterval(() => {
        addDemoEvent();
      }, 5000 + Math.random() * 5000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isDemo, addDemoEvent]);

  const resetDemo = useCallback(() => {
    setActions(initialActions);
    setAgentState("Monitoring");
    setCurrentStep(5);
    setMetrics(mockMetrics);
    stateIndexRef.current = 0;
    actionIndexRef.current = 0;
  }, []);

  return {
    isDemo,
    setIsDemo,
    agentState,
    setAgentState,
    currentStep,
    actions,
    metrics,
    resetDemo,
    addAction,
  };
}
