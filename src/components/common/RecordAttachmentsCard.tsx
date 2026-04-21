"use client";

import { useEffect, useState, useRef } from "react";

import Image from "next/image";

import {
  FileArchive,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Loader2,
  Paperclip,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { endpoints } from "@/config/endpoints";
import { useMutation } from "@/hooks/useMutation";
import { getApiErrorMessage } from "@/utils/api-error";
import { cleanUrl } from "@/utils/url";
import { toast } from "sonner";

const ALLOWED_EXTENSIONS = [
  "xls",
  "xlsx",
  "png",
  "rar",
  "docx",
  "jpeg",
  "csv",
  "jpg",
  "pdf",
  "doc",
  "zip",
  "txt",
];


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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<string[]>(initialAttachments);
  
  const { mutate: uploadFile, pending: uploadPending } = useMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSave = async (newAttachments: string[]) => {
    try {
      const cleaned = newAttachments.map(cleanUrl);
      await onSave(cleaned);
    } catch (error) {
      // Error is expected to be handled by the parent or the mutation hook
      console.error("Failed to save attachments:", error);
      // Revert attachments on error
      setAttachments(initialAttachments);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      toast.error(
        "Định dạng tập tin không được hỗ trợ. Chỉ chấp nhận các định dạng: xls, xlsx, png, rar, docx, jpeg, csv, jpg, pdf, doc, zip, txt",
      );
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    await uploadFile(
      {
        url: endpoints.UPLOAD_ATTACHMENTS,
        method: "post",
        body: formData,
        config: { headers: { "Content-Type": "multipart/form-data" } },
      },
      {
        onSuccess: (res: unknown) => {
          const typedRes = res as { url?: string } | undefined;
          if (!typedRes?.url) return;
          const newArr = [...attachments, typedRes.url];
          setAttachments(newArr);
          handleSave(newArr);
          toast.success("File uploaded successfully");
        },
        onError: (err) => {
          getApiErrorMessage(err);
        },
      },
    );

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="py-3 px-4 border-b border-border/40 bg-muted/5 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-primary">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          {title}
        </CardTitle>
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept={ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(",")}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="h-7 gap-1.5 border-primary/20 text-primary hover:bg-primary/10 px-2 text-xs"
          disabled={isPending || uploadPending}
        >
          {uploadPending ? (
            <Loader2 className="animate-spin w-3 h-3" />
          ) : null}
          Upload
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        {attachments.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {attachments.map((url, i) => {
              const full = formatUrl(url);
              return (
                <div
                  key={i}
                  className="group flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-md border border-border/50 text-xs"
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
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const newArr = attachments.filter((_, idx) => idx !== i);
                      setAttachments(newArr);
                      handleSave(newArr);
                    }}
                    className="text-destructive opacity-0 group-hover:opacity-100 transition-all hover:text-destructive/80 shrink-0 ml-1"
                    title="Remove attachment"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className="rounded-lg border border-dashed border-border/50 bg-muted/10 min-h-30 flex flex-col items-center justify-center gap-2 hover:bg-muted/20 transition-colors cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
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
