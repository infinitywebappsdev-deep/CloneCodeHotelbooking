import { useState, useId } from "react";
import {
  PROJECT_ASSETS,
  type ProjectImageCategory,
  extractYouTubeId,
  getYouTubeThumbnailUrl,
} from "@/lib/project-images";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FolderOpen,
  Upload,
  Youtube,
  Link as LinkIcon,
  Image as ImageIcon,
  Check,
  Search,
  X,
  Copy,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface MediaImagePickerProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  description?: string;
  placeholder?: string;
  compact?: boolean;
}

export function MediaImagePicker({
  value,
  onChange,
  label,
  description,
  compact = false,
}: MediaImagePickerProps) {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ProjectImageCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputId = useId();

  // Filter project assets
  const filteredAssets = PROJECT_ASSETS.filter((asset) => {
    const matchesCategory = activeCategory === "all" || asset.category === activeCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      asset.publicPath.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // YouTube parser
  const detectedYouTubeId = extractYouTubeId(urlInput);
  const youtubeMaxRes = detectedYouTubeId
    ? getYouTubeThumbnailUrl(detectedYouTubeId, "maxres")
    : null;
  const youtubeHq = detectedYouTubeId ? getYouTubeThumbnailUrl(detectedYouTubeId, "hq") : null;

  function handleFileSelect(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPG, PNG, WebP, SVG).");
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setUploadPreview(dataUrl);
      setUploading(false);
    };
    reader.onerror = () => {
      toast.error("Failed to read image file.");
      setUploading(false);
    };
    reader.readAsDataURL(file);
  }

  function selectImage(url: string, assetName?: string) {
    onChange(url);
    setOpen(false);
    toast.success(assetName ? `Selected: ${assetName}` : "Image applied.");
  }

  const categoryCounts = {
    all: PROJECT_ASSETS.length,
    rooms: PROJECT_ASSETS.filter((a) => a.category === "rooms").length,
    lobby: PROJECT_ASSETS.filter((a) => a.category === "lobby").length,
    dining: PROJECT_ASSETS.filter((a) => a.category === "dining").length,
    events: PROJECT_ASSETS.filter((a) => a.category === "events").length,
    exterior: PROJECT_ASSETS.filter((a) => a.category === "exterior").length,
  };

  return (
    <div className="space-y-2">
      {label && <Label className="text-xs font-medium text-foreground">{label}</Label>}

      <div
        className={`rounded-xl border border-border/70 bg-card p-3 transition-colors ${
          compact ? "p-2.5" : "p-3.5"
        }`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Thumbnail preview */}
          <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted sm:w-36">
            {value ? (
              <img
                src={value}
                alt="Selected preview"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
                <ImageIcon className="h-6 w-6 opacity-40" />
                <span className="text-[10px] tracking-wide">No image set</span>
              </div>
            )}
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute right-1 top-1 rounded-full bg-background/80 p-1 text-foreground shadow-sm hover:bg-background"
                title="Clear image"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Action triggers & URL preview */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button type="button" size="sm" variant="default" className="gap-1.5 shadow-sm">
                    <FolderOpen className="h-4 w-4" />
                    Browse Project Folders / Upload / YouTube
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden p-0">
                  <DialogHeader className="border-b border-border/60 px-6 py-4">
                    <DialogTitle className="flex items-center gap-2 text-lg font-serif">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Media & Image Selector
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      Choose high-res assets from the project folders, upload custom photography, or
                      paste any YouTube / Web URL.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="overflow-y-auto p-6 max-h-[calc(90vh-100px)]">
                    <Tabs defaultValue="folders" className="space-y-4">
                      <TabsList className="grid grid-cols-3">
                        <TabsTrigger value="folders" className="gap-2 text-xs sm:text-sm">
                          <FolderOpen className="h-4 w-4" />
                          Project Folders ({PROJECT_ASSETS.length})
                        </TabsTrigger>
                        <TabsTrigger value="upload" className="gap-2 text-xs sm:text-sm">
                          <Upload className="h-4 w-4" />
                          Upload from Device
                        </TabsTrigger>
                        <TabsTrigger value="url" className="gap-2 text-xs sm:text-sm">
                          <Youtube className="h-4 w-4 text-red-500" />
                          YouTube / Web Link
                        </TabsTrigger>
                      </TabsList>

                      {/* Tab 1: Project Folder Assets */}
                      <TabsContent value="folders" className="space-y-4">
                        {/* Search & Category filter */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search project images (e.g. Suite, Lounge, Bar, Hall)…"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-8 text-xs sm:text-sm"
                            />
                            {searchQuery && (
                              <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2.5 top-2.5 text-xs text-muted-foreground hover:text-foreground"
                              >
                                Clear
                              </button>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {(
                              [
                                { id: "all", label: "All" },
                                { id: "rooms", label: "Rooms" },
                                { id: "lobby", label: "Lobby & Lounge" },
                                { id: "dining", label: "Dining & Bar" },
                                { id: "events", label: "Halls" },
                                { id: "exterior", label: "Exterior" },
                              ] as { id: ProjectImageCategory; label: string }[]
                            ).map((cat) => (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => setActiveCategory(cat.id)}
                                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                                  activeCategory === cat.id
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted/70 text-muted-foreground hover:bg-muted"
                                }`}
                              >
                                {cat.label} ({categoryCounts[cat.id]})
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Image Grid */}
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                          {filteredAssets.map((asset) => {
                            const isSelected = value === asset.src || value === asset.publicPath;
                            return (
                              <div
                                key={asset.id}
                                onClick={() => selectImage(asset.src, asset.name)}
                                className={`group relative cursor-pointer overflow-hidden rounded-xl border transition-all hover:scale-[1.02] hover:shadow-md ${
                                  isSelected
                                    ? "border-primary ring-2 ring-primary ring-offset-2"
                                    : "border-border/60 bg-card hover:border-primary/50"
                                }`}
                              >
                                <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
                                  <img
                                    src={asset.src}
                                    alt={asset.name}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                  />
                                </div>
                                <div className="p-2">
                                  <div className="flex items-start justify-between gap-1">
                                    <p className="line-clamp-1 text-xs font-medium text-foreground">
                                      {asset.name}
                                    </p>
                                    {isSelected && (
                                      <span className="shrink-0 rounded-full bg-primary p-0.5 text-primary-foreground">
                                        <Check className="h-3 w-3" />
                                      </span>
                                    )}
                                  </div>
                                  <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                                    <span className="truncate">{asset.categoryLabel}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {filteredAssets.length === 0 && (
                          <div className="rounded-xl border border-dashed border-border/80 p-8 text-center text-muted-foreground">
                            <p className="text-sm">
                              No images matched your search "{searchQuery}".
                            </p>
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => {
                                setSearchQuery("");
                                setActiveCategory("all");
                              }}
                              className="mt-2 text-xs"
                            >
                              Reset filters
                            </Button>
                          </div>
                        )}
                      </TabsContent>

                      {/* Tab 2: Upload from Device */}
                      <TabsContent value="upload" className="space-y-4">
                        <div
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (e.dataTransfer.files?.[0]) {
                              handleFileSelect(e.dataTransfer.files[0]);
                            }
                          }}
                          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/80 bg-muted/20 p-8 text-center transition-colors hover:border-primary/50"
                        >
                          <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
                          <p className="text-sm font-medium text-foreground">
                            Drag and drop your image here
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Supports PNG, JPG, WebP, SVG up to 10MB
                          </p>

                          <div className="mt-4">
                            <input
                              id={fileInputId}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  handleFileSelect(e.target.files[0]);
                                }
                              }}
                            />
                            <Label
                              htmlFor={fileInputId}
                              className="inline-flex cursor-pointer items-center justify-center rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                            >
                              Browse Files
                            </Label>
                          </div>
                        </div>

                        {uploadPreview && (
                          <div className="rounded-xl border border-border/70 bg-card p-4 space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Upload Preview
                            </p>
                            <div className="h-48 w-full overflow-hidden rounded-lg bg-muted">
                              <img
                                src={uploadPreview}
                                alt="Upload preview"
                                className="h-full w-full object-contain"
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setUploadPreview(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => selectImage(uploadPreview, "Uploaded Image")}
                              >
                                Apply Uploaded Image
                              </Button>
                            </div>
                          </div>
                        )}
                      </TabsContent>

                      {/* Tab 3: YouTube / Web URL */}
                      <TabsContent value="url" className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-medium">
                            Image URL or YouTube Video Link
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Paste https://youtube.com/watch?v=... or https://..."
                              value={urlInput}
                              onChange={(e) => setUrlInput(e.target.value)}
                              className="text-sm"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (urlInput.trim()) {
                                  selectImage(urlInput.trim(), "Web Image");
                                }
                              }}
                              disabled={!urlInput.trim()}
                            >
                              Apply URL
                            </Button>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            Tip: Paste any YouTube link (e.g. <code>https://youtu.be/...</code> or{" "}
                            <code>youtube.com/watch?v=...</code>) to instantly extract the
                            high-definition video cover.
                          </p>
                        </div>

                        {/* YouTube Detection & Thumbnail Options */}
                        {detectedYouTubeId && (
                          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 space-y-3">
                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                              <Youtube className="h-5 w-5 text-red-500" />
                              <span>
                                YouTube Video Detected (ID: <code>{detectedYouTubeId}</code>)
                              </span>
                            </div>

                            {youtubeMaxRes && (
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                  <p className="text-xs font-medium text-muted-foreground">
                                    HD Cover Preview
                                  </p>
                                  <div className="aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                                    <img
                                      src={youtubeMaxRes}
                                      alt="YouTube Thumbnail"
                                      className="h-full w-full object-cover"
                                      onError={(e) => {
                                        if (youtubeHq) {
                                          (e.target as HTMLImageElement).src = youtubeHq;
                                        }
                                      }}
                                    />
                                  </div>
                                </div>

                                <div className="flex flex-col justify-center gap-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() =>
                                      selectImage(
                                        youtubeMaxRes,
                                        `YouTube HD Thumbnail (${detectedYouTubeId})`,
                                      )
                                    }
                                    className="gap-2"
                                  >
                                    <Sparkles className="h-4 w-4" />
                                    Use High-Res Thumbnail (MaxRes)
                                  </Button>
                                  {youtubeHq && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        selectImage(
                                          youtubeHq,
                                          `YouTube HQ Thumbnail (${detectedYouTubeId})`,
                                        )
                                      }
                                    >
                                      Use Standard HQ Thumbnail
                                    </Button>
                                  )}
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() =>
                                      selectImage(
                                        `https://www.youtube.com/embed/${detectedYouTubeId}`,
                                        `YouTube Video Embed (${detectedYouTubeId})`,
                                      )
                                    }
                                  >
                                    Use Video Embed URL
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Standard URL preview if not youtube */}
                        {!detectedYouTubeId && urlInput.startsWith("http") && (
                          <div className="rounded-xl border border-border/70 bg-card p-4 space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Web Image Preview
                            </p>
                            <div className="h-44 w-full overflow-hidden rounded-lg bg-muted">
                              <img
                                src={urlInput}
                                alt="URL preview"
                                className="h-full w-full object-contain"
                                onError={() => toast.error("Unable to load preview for this URL.")}
                              />
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => selectImage(urlInput.trim(), "Web URL")}
                              className="w-full"
                            >
                              Apply this Web Image
                            </Button>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>
                </DialogContent>
              </Dialog>

              {value && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(value);
                    toast.success("Image URL copied to clipboard.");
                  }}
                  className="gap-1 text-xs"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy URL
                </Button>
              )}
            </div>

            {/* Direct Input Field */}
            <div className="space-y-1">
              <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder || "Image path or URL (e.g. /images/... or https://...)"}
                className="h-8 text-xs font-mono"
              />
              {description && <p className="text-[11px] text-muted-foreground">{description}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Dedicated Full Media Library Browser for the CMS Media Tab
 */
export function MediaLibraryBrowser() {
  const [activeCategory, setActiveCategory] = useState<ProjectImageCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<(typeof PROJECT_ASSETS)[0] | null>(null);

  const filteredAssets = PROJECT_ASSETS.filter((asset) => {
    const matchesCategory = activeCategory === "all" || asset.category === activeCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      asset.publicPath.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Header filter controls */}
      <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search hotel photography by name, tag or space…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { id: "all", label: "All Assets" },
              { id: "rooms", label: "Suites & Rooms" },
              { id: "lobby", label: "Lobby & Lounges" },
              { id: "dining", label: "Dining & Bars" },
              { id: "events", label: "Halls & Events" },
              { id: "exterior", label: "Grounds & Exterior" },
            ] as { id: ProjectImageCategory; label: string }[]
          ).map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Assets */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            onClick={() => setSelectedAsset(asset)}
            className="group relative cursor-pointer overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm transition-all hover:scale-[1.02] hover:border-primary/50 hover:shadow-md"
          >
            <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
              <img
                src={asset.src}
                alt={asset.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className="p-3">
              <Badge variant="secondary" className="mb-1 text-[10px]">
                {asset.categoryLabel}
              </Badge>
              <h3 className="line-clamp-1 text-xs font-semibold text-foreground">{asset.name}</h3>
              <p className="mt-1 line-clamp-1 font-mono text-[10px] text-muted-foreground">
                {asset.publicPath}
              </p>
              <div className="mt-2.5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(asset.publicPath);
                    toast.success(`Copied path: ${asset.publicPath}`);
                  }}
                  className="inline-flex items-center gap-1 rounded bg-muted px-2 py-1 text-[10px] font-medium text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Copy className="h-3 w-3" />
                  Copy Path
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(asset.src);
                    toast.success("Copied image source URL.");
                  }}
                  className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
                >
                  Copy Asset
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Asset Preview Modal */}
      {selectedAsset && (
        <Dialog open={Boolean(selectedAsset)} onOpenChange={() => setSelectedAsset(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-serif">{selectedAsset.name}</DialogTitle>
              <DialogDescription>{selectedAsset.categoryLabel}</DialogDescription>
            </DialogHeader>
            <div className="overflow-hidden rounded-xl bg-muted">
              <img
                src={selectedAsset.src}
                alt={selectedAsset.name}
                className="h-auto max-h-[50vh] w-full object-contain"
              />
            </div>
            <div className="space-y-2 rounded-lg bg-muted/40 p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Public Web Path:</span>
                <code className="font-mono text-foreground">{selectedAsset.publicPath}</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tags:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedAsset.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px]">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(selectedAsset.publicPath);
                  toast.success("Public path copied to clipboard.");
                }}
              >
                Copy Path
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(selectedAsset.src);
                  toast.success("Asset URL copied to clipboard.");
                }}
              >
                Copy Full Asset URL
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
