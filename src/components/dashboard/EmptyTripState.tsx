import { useState } from "react";
import { MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import NewTripModal from "./NewTripModal";
import type { Trip } from "@/types/travel";

interface EmptyTripStateProps {
  onCreateTrip: (trip: Omit<Trip, "id" | "status">) => void;
  onSwitchToDemo?: () => void;
}

export default function EmptyTripState({ onCreateTrip, onSwitchToDemo }: EmptyTripStateProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <main className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
      <div className="text-center space-y-6 max-w-md mx-auto animate-fade-in">
        <div className="mx-auto h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
          <MapPin className="h-10 w-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">No active trip</h2>
          <p className="text-muted-foreground leading-relaxed">
            Create a new trip to get started. TripMaster will search for the best
            flights, lodging, and activities for you.
          </p>
        </div>
        <div className="flex gap-2 justify-center">
          <Button onClick={() => setModalOpen(true)} className="gap-1.5">
            <Plus className="h-4 w-4" />
            New Trip
          </Button>
          {onSwitchToDemo && (
            <Button variant="outline" onClick={onSwitchToDemo}>
              Try Demo Mode
            </Button>
          )}
        </div>
      </div>

      <NewTripModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onCreateTrip={(trip) => {
          onCreateTrip(trip);
          setModalOpen(false);
        }}
      />
    </main>
  );
}
