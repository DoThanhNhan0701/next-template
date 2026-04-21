"use client";

import { useEffect, useMemo, useState } from "react";

import { Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { dynamicEndpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";

interface IHolder {
  name: string;
  type: string;
  quantity: number;
  source_number: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  assetCode: string;
  assetId: number;
  owner?: string | null;
  importanceLevel?: { code: string; name: string; color: string } | null;
}

export default function PrintQRModal({
  isOpen,
  onClose,
  assetCode,
  assetId,
  owner,
  importanceLevel,
}: Props) {
  const [selectedName, setSelectedName] = useState("");

  const { response: holdersRes } = useGet<IHolder[]>(
    { url: dynamicEndpoints.PHYSICAL_ASSET_HOLDERS(assetId) },
    { disabled: !isOpen, deps: [assetId] },
  );
  const holders = useMemo(() => holdersRes ?? [], [holdersRes]);

  // Auto-select first holder when data loads
  useEffect(() => {
    if (holders.length > 0) {
      setSelectedName(holders[0].name);
    } else {
      setSelectedName("");
    }
  }, [holders]);

  const doPrint = () => {
    const svg =
      document.getElementById("print-qr-svg")?.querySelector("svg")
        ?.outerHTML ?? "";
    const win = window.open("", "_blank", "width=600,height=400");
    if (!win) return;
    win.document.write(`
      <html><head><title>QR - ${assetCode}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          margin: 0; 
          display: flex; 
          justify-content: center; 
          align-items: center; 
          min-height: 100vh; 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f5f5f5;
        }
        .container { 
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          padding: 24px;
          display: flex;
          gap: 24px;
          align-items: center;
          max-width: 520px;
        }
        .qr-section { 
          flex-shrink: 0;
        }
        .info-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .info-row {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e5e5e5;
        }
        .info-row:last-of-type {
          border-bottom: none;
          padding-bottom: 0;
        }
        .label {
          font-size: 9px;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }
        .value {
          font-size: 15px;
          color: #1a1a1a;
          font-weight: 700;
          letter-spacing: 0.02em;
        }
        .value-small {
          font-size: 13px;
          color: #333;
          font-weight: 600;
        }
        .importance-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 12px;
          border: 1px solid;
        }
        .footer {
          margin-top: 16px;
          padding-top: 12px;
          border-top: 1px solid #e5e5e5;
          text-align: center;
          font-size: 10px;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
      </style></head>
      <body>
        <div class="container">
          <div class="qr-section">
            ${svg}
          </div>
          <div class="info-section">
            <div class="info-row">
              <div class="label">CODE</div>
              <div class="value">${assetCode}</div>
            </div>
            <div class="info-row">
              <div class="label">OWNER</div>
              <div class="value-small">${owner || "—"}</div>
            </div>
            <div class="info-row">
              <div class="label">IMPORTANCE LEVEL</div>
              <div class="importance-badge" style="background-color: ${importanceLevel?.color || "#ccc"}20; color: ${importanceLevel?.color || "#666"}; border-color: ${importanceLevel?.color || "#ccc"}40;">
                ${importanceLevel?.name || "—"}
              </div>
            </div>
            <div class="footer">RAINSCALES VIETNAM JSC.</div>
          </div>
        </div>
      </body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>In QR Code</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Chọn tên người nhận để in kèm theo QR Code.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-3 py-2">
          {/* QR Preview */}
          <div
            id="print-qr-svg"
            className="flex gap-5 items-center p-5 bg-white rounded-xl border border-border/60 shadow-sm w-full"
          >
            {/* QR Code */}
            <div className="shrink-0">
              <QRCodeSVG value={assetCode} size={130} level="H" />
            </div>

            {/* Info */}
            <div className="flex flex-col gap-3 flex-1 min-w-0">
              <div className="flex flex-col gap-0.5 pb-3 border-b border-gray-100">
                <span className="text-[9px] font-semibold uppercase tracking-widest text-gray-400">
                  Code
                </span>
                <span className="font-mono text-sm font-bold text-gray-900 tracking-wider">
                  {assetCode}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 pb-3 border-b border-gray-100">
                <span className="text-[9px] font-semibold uppercase tracking-widest text-gray-400">
                  Owner
                </span>
                <span className="text-sm font-semibold text-gray-800">
                  {owner || "—"}
                </span>
              </div>
              <div className="flex flex-col gap-1 pb-3 border-b border-gray-100">
                <span className="text-[9px] font-semibold uppercase tracking-widest text-gray-400">
                  Importance Level
                </span>
                {importanceLevel ? (
                  <span
                    className="text-sm font-bold w-fit"
                    style={{ color: importanceLevel.color }}
                  >
                    {importanceLevel.name}
                  </span>
                ) : (
                  <span className="text-sm font-semibold text-gray-800">—</span>
                )}
              </div>
              <span className="text-[9px] font-semibold uppercase tracking-widest text-gray-400">
                RAINSCALES VIETNAM JSC.
              </span>
            </div>
          </div>

          {/* Chọn tên */}
          {holders.length > 0 && (
            <div className="w-full flex flex-col gap-1.5">
              <span className="text-sm font-medium">Tên người nhận</span>
              <div className="flex flex-wrap gap-1.5">
                {holders.map((h: IHolder, i: number) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() =>
                      setSelectedName(selectedName === h.name ? "" : h.name)
                    }
                    className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${
                      selectedName === h.name
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/40 text-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {h.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={doPrint} className="gap-2">
            <Printer className="w-4 h-4" />
            In ngay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
