import { useState, useId, useRef, useEffect } from "react";
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
  Video,
  FileText,
  Trash2,
  FolderPlus,
  Filter,
  Grid,
  List as ListIcon,
  Play,
  Eye,
  Info,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listMediaAssets,
  saveMediaAsset,
  deleteMediaAsset,
  listMediaFolders,
  createMediaFolder,
  deleteMediaFolder,
  DEFAULT_MEDIA_FOLDERS,
} from "@/lib/cms.functions";

export interface MediaItem {
  id: string;
  title: string;
  url: string;
  thumbnail_url?: string;
  file_type: "image" | "video" | "document" | "audio";
  mime_type?: string;
  file_size?: number;
  file_size_formatted?: string;
  dimensions?: string;
  folder_id: string;
  folder_name: string;
  alt_text?: string;
  caption?: string;
  tags?: string[];
  created_at?: string;
}

interface MediaImagePickerProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  description?: string;
  placeholder?: string;
  compact?: boolean;
  acceptVideo?: boolean;
}

/** Format byte size to human-readable string */
function formatBytes(bytes: number, decimals = 1) {
  if (!+bytes) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function MediaImagePicker({
  value,
  onChange,
  label,
  description,
  compact = false,
  acceptVideo = true,
}: MediaImagePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-1.5">
      {label && <Label className="text-xs font-medium text-foreground">{label}</Label>}
      {description && <p className="text-[11px] text-muted-foreground">{description}</p>}

      <div
        className={`rounded-xl border border-border/70 bg-card p-3 transition-colors ${
          compact ? "p-2.5" : "p-3.5"
        }`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Thumbnail preview */}
          <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted sm:w-36">
            {value ? (
              value.endsWith(".mp4") ||
              value.endsWith(".webm") ||
              value.includes("youtube.com") ||
              value.includes("youtu.be") ? (
                <div className="relative flex h-full w-full items-center justify-center bg-black/80 text-white">
                  <Play className="h-7 w-7 text-primary" />
                  <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1 text-[9px] font-mono">
                    VIDEO
                  </span>
                </div>
              ) : (
                <img
                  src={value}
                  alt="Selected preview"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              )
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
                <ImageIcon className="h-6 w-6 opacity-40" />
                <span className="text-[10px] tracking-wide">No media selected</span>
              </div>
            )}
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute right-1 top-1 rounded-full bg-background/90 p-1 text-foreground shadow-sm hover:bg-background"
                title="Remove media"
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
                    Browse Media Library / Upload
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-h-[92vh] max-w-5xl overflow-hidden p-0">
                  <DialogHeader className="border-b border-border/60 px-6 py-4">
                    <DialogTitle className="flex items-center gap-2 text-lg font-serif">
                      <Sparkles className="h-5 w-5 text-primary" />
                      WordPress-Grade Media Library & File Browser
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      Browse hotel photography, upload images & videos from your computer, or paste
                      YouTube links.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="overflow-y-auto p-6 max-h-[calc(92vh-90px)]">
                    <MediaLibraryBrowser
                      onSelect={(url) => {
                        onChange(url);
                        setOpen(false);
                      }}
                      selectedUrl={value}
                      acceptVideo={acceptVideo}
                    />
                  </div>
                </DialogContent>
              </Dialog>

              {value && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="gap-1 text-xs"
                  onClick={() => {
                    navigator.clipboard.writeText(value);
                    toast.success("URL copied to clipboard");
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy URL
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Input
                placeholder="Or paste direct image/video URL…"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MediaLibraryBrowserProps {
  onSelect?: (url: string, asset?: MediaItem | { name: string; src: string }) => void;
  selectedUrl?: string;
  acceptVideo?: boolean;
}

export function MediaLibraryBrowser({
  onSelect,
  selectedUrl,
  acceptVideo = true,
}: MediaLibraryBrowserProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [activeTab, setActiveTab] = useState<"library" | "upload" | "url">("library");
  const [activeFolder, setActiveFolder] = useState<string>("all");
  const [mediaTypeFilter, setMediaTypeFilter] = useState<"all" | "image" | "video" | "document">(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [viewLayout, setViewLayout] = useState<"grid" | "list">("grid");
  const [selectedAsset, setSelectedAsset] = useState<MediaItem | null>(null);

  // Upload states
  const [uploadFiles, setUploadFiles] = useState<
    Array<{ file: File; preview: string; progress: number; type: string }>
  >([]);
  const [targetFolder, setTargetFolder] = useState<string>("uploads");
  const [isDragging, setIsDragging] = useState(false);

  // URL / Video states
  const [externalUrl, setExternalUrl] = useState("");
  const [externalTitle, setExternalTitle] = useState("");
  const [externalFolder, setExternalFolder] = useState("videos");

  // New folder creation state
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDesc, setNewFolderDesc] = useState("");

  // Queries
  const { data: userAssets = [], refetch: refetchAssets } = useQuery({
    queryKey: ["media-assets"],
    queryFn: () => listMediaAssets(),
  });

  const { data: customFolders = [], refetch: refetchFolders } = useQuery({
    queryKey: ["media-folders"],
    queryFn: () => listMediaFolders(),
  });

  // Combine system default folders + custom created folders
  const allFolders = [
    ...DEFAULT_MEDIA_FOLDERS,
    ...(customFolders as Array<{ id: string; name: string; description?: string }>).filter(
      (cf) => !DEFAULT_MEDIA_FOLDERS.some((df) => df.id === cf.id),
    ),
  ];

  // Convert project static assets into standard MediaItems
  const projectMediaItems: MediaItem[] = PROJECT_ASSETS.map((asset) => ({
    id: `project-${asset.id}`,
    title: asset.name,
    url: asset.src,
    thumbnail_url: asset.src,
    file_type: "image",
    mime_type: "image/jpeg",
    folder_id:
      asset.category === "dining"
        ? "dining"
        : asset.category === "lobby"
          ? "lobby"
          : asset.category === "rooms"
            ? "rooms"
            : asset.category === "events"
              ? "events"
              : asset.category === "exterior"
                ? "exterior"
                : "uploads",
    folder_name: asset.categoryLabel,
    tags: asset.tags,
    dimensions: "High Resolution",
    created_at: "2026-08-01T00:00:00.000Z",
  }));

  // Combine project assets and user uploaded media items
  const combinedAssets: MediaItem[] = [
    ...(userAssets as unknown as MediaItem[]),
    ...projectMediaItems,
  ];

  // Filter items
  const filteredAssets = combinedAssets.filter((item) => {
    const matchesFolder = activeFolder === "all" || item.folder_id === activeFolder;
    const matchesType = mediaTypeFilter === "all" || item.file_type === mediaTypeFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tags && item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      item.url.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesType && matchesSearch;
  });

  // Mutations
  const saveAssetMut = useMutation({
    mutationFn: (data: unknown) => saveMediaAsset({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-assets"] });
      refetchAssets();
    },
  });

  const deleteAssetMut = useMutation({
    mutationFn: (id: string) => deleteMediaAsset({ data: { id } }),
    onSuccess: () => {
      toast.success("Media asset deleted.");
      queryClient.invalidateQueries({ queryKey: ["media-assets"] });
      setSelectedAsset(null);
      refetchAssets();
    },
    onError: (err) => toast.error((err as Error).message),
  });

  const createFolderMut = useMutation({
    mutationFn: (data: { name: string; description: string }) => createMediaFolder({ data }),
    onSuccess: () => {
      toast.success(`Folder "${newFolderName}" created!`);
      setNewFolderName("");
      setNewFolderDesc("");
      setNewFolderOpen(false);
      queryClient.invalidateQueries({ queryKey: ["media-folders"] });
      refetchFolders();
    },
    onError: (err) => toast.error((err as Error).message),
  });

  // Handle Drag & Drop / File Select
  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const newUploads: Array<{ file: File; preview: string; progress: number; type: string }> = [];

    Array.from(files).forEach((file) => {
      let type: "image" | "video" | "document" | "audio" = "document";
      if (file.type.startsWith("image/")) type = "image";
      else if (file.type.startsWith("video/")) type = "video";
      else if (file.type.startsWith("audio/")) type = "audio";

      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        newUploads.push({ file, preview, progress: 0, type });
        if (newUploads.length === files.length) {
          setUploadFiles((prev) => [...prev, ...newUploads]);
          setActiveTab("upload");
        }
      };
      reader.readAsDataURL(file);
    });
  }

  // Upload processing
  async function processUploads() {
    if (uploadFiles.length === 0) return;
    const folderObj = allFolders.find((f) => f.id === targetFolder) || {
      id: "uploads",
      name: "Custom Uploads",
    };

    let completed = 0;
    for (const item of uploadFiles) {
      try {
        const isVideo = item.file.type.startsWith("video/");
        const isImg = item.file.type.startsWith("image/");
        const fileType = isVideo ? "video" : isImg ? "image" : "document";

        await saveAssetMut.mutateAsync({
          title: item.file.name.replace(/\.[^/.]+$/, ""),
          url: item.preview,
          thumbnail_url: item.preview,
          file_type: fileType,
          mime_type: item.file.type || (isVideo ? "video/mp4" : "image/jpeg"),
          file_size: item.file.size,
          file_size_formatted: formatBytes(item.file.size),
          dimensions: isImg ? "Uploaded Image" : isVideo ? "Video Clip" : "Document",
          folder_id: folderObj.id,
          folder_name: folderObj.name,
          alt_text: item.file.name,
          caption: `Uploaded on ${new Date().toLocaleDateString()}`,
          tags: ["upload", folderObj.id],
        });
        completed++;
      } catch (err) {
        toast.error(`Failed to upload ${item.file.name}: ${(err as Error).message}`);
      }
    }

    toast.success(`Successfully uploaded ${completed} file(s) to "${folderObj.name}".`);
    setUploadFiles([]);
    setActiveTab("library");
    setActiveFolder(folderObj.id);
  }

  // Handle URL / YouTube submission
  async function handleUrlSubmit() {
    if (!externalUrl.trim()) {
      toast.error("Please enter a valid URL.");
      return;
    }

    const ytId = extractYouTubeId(externalUrl);
    const isYt = !!ytId;
    const folderObj = allFolders.find((f) => f.id === externalFolder) || {
      id: "videos",
      name: "Videos & Virtual Tours",
    };

    const thumbnailUrl = isYt ? getYouTubeThumbnailUrl(ytId!, "maxres") || "" : externalUrl;
    const title = externalTitle.trim() || (isYt ? `YouTube Video (${ytId})` : "Web Media Asset");

    try {
      await saveAssetMut.mutateAsync({
        title,
        url: externalUrl.trim(),
        thumbnail_url: thumbnailUrl,
        file_type: isYt || externalUrl.endsWith(".mp4") ? "video" : "image",
        mime_type: isYt ? "video/youtube" : "video/mp4",
        file_size: 0,
        file_size_formatted: "Stream",
        dimensions: "Web Embed / HD",
        folder_id: folderObj.id,
        folder_name: folderObj.name,
        alt_text: title,
        caption: isYt ? "YouTube stream embed" : "External web media",
        tags: [isYt ? "youtube" : "web", "video", folderObj.id],
      });

      toast.success(`Added media asset "${title}" to "${folderObj.name}".`);
      setExternalUrl("");
      setExternalTitle("");
      setActiveTab("library");
      setActiveFolder(folderObj.id);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      {/* Top action tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as never)} className="w-full">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-3">
          <TabsList className="grid grid-cols-3 w-full sm:w-auto">
            <TabsTrigger value="library" className="gap-1.5 text-xs">
              <FolderOpen className="h-4 w-4" />
              Media Library ({combinedAssets.length})
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-1.5 text-xs">
              <Upload className="h-4 w-4" />
              Upload Files
              {uploadFiles.length > 0 && (
                <Badge className="ml-1 px-1.5 py-0 text-[10px] bg-primary text-white">
                  {uploadFiles.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="url" className="gap-1.5 text-xs">
              <Youtube className="h-4 w-4 text-red-500" />
              Video / Web URL
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,application/pdf"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-3.5 w-3.5 text-primary" />
              Browse Computer…
            </Button>
          </div>
        </div>

        {/* =============================================================
            TAB 1: MEDIA LIBRARY (Folders, Search, Filters, Grid)
            ============================================================= */}
        <TabsContent value="library" className="space-y-4 pt-2">
          {/* Controls Bar */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
            {/* Search Input */}
            <div className="relative lg:col-span-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, tag, or folder…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs"
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

            {/* Type Filters */}
            <div className="flex flex-wrap items-center gap-1.5 lg:col-span-5">
              <Button
                type="button"
                size="sm"
                variant={mediaTypeFilter === "all" ? "default" : "outline"}
                className="h-8 text-xs"
                onClick={() => setMediaTypeFilter("all")}
              >
                All Types
              </Button>
              <Button
                type="button"
                size="sm"
                variant={mediaTypeFilter === "image" ? "default" : "outline"}
                className="h-8 text-xs gap-1"
                onClick={() => setMediaTypeFilter("image")}
              >
                <ImageIcon className="h-3.5 w-3.5" />
                Images
              </Button>
              {acceptVideo && (
                <Button
                  type="button"
                  size="sm"
                  variant={mediaTypeFilter === "video" ? "default" : "outline"}
                  className="h-8 text-xs gap-1"
                  onClick={() => setMediaTypeFilter("video")}
                >
                  <Video className="h-3.5 w-3.5 text-red-500" />
                  Videos
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                variant={mediaTypeFilter === "document" ? "default" : "outline"}
                className="h-8 text-xs gap-1"
                onClick={() => setMediaTypeFilter("document")}
              >
                <FileText className="h-3.5 w-3.5" />
                Documents
              </Button>
            </div>

            {/* View layout toggles & Add folder */}
            <div className="flex items-center justify-end gap-1.5 lg:col-span-3">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 text-xs gap-1"
                onClick={() => setNewFolderOpen(true)}
              >
                <FolderPlus className="h-3.5 w-3.5 text-primary" />
                New Folder
              </Button>

              <div className="flex rounded-lg border border-border/70 p-0.5">
                <button
                  type="button"
                  onClick={() => setViewLayout("grid")}
                  className={`rounded p-1.5 transition-colors ${
                    viewLayout === "grid" ? "bg-muted text-foreground" : "text-muted-foreground"
                  }`}
                  title="Grid View"
                >
                  <Grid className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewLayout("list")}
                  className={`rounded p-1.5 transition-colors ${
                    viewLayout === "list" ? "bg-muted text-foreground" : "text-muted-foreground"
                  }`}
                  title="List View"
                >
                  <ListIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* New Folder Modal */}
          {newFolderOpen && (
            <div className="rounded-xl border border-primary/40 bg-primary/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <FolderPlus className="h-4 w-4 text-primary" />
                  Create Custom Media Folder
                </h4>
                <button
                  type="button"
                  onClick={() => setNewFolderOpen(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Folder Name</Label>
                  <Input
                    placeholder="e.g. VIP Suites 2026, Wedding Gallery…"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Description (Optional)</Label>
                  <Input
                    placeholder="Short summary of files in this folder…"
                    value={newFolderDesc}
                    onChange={(e) => setNewFolderDesc(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setNewFolderOpen(false)}
                  className="h-7 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    createFolderMut.mutate({ name: newFolderName, description: newFolderDesc })
                  }
                  disabled={!newFolderName.trim() || createFolderMut.isPending}
                  className="h-7 text-xs"
                >
                  {createFolderMut.isPending ? "Creating…" : "Save Folder"}
                </Button>
              </div>
            </div>
          )}

          {/* Main Layout: Folders Sidebar + Media Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            {/* Left Folders Sidebar */}
            <div className="md:col-span-3 space-y-1.5 rounded-xl border border-border/70 bg-card p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground px-2 py-1">
                Asset Folders
              </p>

              <button
                type="button"
                onClick={() => setActiveFolder("all")}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  activeFolder === "all"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-2">
                  <FolderOpen className="h-3.5 w-3.5" />
                  All Files
                </span>
                <span className="text-[10px] opacity-80">{combinedAssets.length}</span>
              </button>

              {allFolders.map((folder) => {
                const count = combinedAssets.filter((a) => a.folder_id === folder.id).length;
                const isSelected = activeFolder === folder.id;
                return (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => setActiveFolder(folder.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      {folder.id === "videos" ? (
                        <Video className="h-3.5 w-3.5 text-red-500 shrink-0" />
                      ) : (
                        <FolderOpen className="h-3.5 w-3.5 shrink-0" />
                      )}
                      <span className="truncate">{folder.name}</span>
                    </span>
                    <span className="text-[10px] opacity-80 shrink-0">{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Media Grid / List */}
            <div className="md:col-span-9 space-y-3">
              {filteredAssets.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 p-12 text-center">
                  <ImageIcon className="h-10 w-10 text-muted-foreground opacity-30 mb-2" />
                  <p className="text-sm font-medium text-foreground">
                    No media assets found in this folder
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                    Drag and drop files here, browse files from your computer, or paste a video
                    link.
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-1.5 text-xs"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Upload to this folder
                    </Button>
                  </div>
                </div>
              ) : viewLayout === "grid" ? (
                /* Grid View */
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {filteredAssets.map((asset) => {
                    const isSelected = selectedUrl === asset.url;
                    const isCurrentInspect = selectedAsset?.id === asset.id;
                    const isVid = asset.file_type === "video";
                    const isYt = extractYouTubeId(asset.url);

                    return (
                      <div
                        key={asset.id}
                        onClick={() => {
                          setSelectedAsset(asset);
                          if (onSelect) onSelect(asset.url, asset);
                        }}
                        className={`group relative flex flex-col overflow-hidden rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                          isSelected
                            ? "ring-2 ring-primary border-primary bg-primary/5"
                            : isCurrentInspect
                              ? "ring-2 ring-accent border-accent bg-accent/5"
                              : "border-border/70 bg-card hover:border-foreground/30"
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                          {isVid ? (
                            isYt ? (
                              <img
                                src={getYouTubeThumbnailUrl(isYt, "hq") || asset.thumbnail_url}
                                alt={asset.title}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-black/85 text-white">
                                <Play className="h-8 w-8 text-primary opacity-90" />
                              </div>
                            )
                          ) : (
                            <img
                              src={asset.thumbnail_url || asset.url}
                              alt={asset.title}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                            />
                          )}

                          {/* Top Badges */}
                          <div className="absolute left-1.5 top-1.5 flex gap-1">
                            {isVid && (
                              <span className="flex items-center gap-0.5 rounded bg-black/80 px-1.5 py-0.5 text-[9px] font-medium text-white shadow">
                                <Play className="h-2.5 w-2.5 fill-current text-red-400" />
                                Video
                              </span>
                            )}
                            {isSelected && (
                              <span className="flex items-center gap-0.5 rounded bg-primary px-1.5 py-0.5 text-[9px] font-semibold text-white shadow">
                                <Check className="h-2.5 w-2.5" />
                                Selected
                              </span>
                            )}
                          </div>

                          {/* Quick action overlay */}
                          <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button
                              type="button"
                              size="icon"
                              variant="secondary"
                              className="h-7 w-7 rounded-full bg-white/90 text-foreground hover:bg-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAsset(asset);
                              }}
                              title="Inspect Details"
                            >
                              <Info className="h-3.5 w-3.5" />
                            </Button>
                            {onSelect && (
                              <Button
                                type="button"
                                size="sm"
                                variant="default"
                                className="h-7 px-2 text-[11px]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelect(asset.url, asset);
                                }}
                              >
                                Insert
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Title & Metadata */}
                        <div className="p-2 space-y-0.5">
                          <p
                            className="text-xs font-medium text-foreground truncate"
                            title={asset.title}
                          >
                            {asset.title}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span className="truncate">{asset.folder_name}</span>
                            <span>{asset.dimensions || asset.file_size_formatted}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* List View */
                <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b bg-muted/50 text-muted-foreground">
                      <tr>
                        <th className="p-2.5 font-medium">Asset</th>
                        <th className="p-2.5 font-medium">Folder</th>
                        <th className="p-2.5 font-medium">Type</th>
                        <th className="p-2.5 font-medium">Size / Resolution</th>
                        <th className="p-2.5 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredAssets.map((asset) => {
                        const isSelected = selectedUrl === asset.url;
                        return (
                          <tr
                            key={asset.id}
                            onClick={() => {
                              setSelectedAsset(asset);
                              if (onSelect) onSelect(asset.url, asset);
                            }}
                            className={`cursor-pointer transition-colors hover:bg-muted/40 ${
                              isSelected ? "bg-primary/5" : ""
                            }`}
                          >
                            <td className="p-2.5 flex items-center gap-2.5">
                              <div className="h-9 w-9 shrink-0 overflow-hidden rounded bg-muted">
                                <img
                                  src={asset.thumbnail_url || asset.url}
                                  alt={asset.title}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <span className="font-medium text-foreground truncate max-w-xs">
                                {asset.title}
                              </span>
                            </td>
                            <td className="p-2.5 text-muted-foreground">{asset.folder_name}</td>
                            <td className="p-2.5 uppercase text-[10px] font-mono">
                              {asset.file_type}
                            </td>
                            <td className="p-2.5 text-muted-foreground">
                              {asset.dimensions || asset.file_size_formatted}
                            </td>
                            <td className="p-2.5 text-right space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAsset(asset);
                                }}
                              >
                                Details
                              </Button>
                              {onSelect && (
                                <Button
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelect(asset.url, asset);
                                  }}
                                >
                                  Use
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Asset Inspector Drawer */}
              {selectedAsset && (
                <div className="rounded-xl border border-border/80 bg-muted/30 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Info className="h-4 w-4 text-primary" />
                      Asset Details &amp; Inspector
                    </h4>
                    <button
                      type="button"
                      onClick={() => setSelectedAsset(null)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-12">
                    {/* Media Preview Player */}
                    <div className="md:col-span-5 space-y-2">
                      <div className="overflow-hidden rounded-lg border bg-black/5 aspect-video flex items-center justify-center">
                        {selectedAsset.file_type === "video" ? (
                          extractYouTubeId(selectedAsset.url) ? (
                            <iframe
                              src={`https://www.youtube-nocookie.com/embed/${extractYouTubeId(selectedAsset.url)}`}
                              title={selectedAsset.title}
                              className="h-full w-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <video
                              src={selectedAsset.url}
                              controls
                              className="h-full w-full object-contain"
                            />
                          )
                        ) : (
                          <img
                            src={selectedAsset.url}
                            alt={selectedAsset.title}
                            className="h-full w-full object-contain max-h-48"
                          />
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 w-full text-xs gap-1"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedAsset.url);
                            toast.success("URL copied to clipboard!");
                          }}
                        >
                          <Copy className="h-3.5 w-3.5" />
                          Copy Link
                        </Button>
                        <a
                          href={selectedAsset.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-7 items-center justify-center rounded-md border border-input bg-background px-2.5 text-xs font-medium hover:bg-accent hover:text-accent-foreground"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* Metadata & Editing */}
                    <div className="md:col-span-7 space-y-2 text-xs">
                      <div>
                        <Label className="text-[11px]">Asset Title</Label>
                        <Input
                          value={selectedAsset.title}
                          onChange={(e) =>
                            setSelectedAsset({ ...selectedAsset, title: e.target.value })
                          }
                          className="h-7 text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-[11px]">Folder</Label>
                          <select
                            value={selectedAsset.folder_id}
                            onChange={(e) => {
                              const f = allFolders.find((fd) => fd.id === e.target.value);
                              setSelectedAsset({
                                ...selectedAsset,
                                folder_id: e.target.value,
                                folder_name: f ? f.name : "Custom Uploads",
                              });
                            }}
                            className="h-7 w-full rounded-md border border-input bg-background px-2 text-xs"
                          >
                            {allFolders.map((f) => (
                              <option key={f.id} value={f.id}>
                                {f.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label className="text-[11px]">Alt Text (SEO / Screen Readers)</Label>
                          <Input
                            value={selectedAsset.alt_text ?? ""}
                            onChange={(e) =>
                              setSelectedAsset({ ...selectedAsset, alt_text: e.target.value })
                            }
                            className="h-7 text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t">
                        <div className="flex gap-2">
                          {selectedAsset.id.startsWith("project-") ? (
                            <span className="text-[11px] text-muted-foreground italic">
                              Built-in project asset
                            </span>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              className="h-7 text-xs gap-1"
                              onClick={() => {
                                if (confirm(`Delete "${selectedAsset.title}"?`)) {
                                  deleteAssetMut.mutate(selectedAsset.id);
                                }
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete Asset
                            </Button>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={async () => {
                              if (!selectedAsset.id.startsWith("project-")) {
                                await saveAssetMut.mutateAsync(selectedAsset);
                                toast.success("Asset metadata saved.");
                              }
                              if (onSelect) onSelect(selectedAsset.url, selectedAsset);
                            }}
                          >
                            {onSelect ? "Use & Apply Asset" : "Save Changes"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* =============================================================
            TAB 2: UPLOAD FILES (Drag & Drop, Multi-File Selection)
            ============================================================= */}
        <TabsContent value="upload" className="space-y-4 pt-2">
          {/* Target Folder Selector */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border/70 bg-card p-3">
            <div>
              <Label className="text-xs font-semibold">Upload Target Folder</Label>
              <p className="text-[11px] text-muted-foreground">
                Choose which section/folder these media assets belong to.
              </p>
            </div>
            <select
              value={targetFolder}
              onChange={(e) => setTargetFolder(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-3 text-xs"
            >
              {allFolders.map((f) => (
                <option key={f.id} value={f.id}>
                  📁 {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFiles(e.dataTransfer.files);
            }}
            className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
              isDragging
                ? "border-primary bg-primary/10"
                : "border-border/80 bg-muted/20 hover:border-primary/60 hover:bg-muted/30"
            }`}
          >
            <div className="rounded-full bg-primary/10 p-4 text-primary mb-3">
              <Upload className="h-8 w-8" />
            </div>
            <h3 className="font-serif text-lg font-medium text-foreground">
              Drag &amp; Drop media files here
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
              Supports Photography (JPG, PNG, WebP, SVG), Video Clips (MP4, WebM, MOV), Audio, and
              PDF Documents.
            </p>
            <div className="mt-4 flex gap-2">
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2 text-xs shadow"
              >
                <FolderOpen className="h-4 w-4" />
                Select Files from Computer
              </Button>
            </div>
          </div>

          {/* Upload Queue list */}
          {uploadFiles.length > 0 && (
            <div className="rounded-xl border border-border/70 bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-foreground">
                  Files Ready for Upload ({uploadFiles.length})
                </h4>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-xs text-muted-foreground"
                  onClick={() => setUploadFiles([])}
                >
                  Clear Queue
                </Button>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                {uploadFiles.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-muted/40 p-2 text-xs"
                  >
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
                      {item.type === "video" ? (
                        <div className="flex h-full w-full items-center justify-center bg-black/80 text-white">
                          <Play className="h-4 w-4 text-primary" />
                        </div>
                      ) : (
                        <img
                          src={item.preview}
                          alt={item.file.name}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{item.file.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatBytes(item.file.size)} • {item.type}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadFiles(uploadFiles.filter((_, i) => i !== idx))}
                      className="text-muted-foreground hover:text-foreground p-1"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  onClick={processUploads}
                  disabled={saveAssetMut.isPending}
                  className="gap-1.5 text-xs shadow-md"
                >
                  <Upload className="h-4 w-4" />
                  {saveAssetMut.isPending ? "Uploading…" : "Save All to Media Library"}
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* =============================================================
            TAB 3: VIDEO & WEB URL IMPORTER
            ============================================================= */}
        <TabsContent value="url" className="space-y-4 pt-2">
          <div className="rounded-xl border border-border/70 bg-card p-5 space-y-4">
            <div>
              <h3 className="font-serif text-base font-medium">Add Video Stream or Web Asset</h3>
              <p className="text-xs text-muted-foreground">
                Paste any YouTube video link, direct MP4 video URL, or hosted photo URL to add to
                your library.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-xs">Media Title / Description</Label>
                <Input
                  placeholder="e.g. Banky Hotel Presidential Suite Walkthrough, Wedding Promo Video…"
                  value={externalTitle}
                  onChange={(e) => setExternalTitle(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <Label className="text-xs">Media URL / YouTube Link</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://www.youtube.com/watch?v=... or https://mysite.com/video.mp4"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Save to Folder</Label>
                <select
                  value={externalFolder}
                  onChange={(e) => setExternalFolder(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
                >
                  {allFolders.map((f) => (
                    <option key={f.id} value={f.id}>
                      📁 {f.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* YouTube Preview if detected */}
              {extractYouTubeId(externalUrl) && (
                <div className="rounded-lg border border-border/70 bg-muted/40 p-3 space-y-2">
                  <p className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                    <Youtube className="h-4 w-4 text-red-500" />
                    Detected YouTube Video ID: {extractYouTubeId(externalUrl)}
                  </p>
                  <div className="aspect-video max-w-sm rounded overflow-hidden bg-black/10">
                    <img
                      src={getYouTubeThumbnailUrl(extractYouTubeId(externalUrl)!, "hq") || ""}
                      alt="YouTube thumbnail preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              )}

              <Button
                type="button"
                onClick={handleUrlSubmit}
                disabled={!externalUrl.trim() || saveAssetMut.isPending}
                className="gap-1.5 text-xs"
              >
                <CheckCircle2 className="h-4 w-4" />
                {saveAssetMut.isPending ? "Adding…" : "Add to Media Library"}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
