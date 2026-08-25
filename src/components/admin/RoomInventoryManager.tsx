import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminRooms, saveRoom, createRoom, deleteRoom } from "@/lib/admin.functions";
import type { RoomRecord } from "@/lib/booking";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { MediaImagePicker } from "@/components/admin/MediaImagePicker";
import { toast } from "sonner";
import { naira } from "@/lib/hotel";
import {
  Plus,
  Search,
  Trash2,
  Edit3,
  Bed,
  Users,
  Maximize2,
  CheckCircle,
  Eye,
  EyeOff,
  Sparkles,
  DollarSign,
  Layers,
  X,
  AlertTriangle,
} from "lucide-react";

const SUGGESTED_AMENITIES = [
  "King Bed",
  "Queen Bed",
  "Separate Lounge",
  "Butler Service",
  "Complimentary Breakfast",
  "Rain Shower",
  "Smart TV with DSTV",
  "Free High-Speed Wi-Fi",
  "Air Conditioning",
  "Executive Work Desk",
  "Mini Bar Refrigerator",
  "Balcony with City View",
  "24/7 Room Service",
  "Daily Housekeeping",
  "Safe Deposit Box",
  "Airport Concierge Transfer",
];

export function RoomInventoryManager() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "hidden">("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomRecord | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<RoomRecord | null>(null);

  const {
    data: rooms = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin-rooms"],
    queryFn: () => adminRooms() as Promise<RoomRecord[]>,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-rooms"] });
    queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
    refetch();
  };

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteRoom({ data: { id } }),
    onSuccess: () => {
      toast.success("Room successfully deleted from inventory.");
      setDeletingRoom(null);
      invalidate();
    },
    onError: (err) => toast.error((err as Error).message),
  });

  // Filtered rooms
  const filteredRooms = rooms.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      r.name.toLowerCase().includes(q) ||
      r.slug.toLowerCase().includes(q) ||
      (r.blurb && r.blurb.toLowerCase().includes(q)) ||
      (r.features && r.features.some((f) => f.toLowerCase().includes(q)));

    if (!matchesSearch) return false;
    if (filterStatus === "published") return r.published;
    if (filterStatus === "hidden") return !r.published;
    return true;
  });

  const totalInventoryUnits = rooms.reduce((acc, r) => acc + (Number(r.units) || 0), 0);
  const publishedCount = rooms.filter((r) => r.published).length;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-muted-foreground animate-pulse">Loading room inventory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top summary stats and action bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Total Room Categories
          </p>
          <p className="mt-2 text-2xl font-bold font-serif">{rooms.length} Suites & Rooms</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Active Inventory Units
          </p>
          <p className="mt-2 text-2xl font-bold font-serif">{totalInventoryUnits} Physical Keys</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Published on Website
          </p>
          <p className="mt-2 text-2xl font-bold font-serif text-emerald-600">
            {publishedCount} / {rooms.length} Active
          </p>
        </div>
      </div>

      {/* Control bar: search, filter, and Add button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by room name, size, amenities..."
              className="pl-9 text-sm"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as "all" | "published" | "hidden")}
            className="rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-foreground outline-none"
          >
            <option value="all">All Rooms</option>
            <option value="published">Published Only</option>
            <option value="hidden">Hidden/Drafts</option>
          </select>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Room Type</span>
        </Button>
      </div>

      {/* Room Inventory Grid / List */}
      {filteredRooms.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <Bed className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <h3 className="font-semibold text-lg">No matching rooms found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            Try adjusting your search criteria or create a new room type to add it to your live
            hotel inventory.
          </p>
          <Button onClick={() => setIsAddModalOpen(true)} variant="outline" className="mt-4 gap-2">
            <Plus className="h-4 w-4" /> Create Room
          </Button>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onEdit={() => setEditingRoom(room)}
              onDelete={() => setDeletingRoom(room)}
              onTogglePublish={async (published) => {
                try {
                  await saveRoom({
                    data: {
                      id: room.id,
                      name: room.name,
                      blurb: room.blurb || "",
                      rate: Number(room.rate),
                      units: Number(room.units),
                      occupancy: room.occupancy || "2 guests",
                      size: room.size || "36 sqm",
                      image_url: room.image_url || "",
                      features: room.features || [],
                      published,
                    },
                  });
                  toast.success(`${room.name} is now ${published ? "published" : "hidden"}.`);
                  invalidate();
                } catch (err) {
                  toast.error((err as Error).message);
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Create Room Modal */}
      {isAddModalOpen && (
        <RoomFormDialog
          title="Create New Room Type"
          description="Define pricing, capacity, inventory count, and amenity features for the live booking engine."
          initialValues={{
            id: "",
            slug: "",
            name: "",
            blurb: "",
            rate: 45000,
            units: 2,
            occupancy: "2 guests",
            size: "36 sqm",
            image_url: "",
            features: ["King Bed", "Complimentary Breakfast", "Rain Shower", "Free Wi-Fi"],
            published: true,
            sort_order: rooms.length,
          }}
          isCreate={true}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            setIsAddModalOpen(false);
            invalidate();
          }}
        />
      )}

      {/* Edit Room Modal */}
      {editingRoom && (
        <RoomFormDialog
          title={`Edit ${editingRoom.name}`}
          description="Update pricing, photo, capacity specifications, and guest amenities."
          initialValues={editingRoom}
          isCreate={false}
          onClose={() => setEditingRoom(null)}
          onSuccess={() => {
            setEditingRoom(null);
            invalidate();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deletingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-destructive">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="font-bold text-lg">Confirm Room Deletion</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete <strong>{deletingRoom.name}</strong> (
              {deletingRoom.slug}) from the hotel inventory? This will remove it from the booking
              engine and public showcase.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setDeletingRoom(null)}
                disabled={deleteMut.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteMut.mutate(deletingRoom.id)}
                disabled={deleteMut.isPending}
              >
                {deleteMut.isPending ? "Deleting..." : "Delete Room"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function RoomCard({
  room,
  onEdit,
  onDelete,
  onTogglePublish,
}: {
  room: RoomRecord;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: (published: boolean) => void;
}) {
  return (
    <Card className="overflow-hidden border border-border/80 transition-all hover:shadow-md flex flex-col justify-between">
      <div>
        {/* Image & Badges */}
        <div className="relative h-48 w-full bg-muted overflow-hidden">
          {room.image_url ? (
            <img src={room.image_url} alt={room.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary/50 text-muted-foreground">
              <Bed className="h-10 w-10 opacity-30" />
            </div>
          )}

          <div className="absolute top-3 left-3 flex gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase backdrop-blur-md ${
                room.published ? "bg-emerald-500/90 text-white" : "bg-black/70 text-amber-300"
              }`}
            >
              {room.published ? "Published" : "Draft / Hidden"}
            </span>
          </div>

          <div className="absolute top-3 right-3">
            <span className="rounded-lg bg-black/70 px-2.5 py-1 text-xs font-serif font-bold text-amber-300 backdrop-blur-md">
              {naira(room.rate)}{" "}
              <span className="text-[10px] font-sans font-normal text-white/80">/ night</span>
            </span>
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white backdrop-blur-md bg-black/60 rounded-lg px-2.5 py-1">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3 text-amber-300" /> {room.occupancy || "2 guests"}
            </span>
            <span className="flex items-center gap-1">
              <Maximize2 className="h-3 w-3 text-amber-300" /> {room.size || "36 sqm"}
            </span>
            <span className="flex items-center gap-1 font-semibold text-emerald-300">
              <Layers className="h-3 w-3" /> {room.units || 1}{" "}
              {Number(room.units) === 1 ? "unit" : "units"}
            </span>
          </div>
        </div>

        {/* Details & Specs */}
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-serif text-lg font-bold text-foreground">{room.name}</h3>
              <p className="text-xs text-muted-foreground font-mono">
                slug: {room.slug || room.id}
              </p>
            </div>
          </div>

          {room.blurb && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {room.blurb}
            </p>
          )}

          {/* Amenities pill preview */}
          {room.features && room.features.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {room.features.slice(0, 4).map((f) => (
                <span
                  key={f}
                  className="rounded-md border border-border/60 bg-muted/50 px-2 py-0.5 text-[10px] text-foreground/80"
                >
                  {f}
                </span>
              ))}
              {room.features.length > 4 && (
                <span className="rounded-md border border-border/60 bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  +{room.features.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-4 py-3">
        <div className="flex items-center gap-2">
          <Switch
            checked={room.published}
            onCheckedChange={onTogglePublish}
            id={`toggle-${room.id}`}
          />
          <Label htmlFor={`toggle-${room.id}`} className="text-xs cursor-pointer">
            {room.published ? "Active" : "Hidden"}
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onEdit} className="h-8 gap-1.5 text-xs">
            <Edit3 className="h-3.5 w-3.5" /> Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function RoomFormDialog({
  title,
  description,
  initialValues,
  isCreate,
  onClose,
  onSuccess,
}: {
  title: string;
  description: string;
  initialValues: Partial<RoomRecord>;
  isCreate: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(initialValues.name || "");
  const [slug, setSlug] = useState(initialValues.slug || initialValues.id || "");
  const [rate, setRate] = useState(Number(initialValues.rate) || 45000);
  const [units, setUnits] = useState(Number(initialValues.units) || 2);
  const [occupancy, setOccupancy] = useState(initialValues.occupancy || "2 guests");
  const [size, setSize] = useState(initialValues.size || "36 sqm");
  const [imageUrl, setImageUrl] = useState(initialValues.image_url || "");
  const [blurb, setBlurb] = useState(initialValues.blurb || "");
  const [features, setFeatures] = useState<string[]>(initialValues.features || []);
  const [newFeatureInput, setNewFeatureInput] = useState("");
  const [published, setPublished] = useState(
    initialValues.published !== undefined ? initialValues.published : true,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate slug when name changes if in create mode
  const handleNameChange = (val: string) => {
    setName(val);
    if (isCreate && !slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
      );
    }
  };

  const addFeature = (feat: string) => {
    const trimmed = feat.trim();
    if (trimmed && !features.includes(trimmed)) {
      setFeatures([...features, trimmed]);
      setNewFeatureInput("");
    }
  };

  const removeFeature = (feat: string) => {
    setFeatures(features.filter((f) => f !== feat));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a room name.");
      return;
    }
    if (isCreate && !slug.trim()) {
      toast.error("Please enter a unique URL slug for this room.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isCreate) {
        await createRoom({
          data: {
            slug: slug.trim().toLowerCase(),
            name: name.trim(),
            blurb: blurb.trim(),
            rate: Number(rate),
            units: Number(units),
            occupancy: occupancy.trim(),
            size: size.trim(),
            image_url: imageUrl.trim(),
            features,
            published,
          },
        });
        toast.success(`Room '${name}' created successfully.`);
      } else {
        await saveRoom({
          data: {
            id: initialValues.id || slug,
            name: name.trim(),
            blurb: blurb.trim(),
            rate: Number(rate),
            units: Number(units),
            occupancy: occupancy.trim(),
            size: size.trim(),
            image_url: imageUrl.trim(),
            features,
            published,
          },
        });
        toast.success(`Room '${name}' updated successfully.`);
      }
      onSuccess();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <Card className="w-full max-w-3xl my-8 p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="font-serif text-xl font-bold">{title}</h2>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Room Name *</Label>
              <Input
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Signature Penthouse Suite"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                URL Identifier / Slug *{" "}
                {isCreate && <span className="text-muted-foreground">(lowercase-hyphenated)</span>}
              </Label>
              <Input
                value={slug}
                disabled={!isCreate}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="e.g. signature-suite"
                required
              />
            </div>
          </div>

          {/* Pricing & Units */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Nightly Rate (₦ NGN) *</Label>
              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  step="500"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Physical Units in Hotel *</Label>
              <Input
                type="number"
                min="1"
                max="500"
                value={units}
                onChange={(e) => setUnits(Number(e.target.value))}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Max Occupancy</Label>
              <Input
                value={occupancy}
                onChange={(e) => setOccupancy(e.target.value)}
                placeholder="e.g. 2 guests"
              />
            </div>
          </div>

          {/* Size and Status */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Floor Area / Size</Label>
              <Input
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="e.g. 78 sqm"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <Label className="text-xs font-medium">Published on Live Site</Label>
                <p className="text-[11px] text-muted-foreground">
                  Visible to guests on booking engine
                </p>
              </div>
              <Switch checked={published} onCheckedChange={setPublished} />
            </div>
          </div>

          {/* Image Picker */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Room Feature Image</Label>
            <MediaImagePicker value={imageUrl} onChange={setImageUrl} label="Select Room Photo" />
          </div>

          {/* Blurb / Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Description & Architecture Notes</Label>
            <Textarea
              value={blurb}
              onChange={(e) => setBlurb(e.target.value)}
              rows={3}
              placeholder="Describe the aesthetic, windows, bathroom layout, and special touches..."
            />
          </div>

          {/* Amenities & Features */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Room Amenities & Inclusions</Label>
            <div className="flex gap-2">
              <Input
                value={newFeatureInput}
                onChange={(e) => setNewFeatureInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addFeature(newFeatureInput);
                  }
                }}
                placeholder="Type custom amenity and press Add..."
                className="text-xs"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => addFeature(newFeatureInput)}
                className="text-xs shrink-0"
              >
                Add Amenity
              </Button>
            </div>

            {/* Selected features */}
            {features.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {features.map((feat) => (
                  <span
                    key={feat}
                    className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                  >
                    <span>{feat}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(feat)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Quick suggested amenities */}
            <div className="space-y-1 pt-1">
              <span className="text-[11px] text-muted-foreground">
                Click to quickly add standard amenities:
              </span>
              <div className="flex flex-wrap gap-1">
                {SUGGESTED_AMENITIES.filter((a) => !features.includes(a))
                  .slice(0, 10)
                  .map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => addFeature(amenity)}
                      className="rounded-md border border-border/70 bg-background px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      + {amenity}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground font-semibold"
            >
              {isSubmitting ? "Saving..." : isCreate ? "Create Room Inventory" : "Save Changes"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
