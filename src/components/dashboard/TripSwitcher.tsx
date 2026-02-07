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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronDown, Plus, MapPin, Trash2 } from "lucide-react";
import type { Trip, TripStatus } from "@/types/travel";
import NewTripModal from "./NewTripModal";

const statusVariant: Record<TripStatus, "status" | "success" | "accent"> = {
  Planning: "status",
  Monitoring: "success",
  Locked: "accent",
};

function formatDate(d: string) {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

interface TripSwitcherProps {
  trips: Trip[];
  activeTrip: Trip | null;
  onSwitchTrip: (tripId: string) => void;
  onCreateTrip?: (trip: Omit<Trip, "id" | "status">) => void;
  onDeleteTrip?: (tripId: string) => void;
}

export default function TripSwitcher({
  trips,
  activeTrip,
  onSwitchTrip,
  onCreateTrip,
  onDeleteTrip,
}: TripSwitcherProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTripState, setDeleteTripState] = useState<Trip | null>(null);

  return (
    <>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5 font-mono text-xs h-8">
              <MapPin className="h-3 w-3 text-primary" />
              {activeTrip
                ? `${activeTrip.origin} → ${activeTrip.destination}`
                : "No trips"}
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 bg-card z-50">
            {trips.length === 0 && (
              <div className="px-3 py-4 text-center">
                <p className="text-sm text-muted-foreground">No trips yet</p>
              </div>
            )}
            {trips.map((trip) => (
              <DropdownMenuItem
                key={trip.id}
                className={`flex flex-col items-start gap-1 py-2.5 px-3 cursor-pointer ${
                  activeTrip && trip.id === activeTrip.id ? "bg-secondary/50" : ""
                }`}
                onClick={() => onSwitchTrip(trip.id)}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono text-sm font-medium">
                    {trip.origin} → {trip.destination}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={statusVariant[trip.status]} className="text-[10px] py-0 px-1.5">
                      {trip.status}
                    </Badge>
                    {onDeleteTrip && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTripState(trip);
                        }}
                        className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>
                    {formatDate(trip.departDate)} – {formatDate(trip.returnDate)}
                  </span>
                  {trip.budget > 0 && (
                    <>
                      <span>·</span>
                      <span>${trip.budget}</span>
                    </>
                  )}
                </div>
              </DropdownMenuItem>
            ))}

            {onCreateTrip && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="py-2.5 px-3 cursor-pointer text-primary"
                  onClick={() => setModalOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5 mr-2" />
                  New Trip
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {onCreateTrip && (
        <NewTripModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          onCreateTrip={(trip) => {
            onCreateTrip(trip);
            setModalOpen(false);
          }}
        />
      )}

      {/* Delete confirmation */}
      {onDeleteTrip && (
        <AlertDialog open={!!deleteTripState} onOpenChange={(open) => !open && setDeleteTripState(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete trip?</AlertDialogTitle>
              <AlertDialogDescription>
                {deleteTripState && (
                  <>
                    This will permanently remove{" "}
                    <span className="font-medium text-foreground">
                      {deleteTripState.origin} → {deleteTripState.destination}
                    </span>{" "}
                    and all its selections. This action cannot be undone.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  if (deleteTripState) {
                    onDeleteTrip(deleteTripState.id);
                    setDeleteTripState(null);
                  }
                }}
              >
                Delete Trip
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
