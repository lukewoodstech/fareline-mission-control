import { useState } from "react";
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
import { CalendarIcon, Plane } from "lucide-react";
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

  const biasLabel = preferenceBias[0] < 35 ? "Cheaper" : preferenceBias[0] > 65 ? "Comfort" : "Balanced";

  const isValid = origin.trim() && destination.trim() && departDate && returnDate && budget && travelers;

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
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plane className="h-4 w-4 text-primary" />
            New Trip
          </DialogTitle>
          <DialogDescription>
            Tell the agent where you're headed. It'll start searching immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Origin + Destination */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="origin" className="text-xs">Origin</Label>
              <Input
                id="origin"
                placeholder="DEN"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                maxLength={10}
                className="font-mono uppercase"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="destination" className="text-xs">Destination</Label>
              <Input
                id="destination"
                placeholder="SAN"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                maxLength={30}
                className="font-mono uppercase"
              />
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
                    onSelect={setDepartDate}
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
                    onSelect={setReturnDate}
                    disabled={(date) => date < (departDate ?? new Date())}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
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
                min={1}
                max={99999}
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="travelers" className="text-xs">Travelers</Label>
              <Input
                id="travelers"
                type="number"
                placeholder="1"
                value={travelers}
                onChange={(e) => setTravelers(e.target.value)}
                min={1}
                max={20}
                className="font-mono"
              />
            </div>
          </div>

          {/* Optional: Date Flexibility */}
          <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2.5">
            <div>
              <p className="text-sm font-medium">Date flexibility</p>
              <p className="text-xs text-muted-foreground">Agent can check ±2 days</p>
            </div>
            <Switch checked={dateFlexible} onCheckedChange={setDateFlexible} />
          </div>

          {/* Optional: Preference Bias */}
          <div className="rounded-lg bg-secondary/30 px-3 py-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Preference bias</p>
              <span className="text-xs font-mono text-muted-foreground">{biasLabel}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">Cheaper</span>
              <Slider
                value={preferenceBias}
                onValueChange={setPreferenceBias}
                max={100}
                step={5}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground">Comfort</span>
            </div>
          </div>
        </div>

        <Button
          className="w-full mt-2"
          disabled={!isValid}
          onClick={handleSubmit}
        >
          <Plane className="h-4 w-4 mr-2" />
          Create Trip
        </Button>
      </DialogContent>
    </Dialog>
  );
}
