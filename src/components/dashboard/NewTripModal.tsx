import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CalendarIcon, Plane, ArrowRightLeft, MessageSquare, Info, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Trip } from "@/types/travel";

interface NewTripModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTrip: (trip: Omit<Trip, "id" | "status">) => void;
}

export default function NewTripModal({ open, onOpenChange, onCreateTrip }: NewTripModalProps) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departDate, setDepartDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [budget, setBudget] = useState("");
  const [travelers, setTravelers] = useState("1");
  const [dateFlexible, setDateFlexible] = useState(false);
  const [preferenceBias, setPreferenceBias] = useState<number[]>([50]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const biasLabel = preferenceBias[0] < 35
    ? "Prioritizing lower price"
    : preferenceBias[0] > 65
    ? "Prioritizing comfort"
    : "Balanced";

  const biasColor = preferenceBias[0] < 35
    ? "text-success"
    : preferenceBias[0] > 65
    ? "text-accent"
    : "text-muted-foreground";

  // Validation
  const validation = useMemo(() => {
    const errors: Record<string, string> = {};

    if (touched.origin && !origin.trim()) {
      errors.origin = "Airport or city required";
    }
    if (touched.destination && !destination.trim()) {
      errors.destination = "Airport or city required";
    }
    if (touched.destination && origin.trim() && destination.trim() &&
        origin.trim().toUpperCase() === destination.trim().toUpperCase()) {
      errors.destination = "Must differ from origin";
    }
    if (touched.returnDate && departDate && returnDate && returnDate <= departDate) {
      errors.returnDate = "Must be after start date";
    }
    if (touched.budget && budget && Number(budget) <= 0) {
      errors.budget = "Must be greater than $0";
    }
    if (touched.travelers && travelers && (Number(travelers) < 1 || !Number.isInteger(Number(travelers)))) {
      errors.travelers = "At least 1 traveler";
    }

    return errors;
  }, [origin, destination, departDate, returnDate, budget, travelers, touched]);

  const hasErrors = Object.keys(validation).length > 0;
  const isComplete = origin.trim() && destination.trim() && departDate && returnDate && budget && Number(budget) > 0 && travelers && Number(travelers) >= 1;
  const isValid = isComplete && !hasErrors;

  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const swapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSubmit = () => {
    if (!isValid || !departDate || !returnDate) return;

    onCreateTrip({
      origin: origin.trim().toUpperCase(),
      destination: destination.trim().toUpperCase(),
      departDate: format(departDate, "yyyy-MM-dd"),
      returnDate: format(returnDate, "yyyy-MM-dd"),
      budget: Number(budget),
      travelers: Number(travelers),
      dateFlexible,
      preferenceBias:
        preferenceBias[0] < 35 ? "cheaper" : preferenceBias[0] > 65 ? "comfort" : "balanced",
    });

    // Reset
    setOrigin("");
    setDestination("");
    setDepartDate(undefined);
    setReturnDate(undefined);
    setBudget("");
    setTravelers("1");
    setDateFlexible(false);
    setPreferenceBias([50]);
    setTouched({});
  };

  // Dynamic agent preview
  const agentPreview = useMemo(() => {
    if (!origin.trim() && !destination.trim()) return null;
    const parts: string[] = [];
    if (origin.trim() && destination.trim()) {
      parts.push(`Search flights ${origin.trim().toUpperCase()} → ${destination.trim().toUpperCase()}`);
    }
    if (budget && Number(budget) > 0) {
      parts.push(`under $${budget}`);
    }
    if (preferenceBias[0] < 35) {
      parts.push("prioritizing lowest fares");
    } else if (preferenceBias[0] > 65) {
      parts.push("prioritizing comfort");
    }
    return parts.join(", ");
  }, [origin, destination, budget, preferenceBias]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plane className="h-4 w-4 text-primary" />
            Create a new trip
          </DialogTitle>
          <DialogDescription>
            Tell TripMaster where you're headed. It'll start searching immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Origin + Destination */}
          <div className="relative grid grid-cols-[1fr_auto_1fr] gap-2 items-end">
            <div className="space-y-1.5">
              <Label htmlFor="origin" className="text-xs">Origin</Label>
              <Input
                id="origin"
                placeholder="DEN (Denver)"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                onBlur={() => markTouched("origin")}
                maxLength={30}
                className={cn(
                  "font-mono uppercase",
                  validation.origin && "ring-1 ring-destructive/50"
                )}
              />
              {validation.origin && (
                <p className="text-[11px] text-destructive">{validation.origin}</p>
              )}
              {!validation.origin && <p className="text-[11px] text-muted-foreground/60">Airport or city</p>}
            </div>

            <button
              type="button"
              onClick={swapLocations}
              className="h-10 w-8 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-secondary/50"
              aria-label="Swap origin and destination"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
            </button>

            <div className="space-y-1.5">
              <Label htmlFor="destination" className="text-xs">Destination</Label>
              <Input
                id="destination"
                placeholder="SAN (San Diego)"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onBlur={() => markTouched("destination")}
                maxLength={30}
                className={cn(
                  "font-mono uppercase",
                  validation.destination && "ring-1 ring-destructive/50"
                )}
              />
              {validation.destination && (
                <p className="text-[11px] text-destructive">{validation.destination}</p>
              )}
              {!validation.destination && <p className="text-[11px] text-muted-foreground/60">Airport or city</p>}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-10",
                      !departDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="h-3.5 w-3.5 mr-2" />
                    {departDate ? format(departDate, "MMM d, yyyy") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card border-border z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={departDate}
                    onSelect={(d) => {
                      setDepartDate(d);
                      // Auto-clear return date if it's now invalid
                      if (returnDate && d && returnDate <= d) {
                        setReturnDate(undefined);
                      }
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-10",
                      !returnDate && "text-muted-foreground",
                      validation.returnDate && "ring-1 ring-destructive/50",
                    )}
                  >
                    <CalendarIcon className="h-3.5 w-3.5 mr-2" />
                    {returnDate ? format(returnDate, "MMM d, yyyy") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card border-border z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={returnDate}
                    onSelect={(d) => {
                      setReturnDate(d);
                      markTouched("returnDate");
                    }}
                    disabled={(date) => date < (departDate ?? new Date())}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              {validation.returnDate && (
                <p className="text-[11px] text-destructive">{validation.returnDate}</p>
              )}
            </div>
          </div>

          {/* Budget + Travelers */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="budget" className="text-xs">Budget ($)</Label>
              <Input
                id="budget"
                type="number"
                placeholder="700"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                onBlur={() => markTouched("budget")}
                min={1}
                max={99999}
                className={cn(
                  "font-mono",
                  validation.budget && "ring-1 ring-destructive/50"
                )}
              />
              {validation.budget && (
                <p className="text-[11px] text-destructive">{validation.budget}</p>
              )}
              {!validation.budget && <p className="text-[11px] text-muted-foreground/60">Total trip budget</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="travelers" className="text-xs">Travelers</Label>
              <Input
                id="travelers"
                type="number"
                placeholder="1"
                value={travelers}
                onChange={(e) => setTravelers(e.target.value)}
                onBlur={() => markTouched("travelers")}
                min={1}
                max={20}
                className={cn(
                  "font-mono",
                  validation.travelers && "ring-1 ring-destructive/50"
                )}
              />
              {validation.travelers && (
                <p className="text-[11px] text-destructive">{validation.travelers}</p>
              )}
            </div>
          </div>

          {/* Optional: Date Flexibility */}
          <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-sm font-medium">Date flexibility</p>
                <p className="text-xs text-muted-foreground">Search ±2 days for better prices</p>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground/50 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs max-w-[200px]">
                  TripMaster will check nearby dates to find cheaper fares while keeping your preferred window.
                </TooltipContent>
              </Tooltip>
            </div>
            <Switch checked={dateFlexible} onCheckedChange={setDateFlexible} />
          </div>

          {/* Optional: Preference Bias */}
          <div className="rounded-lg bg-secondary/30 px-3 py-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Preference bias</p>
              <span className={cn("text-xs font-mono transition-colors", biasColor)}>
                {biasLabel}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-14 shrink-0">Cheaper</span>
              <Slider
                value={preferenceBias}
                onValueChange={setPreferenceBias}
                max={100}
                step={5}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-14 shrink-0 text-right">Comfort</span>
            </div>
          </div>
        </div>

        {/* Agent arming preview */}
        {agentPreview && (
          <div className="flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/10 px-3 py-2.5 animate-slide-up">
            <Zap className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="text-primary font-medium">TripMaster will:</span>{" "}
              {agentPreview}
            </p>
          </div>
        )}

        <Button
          className="w-full"
          disabled={!isValid}
          onClick={handleSubmit}
        >
          <Plane className="h-4 w-4 mr-2" />
          Create Trip
        </Button>

        {/* SMS continuity hint */}
        <p className="text-center text-[11px] text-muted-foreground/50 flex items-center justify-center gap-1">
          <MessageSquare className="h-3 w-3" />
          You can continue refining this trip via SMS
        </p>
      </DialogContent>
    </Dialog>
  );
}
