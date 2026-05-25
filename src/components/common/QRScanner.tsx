"use client";

import { useEffect, useRef, useState } from "react";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { Html5Qrcode } from "html5-qrcode";
import { Loader2, QrCode, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { dynamicEndpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";

interface ScanResult {
  asset_code: string;
  asset_id: number;
  asset_name: string;
  detail_url: string;
}

interface QRScannerProps {
  /** Optional trigger element. If not provided, a default button is rendered. */
  children?: React.ReactNode;
}

const SCANNER_ID = "qr-scanner-container";

export default function QRScanner({ children }: QRScannerProps) {
  const router = useRouter();
  const t = useTranslations("qr_scanner");
  const [isOpen, setIsOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const hasScannedRef = useRef(false);

  const scanUrl = scannedCode ? dynamicEndpoints.SCAN_INFO(scannedCode) : "";

  const {
    response: scanResult,
    pending: loading,
    error: scanError,
  } = useGet<ScanResult>(
    { url: scanUrl },
    { disabled: !scannedCode, staleTime: 0 },
  );

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        // State 2 = SCANNING
        if (state === 2) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch {
        // ignore cleanup errors
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleClose = async () => {
    await stopScanner();
    hasScannedRef.current = false;
    setError(null);
    setScannedCode(null);
    setIsOpen(false);
  };

  const handleScanSuccess = async (assetCode: string) => {
    if (hasScannedRef.current) return;
    hasScannedRef.current = true;

    await stopScanner();
    setError(null);
    setScannedCode(assetCode);
  };

  // Navigate when result arrives
  useEffect(() => {
    if (!scanResult) return;
    toast.success(t("success_found", { name: scanResult.asset_name }));
    handleClose();
    router.push(`/assets/${scanResult.asset_id}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanResult]);

  // Show error and restart scanner
  useEffect(() => {
    if (!scanError) return;
    setError(t("err_not_found", { code: scannedCode ?? "" }));
    hasScannedRef.current = false;
    setScannedCode(null);
    startScanner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanError]);

  const startScanner = () => {
    // Wait for DOM element to be ready
    setTimeout(() => {
      const element = document.getElementById(SCANNER_ID);
      if (!element) return;

      const scanner = new Html5Qrcode(SCANNER_ID);
      scannerRef.current = scanner;

      scanner
        .start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            // QR code may contain a URL or just the asset_code
            // Extract asset_code from URL if needed
            let assetCode = decodedText.trim();
            try {
              const url = new URL(decodedText);
              // e.g. http://localhost:5173/assets/10 — not useful
              // Try to extract from path like /scan/CAM00000002 or just use last segment
              const parts = url.pathname.split("/").filter(Boolean);
              if (parts.length > 0) {
                assetCode = parts[parts.length - 1];
              }
            } catch {
              // Not a URL, use as-is (plain asset_code)
            }
            handleScanSuccess(assetCode);
          },
          () => {
            // scan failure — ignore, keep scanning
          },
        )
        .then(() => setScanning(true))
        .catch((err) => {
          setError(
            err?.message?.includes("Permission")
              ? t("err_permission")
              : t("err_start"),
          );
        });
    }, 300);
  };

  useEffect(() => {
    if (isOpen) {
      hasScannedRef.current = false;
      setError(null);
      setScannedCode(null);
      startScanner();
    }

    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <>
      {/* Trigger */}
      <div onClick={() => setIsOpen(true)} className="cursor-pointer">
        {children ?? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title={t("tooltip")}
          >
            <QrCode size={18} />
          </Button>
        )}
      </div>

      {/* Scanner Dialog */}
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent
          className="sm:max-w-sm p-0 overflow-hidden"
          aria-describedby={undefined}
        >
          <DialogHeader className="px-4 pt-4 pb-2">
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
              <QrCode size={16} className="text-primary" />
              {t("title")}
            </DialogTitle>
          </DialogHeader>

          <div className="relative">
            {/* Scanner viewport */}
            <div
              id={SCANNER_ID}
              className="w-full"
              style={{ minHeight: 300 }}
            />

            {/* Overlay: loading */}
            {loading && scannedCode && (
              <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-3 z-10">
                <Loader2 size={32} className="animate-spin text-primary" />
                <p className="text-sm font-medium">{t("loading")}</p>
              </div>
            )}

            {/* Overlay: not yet scanning */}
            {!scanning && !(loading && scannedCode) && !error && (
              <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-3 z-10">
                <Loader2
                  size={28}
                  className="animate-spin text-muted-foreground"
                />
                <p className="text-sm text-muted-foreground">{t("starting")}</p>
              </div>
            )}

            {/* Scanning guide frame */}
            {scanning && !(loading && scannedCode) && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                <div className="w-52 h-52 border-2 border-primary/70 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]" />
              </div>
            )}
          </div>

          {/* Error / hint */}
          <div className="px-4 pb-4 pt-2 space-y-2">
            {error && (
              <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                <X size={14} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {!error && scanning && (
              <p className="text-xs text-center text-muted-foreground">
                {t("guide")}
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleClose}
            >
              {t("close")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
