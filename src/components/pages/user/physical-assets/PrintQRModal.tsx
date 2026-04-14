"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { useGet } from "@/hooks/useGet";
import { dynamicEndpoints } from "@/config/endpoints";

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
    assetName: string;
    assetId: number;
}

export default function PrintQRModal({ isOpen, onClose, assetCode, assetName, assetId }: Props) {
    const [selectedName, setSelectedName] = useState("");

    const { response: holdersRes } = useGet<IHolder[]>(
        { url: dynamicEndpoints.PHYSICAL_ASSET_HOLDERS(assetId) },
        { disabled: !isOpen, deps: [assetId] },
    );
    const holders = holdersRes ?? [];

    // Auto-select first holder when data loads
    useEffect(() => {
        if (holders.length > 0) {
            setSelectedName(holders[0].name);
        } else {
            setSelectedName("");
        }
    }, [holders]);

    const doPrint = () => {
        const svg = document.getElementById("print-qr-svg")?.querySelector("svg")?.outerHTML ?? "";
        const win = window.open("", "_blank", "width=400,height=480");
        if (!win) return;
        win.document.write(`
      <html><head><title>QR - ${assetCode}</title>
      <style>
        body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: monospace; }
        .wrap { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 24px; }
        .code { font-size: 14px; font-weight: bold; letter-spacing: 0.15em; }
        .name { font-size: 11px; color: #666; }
        .person { font-size: 13px; font-weight: bold; color: #333; margin-top: 4px; }
      </style></head>
      <body><div class="wrap">
        ${svg}
        <div class="code">${assetCode}</div>
        <div class="name">${assetName}</div>
        ${selectedName ? `<div class="person">👤 ${selectedName}</div>` : ""}
      </div></body></html>
    `);
        win.document.close();
        win.focus();
        win.print();
        win.close();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>In QR Code</DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Chọn tên người nhận để in kèm theo QR Code.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center gap-4 py-2">
                    {/* QR Preview */}
                    <div id="print-qr-svg" className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-border/50 shadow-sm">
                        <QRCodeSVG value={assetCode} size={140} level="H" includeMargin={false} />
                        <span className="font-mono text-xs font-bold tracking-widest text-black">{assetCode}</span>
                        {selectedName && (
                            <span className="text-xs text-gray-600 font-medium">👤 {selectedName}</span>
                        )}
                    </div>

                    {/* Chọn tên */}
                    {holders.length > 0 && (
                        <div className="w-full flex flex-col gap-1.5">
                            <span className="text-sm font-medium">Tên người nhận</span>
                            <div className="flex flex-wrap gap-1.5">
                                {holders.map((h, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => setSelectedName(selectedName === h.name ? "" : h.name)}
                                        className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${selectedName === h.name
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
                    <Button variant="outline" onClick={onClose}>Hủy</Button>
                    <Button onClick={doPrint} className="gap-2">
                        <Printer className="w-4 h-4" />
                        In ngay
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
