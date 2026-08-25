import { createFileRoute } from "@tanstack/react-router";
import { RoomInventoryManager } from "@/components/admin/RoomInventoryManager";

export const Route = createFileRoute("/_authenticated/admin/rooms")({
  component: RoomsPage,
});

function RoomsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight">Room Inventory & Rates</h1>
        <p className="text-sm text-muted-foreground">
          Manage live room categories, nightly pricing, guest capacity, and amenities across Banky
          Hotel & Suites.
        </p>
      </div>
      <RoomInventoryManager />
    </div>
  );
}
