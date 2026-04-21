"use client";

import { useEffect, useState } from "react";

import Image from "next/image";

import {
  FileArchive,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Paperclip,
} from "lucide-react";

import MultiAttachmentUpload from "@/components/common/MultiAttachmentUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cleanUrl } from "@/utils/url";

interface RecordAttachmentsCardProps {
  title?: string;
  initialAttachments?: string[];
  onSave: (newAttachments: string[]) => Promise<void>;
  isPending?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function RecordAttachmentsCard({
  title = "Documents & Images",
  initialAttachments = [],
  onSave,
  isPending = false,
  emptyMessage = "No attached documents. Click to upload.",
  className = "border-border/40 shadow-sm bg-card/40 backdrop-blur-md rounded-lg border-dashed",
}: RecordAttachmentsCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<string[]>(initialAttachments);

  // Sync state if initialAttachments changes from outside
  useEffect(() => {
    setAttachments(initialAttachments);
  }, [initialAttachments]);

  const formatUrl = (url: string) => {
    const cleaned = cleanUrl(url);
    if (!cleaned) return "";
    if (cleaned.startsWith("http")) return cleaned;
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    return `${baseUrl.replace(/\/$/, "")}${cleaned.startsWith("/") ? cleaned : `/${cleaned}`}`;
  };

  const isImage = (url: string) =>
    /\.(png|jpg|jpeg|gif|webp)$/i.test(cleanUrl(url));

  const getFileIcon = (url: string) => {
    const cleaned = cleanUrl(url);
    const ext = cleaned.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "png":
      case "jpg":
      case "jpeg":
        return <ImageIcon size={14} className="text-blue-500" />;
      case "xls":
      case "xlsx":
      case "csv":
        return <FileSpreadsheet size={14} className="text-green-500" />;
      case "doc":
      case "docx":
      case "txt":
        return <FileText size={14} className="text-blue-600" />;
      case "pdf":
        return <FileText size={14} className="text-red-500" />;
      case "zip":
      case "rar":
        return <FileArchive size={14} className="text-purple-500" />;
      default:
        return <Paperclip size={14} className="text-primary" />;
    }
  };

  const handleSave = async () => {
    try {
      const cleaned = attachments.map(cleanUrl);
      await onSave(cleaned);
      setIsEditing(false);
    } catch (error) {
      // Error is expected to be handled by the parent or the mutation hook
      console.error("Failed to save attachments:", error);
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="py-3 px-4 border-b border-border/40 bg-muted/5 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-primary">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          {title}
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (isEditing) {
              setAttachments(initialAttachments);
            }
            setIsEditing(!isEditing);
          }}
          className="h-7 gap-1.5 border-primary/20 text-primary hover:bg-primary/10 px-2 text-xs"
          disabled={isPending}
        >
          {isEditing ? "Cancel" : "Upload / Manage"}
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        {isEditing ? (
          <div className="space-y-4">
            <MultiAttachmentUpload
              value={attachments}
              onChange={(val) => setAttachments(val)}
            />
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setAttachments(initialAttachments);
                  setIsEditing(false);
                }}
                disabled={isPending}
              >
                Reset
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isPending}>
                {isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        ) : attachments.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {attachments.map((url, i) => {
              const full = formatUrl(url);
              return (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-md border border-border/50 text-xs"
                >
                  {getFileIcon(url)}
                  <a
                    href={full}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (isImage(url)) {
                        e.preventDefault();
                        setPreviewUrl(full);
                      }
                    }}
                    className="truncate max-w-[200px] hover:underline hover:text-primary transition-colors cursor-pointer"
                    title={isImage(url) ? "Click to preview" : "Click to view"}
                  >
                    {cleanUrl(url).split("/").pop()}
                  </a>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className="rounded-lg border border-dashed border-border/50 bg-muted/10 min-h-30 flex flex-col items-center justify-center gap-2 hover:bg-muted/20 transition-colors cursor-pointer group"
            onClick={() => setIsEditing(true)}
          >
            <div className="w-8 h-8 rounded-full bg-background/60 shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
              <ImageIcon className="w-3.5 h-3.5 text-muted-foreground/60" />
            </div>
            <span className="text-sm font-medium text-muted-foreground/60">
              {emptyMessage}
            </span>
          </div>
        )}
      </CardContent>

      <Dialog
        open={!!previewUrl}
        onOpenChange={(open) => !open && setPreviewUrl(null)}
      >
        <DialogContent className="max-w-4xl w-[90vw] h-[85vh] p-1 bg-transparent border-none shadow-none flex items-center justify-center">
          <DialogHeader className="hidden">
            <DialogTitle>Image Preview</DialogTitle>
            <DialogDescription>Attachment image preview</DialogDescription>
          </DialogHeader>
          <div className="relative w-full h-full flex items-center justify-center">
            {previewUrl && (
              <Image
                src={previewUrl}
                alt="Preview"
                fill
                className="object-contain rounded-md"
                sizes="(max-width: 768px) 100vw, 80vw"
                unoptimized
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
