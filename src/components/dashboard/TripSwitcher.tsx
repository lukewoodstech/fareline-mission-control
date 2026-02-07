import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Plus, MapPin } from "lucide-react";
import type { Trip, TripStatus } from "@/types/travel";
import NewTripModal from "./NewTripModal";

const statusVariant: Record<TripStatus, "status" | "success" | "accent"> = {
  Planning: "status",
  Monitoring: "success",
  Locked: "accent",
};

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

interface TripSwitcherProps {
  trips: Trip[];
  activeTrip: Trip;
  onSwitchTrip: (tripId: string) => void;
  onCreateTrip: (trip: Omit<Trip, "id" | "status">) => void;
}

export default function TripSwitcher({
  trips,
  activeTrip,
  onSwitchTrip,
  onCreateTrip,
}: TripSwitcherProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5 font-mono text-xs h-8">
              <MapPin className="h-3 w-3 text-primary" />
              {activeTrip.origin} → {activeTrip.destination}
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 bg-card z-50">
            {trips.map((trip) => (
              <DropdownMenuItem
                key={trip.id}
                className={`flex flex-col items-start gap-1 py-2.5 px-3 cursor-pointer ${
                  trip.id === activeTrip.id ? "bg-secondary/50" : ""
                }`}
                onClick={() => onSwitchTrip(trip.id)}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono text-sm font-medium">
                    {trip.origin} → {trip.destination}
                  </span>
                  <Badge variant={statusVariant[trip.status]} className="text-[10px] py-0 px-1.5">
                    {trip.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>
                    {formatDate(trip.departDate)} – {formatDate(trip.returnDate)}
                  </span>
                  <span>·</span>
                  <span>${trip.budget}</span>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="py-2.5 px-3 cursor-pointer text-primary"
              onClick={() => setModalOpen(true)}
            >
              <Plus className="h-3.5 w-3.5 mr-2" />
              New Trip
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <NewTripModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onCreateTrip={(trip) => {
          onCreateTrip(trip);
          setModalOpen(false);
        }}
      />
    </>
  );
}
