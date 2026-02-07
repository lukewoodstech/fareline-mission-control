import { useState, useRef, useEffect } from "react";
import { DollarSign, Pencil, Check, Plane, Building2, Compass } from "lucide-react";
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

  const totalSpent = flightSpend + lodgingSpend + activitySpend;
  const remaining = budget - totalSpent;
  const spentPercent = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;
  const flightPercent = budget > 0 ? (flightSpend / budget) * 100 : 0;
  const lodgingPercent = budget > 0 ? (lodgingSpend / budget) * 100 : 0;
  const activityPercent = budget > 0 ? (activitySpend / budget) * 100 : 0;

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

  const isOverBudget = remaining < 0;

  return (
    <div className="rounded-xl bg-card border border-border/60 shadow-sm p-4 space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <DollarSign className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">Trip Budget</span>
        </div>

        <div className="flex items-center gap-2">
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
              className="bg-primary h-full transition-all duration-500"
              style={{ width: `${Math.min(flightPercent, 100)}%` }}
            />
          )}
          {lodgingPercent > 0 && (
            <div
              className="bg-accent h-full transition-all duration-500"
              style={{ width: `${Math.min(lodgingPercent, 100)}%` }}
            />
          )}
          {activityPercent > 0 && (
            <div
              className="bg-[hsl(270,60%,55%)] h-full transition-all duration-500"
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
            className={`font-medium ${
              isOverBudget ? "text-destructive" : "text-success"
            }`}
          >
            {isOverBudget
              ? `-$${Math.abs(remaining).toLocaleString()} over`
              : `$${remaining.toLocaleString()} left`}
          </span>
        </div>
      </div>
    </div>
  );
}
