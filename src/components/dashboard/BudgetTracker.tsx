import { useState, useRef, useEffect } from "react";
import { DollarSign, Pencil, Check, Plane, Building2, Compass, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BudgetTrackerProps {
  budget: number;
  flightSpend: number;
  lodgingSpend: number;
  activitySpend: number;
  onUpdateBudget: (newBudget: number) => void;
}

export default function BudgetTracker({
  budget,
  flightSpend,
  lodgingSpend,
  activitySpend,
  onUpdateBudget,
}: BudgetTrackerProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(budget.toString());
  const inputRef = useRef<HTMLInputElement>(null);
  const prevTotalRef = useRef(0);
  const [microFeedback, setMicroFeedback] = useState<{ amount: number; visible: boolean }>({ amount: 0, visible: false });

  const totalSpent = flightSpend + lodgingSpend + activitySpend;
  const remaining = budget - totalSpent;
  const spentPercent = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;
  const flightPercent = budget > 0 ? (flightSpend / budget) * 100 : 0;
  const lodgingPercent = budget > 0 ? (lodgingSpend / budget) * 100 : 0;
  const activityPercent = budget > 0 ? (activitySpend / budget) * 100 : 0;

  const hasSelections = totalSpent > 0;
  const isWithinBudget = hasSelections && remaining >= 0;
  const isOverBudget = remaining < 0;

  // Detect spend changes and show micro-feedback
  useEffect(() => {
    const diff = totalSpent - prevTotalRef.current;
    if (diff !== 0 && prevTotalRef.current > 0) {
      setMicroFeedback({ amount: diff, visible: true });
      const timer = setTimeout(() => setMicroFeedback((prev) => ({ ...prev, visible: false })), 1500);
      return () => clearTimeout(timer);
    }
    prevTotalRef.current = totalSpent;
  }, [totalSpent]);

  // Also update prevTotalRef when it's the first selection
  useEffect(() => {
    if (prevTotalRef.current === 0 && totalSpent > 0) {
      setMicroFeedback({ amount: -totalSpent, visible: true });
      const timer = setTimeout(() => {
        setMicroFeedback((prev) => ({ ...prev, visible: false }));
        prevTotalRef.current = totalSpent;
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [totalSpent]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  useEffect(() => {
    setEditValue(budget.toString());
  }, [budget]);

  const handleSave = () => {
    const parsed = parseInt(editValue, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 999999) {
      onUpdateBudget(parsed);
    } else {
      setEditValue(budget.toString());
    }
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setEditValue(budget.toString());
      setEditing(false);
    }
  };

  return (
    <div className={`rounded-xl border shadow-sm p-4 space-y-3 transition-all duration-500 ${
      isWithinBudget
        ? "bg-success/5 border-success/20 ring-1 ring-success/10"
        : isOverBudget
        ? "bg-destructive/5 border-destructive/20 ring-1 ring-destructive/10"
        : "bg-card border-border/60"
    }`}>
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors duration-500 ${
            isWithinBudget ? "bg-success/15" : "bg-primary/10"
          }`}>
            {isWithinBudget ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            ) : (
              <DollarSign className="h-3.5 w-3.5 text-primary" />
            )}
          </div>
          <span className="text-sm font-medium text-muted-foreground">Trip Budget</span>
        </div>

        <div className="flex items-center gap-2 relative">
          {/* Micro-feedback floating text */}
          {microFeedback.visible && (
            <span className={`absolute -top-6 right-0 text-xs font-bold font-mono animate-budget-float ${
              microFeedback.amount < 0 ? "text-destructive" : "text-success"
            }`}>
              {microFeedback.amount < 0 ? "−" : "+"}${Math.abs(microFeedback.amount).toLocaleString()}
            </span>
          )}

          {editing ? (
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">$</span>
              <Input
                ref={inputRef}
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSave}
                className="h-7 w-24 text-sm font-semibold"
                min={1}
                max={999999}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleSave}
              >
                <Check className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 group cursor-pointer"
            >
              <span className="text-lg font-bold text-foreground">
                ${budget.toLocaleString()}
              </span>
              <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="h-2.5 bg-muted rounded-full overflow-hidden flex">
          {flightPercent > 0 && (
            <div
              className="bg-primary h-full transition-all duration-700 ease-out"
              style={{ width: `${Math.min(flightPercent, 100)}%` }}
            />
          )}
          {lodgingPercent > 0 && (
            <div
              className="bg-accent h-full transition-all duration-700 ease-out"
              style={{ width: `${Math.min(lodgingPercent, 100)}%` }}
            />
          )}
          {activityPercent > 0 && (
            <div
              className="bg-[hsl(270,60%,55%)] h-full transition-all duration-700 ease-out"
              style={{ width: `${Math.min(activityPercent, 100)}%` }}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            {flightSpend > 0 && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Plane className="h-3 w-3 text-primary" />
                ${flightSpend.toLocaleString()}
              </span>
            )}
            {lodgingSpend > 0 && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Building2 className="h-3 w-3 text-accent" />
                ${lodgingSpend.toLocaleString()}
              </span>
            )}
            {activitySpend > 0 && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Compass className="h-3 w-3 text-[hsl(270,60%,55%)]" />
                ${activitySpend.toLocaleString()}
              </span>
            )}
            {totalSpent === 0 && (
              <span className="text-muted-foreground/60">No selections yet</span>
            )}
          </div>
          <span
            className={`font-medium transition-colors duration-300 ${
              isOverBudget
                ? "text-destructive"
                : isWithinBudget
                ? "text-success"
                : "text-success"
            }`}
          >
            {isOverBudget
              ? `-$${Math.abs(remaining).toLocaleString()} over`
              : isWithinBudget
              ? `$${remaining.toLocaleString()} left ✓`
              : `$${remaining.toLocaleString()} left`}
          </span>
        </div>
      </div>

      {/* Within budget confirmation */}
      {isWithinBudget && (
        <div className="flex items-center gap-2 text-xs text-success font-medium animate-slide-up">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Within budget — agent is protecting your constraints
        </div>
      )}
    </div>
  );
}
