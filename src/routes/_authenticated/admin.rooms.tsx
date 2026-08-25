import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adminRooms, saveRoom } from "@/lib/admin.functions";
import type { RoomRecord } from "@/lib/booking";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/rooms")({
  component: RoomsPage,
});

function RoomsPage() {
  const queryClient = useQueryClient();
  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ["admin-rooms"],
    queryFn: () => adminRooms() as Promise<RoomRecord[]>,
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading room inventory…</p>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Rates, descriptions and unit counts feed the public website and live availability instantly.
      </p>
      {rooms.map((room) => (
        <RoomEditor
          key={room.id}
          room={room}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["admin-rooms"] });
            queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
          }}
        />
      ))}
    </div>
  );
}

function RoomEditor({ room, onSaved }: { room: RoomRecord; onSaved: () => void }) {
  const [draft, setDraft] = useState({
    ...room,
    image_url: room.image_url ?? "",
    features: room.features ?? [],
  });

  const save = useMutation({
    mutationFn: () =>
      saveRoom({
        data: {
          id: draft.id,
          name: draft.name,
          blurb: draft.blurb,
          rate: Number(draft.rate),
          units: Number(draft.units),
          occupancy: draft.occupancy,
          size: draft.size,
          image_url: draft.image_url,
          features: draft.features,
          published: draft.published,
        },
      }),
    onSuccess: () => {
      toast.success(`${draft.name} saved.`);
      onSaved();
    },
    onError: (error) => toast.error((error as Error).message),
  });

  return (
    <Card className="grid gap-4 p-5 lg:grid-cols-[220px_1fr]">
      <div>
        {draft.image_url ? (
          <img
            src={draft.image_url}
            alt={draft.name}
            className="h-36 w-full rounded-lg object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-36 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
            No image
          </div>
        )}
        <div className="mt-3 flex items-center gap-2">
          <Switch
            checked={draft.published}
            onCheckedChange={(published) => setDraft({ ...draft, published })}
            id={`pub-${room.id}`}
          />
          <Label htmlFor={`pub-${room.id}`} className="text-xs">
            {draft.published ? "Published" : "Hidden"}
          </Label>
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Name</Label>
            <Input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </div>
          <div>
            <Label>Rate per night (₦)</Label>
            <Input
              type="number"
              value={draft.rate}
              onChange={(e) => setDraft({ ...draft, rate: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label>Units available</Label>
            <Input
              type="number"
              value={draft.units}
              onChange={(e) => setDraft({ ...draft, units: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label>Occupancy</Label>
            <Input
              value={draft.occupancy}
              onChange={(e) => setDraft({ ...draft, occupancy: e.target.value })}
            />
          </div>
          <div>
            <Label>Size</Label>
            <Input
              value={draft.size}
              onChange={(e) => setDraft({ ...draft, size: e.target.value })}
            />
          </div>
          <div>
            <Label>Image URL</Label>
            <Input
              value={draft.image_url}
              onChange={(e) => setDraft({ ...draft, image_url: e.target.value })}
            />
          </div>
        </div>
        <div>
          <Label>Description</Label>
          <Textarea
            rows={2}
            value={draft.blurb}
            onChange={(e) => setDraft({ ...draft, blurb: e.target.value })}
          />
        </div>
        <div>
          <Label>Features (comma separated)</Label>
          <Input
            value={draft.features.join(", ")}
            onChange={(e) =>
              setDraft({
                ...draft,
                features: e.target.value
                  .split(",")
                  .map((f) => f.trim())
                  .filter(Boolean),
              })
            }
          />
        </div>
        <Button size="sm" disabled={save.isPending} onClick={() => save.mutate()}>
          {save.isPending ? "Saving…" : "Save room"}
        </Button>
      </div>
    </Card>
  );
}
