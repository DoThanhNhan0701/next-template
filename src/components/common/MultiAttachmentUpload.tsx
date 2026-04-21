"use client";

import React, { useRef, useState } from "react";

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
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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

interface Props {
  value?: string[];
  onChange: (value: string[]) => void;
}

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

export default function MultiAttachmentUpload({ value = [], onChange }: Props) {
  const { mutate: upload, pending: uploadPending } = useMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const formatUrl = (url: string) => {
    const cleaned = cleanUrl(url);
    if (!cleaned) return "";
    if (cleaned.startsWith("http")) return cleaned;
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const cleanBase = baseUrl.replace(/\/$/, "");
    const finalPath = cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
    return `${cleanBase}${finalPath}`;
  };

  const isImage = (url: string) => {
    const cleaned = cleanUrl(url);
    const ext = cleaned.split(".").pop()?.toLowerCase();
    return ["png", "jpg", "jpeg"].includes(ext || "");
  };

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

  const handlePreview = (
    e: React.MouseEvent<HTMLAnchorElement>,
    url: string,
  ) => {
    if (isImage(url)) {
      e.preventDefault();
      setPreviewUrl(formatUrl(url));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file extension
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

    await upload(
      {
        url: endpoints.UPLOAD_ATTACHMENTS,
        method: "post",
        body: formData,
        config: {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      },
      {
        onSuccess: (res: unknown) => {
          const typedRes = res as { url?: string } | undefined;
          if (!typedRes?.url) return;
          onChange([...value, typedRes.url]);
          toast.success("File uploaded successfully");
        },
        onError: (err) => {
          getApiErrorMessage(err);
        },
      },
    );
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-2 mt-2">
      <div className="flex flex-wrap gap-2">
        {value.map((url, index) => (
          <div
            key={index}
            className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-md border border-border/50 text-xs group"
          >
            {getFileIcon(url)}
            <a
              href={formatUrl(url)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => handlePreview(e, url)}
              className="truncate max-w-[200px] hover:underline hover:text-primary transition-colors cursor-pointer"
              title={
                isImage(url) ? "Click to preview image" : "Click to view file"
              }
            >
              {cleanUrl(url).split("/").pop()}
            </a>
            <button
              type="button"
              onClick={() => onChange(value.filter((_, i) => i !== index))}
              className="text-destructive opacity-0 group-hover:opacity-100 transition-all hover:text-destructive/80 shrink-0"
              title="Remove attachment"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="relative">
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept={ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(",")}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadPending}
          className="h-9"
        >
          {uploadPending ? (
            <Loader2 className="animate-spin mr-1" size={14} />
          ) : (
            <Paperclip size={14} className="mr-1" />
          )}
          Upload
        </Button>
      </div>
      <Dialog
        open={!!previewUrl}
        onOpenChange={(open) => !open && setPreviewUrl(null)}
      >
        <DialogContent className="max-w-4xl w-[90vw] h-[85vh] p-1 bg-transparent border-none shadow-none flex items-center justify-center">
          <DialogHeader className="hidden">
            <DialogTitle>Image Preview</DialogTitle>
            <DialogDescription>Image preview for attachment</DialogDescription>
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
    </div>
  );
}
