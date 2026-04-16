"use client";

import { useGet } from "@/hooks/useGet";
import { dynamicEndpoints } from "@/config/endpoints";
import { IAuditSession, IAuditDetailsResponse } from "@/types/audit";
import { useRouter } from "next/navigation";
import {
    ChevronLeft, 
    ClipboardList, 
    Calendar, 
    User, 
    MapPin, 
    Building2, 
    Clock, 
    Package,
    CheckCircle2,
    Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface Props { id: string; }

export default function AuditDetail({ id }: Props) {
    const router = useRouter();

    const { response: session, pending: sessionPending } = useGet<IAuditSession>({
        url: dynamicEndpoints.AUDIT_SESSION_DETAIL(Number(id)),
    });

    const { response: items, pending: itemsPending } = useGet<IAuditDetailsResponse>({
        url: dynamicEndpoints.AUDIT_SESSION_DETAILS(Number(id)),
    });

    if (sessionPending && !session) {
        return (
            <div className="p-6 flex flex-col gap-4">
                <Skeleton className="h-9 w-28" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!session) return null;

    const isCompleted = ["APPROVED", "COMPLETED"].includes(session.status_obj?.code);

    return (
        <div className="flex flex-col px-4 pb-6 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Back & Header */}
            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded shadow-sm shrink-0 border-border/50 w-8 h-8"
                    onClick={() => router.back()}
                >
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex flex-col gap-0.5">
                    <h1 className="text-lg font-semibold text-foreground">Audit Session Detail</h1>
                    <span className="text-xs text-muted-foreground">Inventory & Verification</span>
                </div>
            </div>

            {/* Summary Card */}
            <Card className="border border-border/50 shadow-sm bg-card/60 backdrop-blur-md overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/80 rounded-r" />
                <CardContent className="p-5 pl-7">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        {/* Left: record info */}
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                <ClipboardList className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Audit Session</span>
                                <span className="text-xl font-bold text-foreground tracking-tight">{session.title}</span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                    <Clock size={12} className="opacity-70" />
                                    Created {new Date(session.created_at).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                                </span>
                            </div>
                        </div>

                        {/* Right: stats & status */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex flex-col items-center px-5 py-2.5 rounded-xl bg-primary/5 border border-primary/10 min-w-[80px]">
                                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Items</span>
                                <span className="text-2xl font-bold text-primary">{items?.length || 0}</span>
                            </div>
                            <Badge
                                variant="outline"
                                className="px-4 py-2 text-sm font-bold rounded-xl h-auto"
                                style={{
                                    backgroundColor: `${session.status_obj?.color}18`,
                                    color: session.status_obj?.color,
                                    borderColor: `${session.status_obj?.color}40`,
                                }}
                            >
                                {session.status_obj?.name}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
                {/* Items table */}
                <div className="lg:col-span-2">
                    <Card className="shadow-sm border-border/50 bg-card/60 backdrop-blur-md h-full flex flex-col min-h-[400px]">
                        <CardHeader className="flex flex-row items-center gap-2 border-b border-border/50 py-3 px-4 shrink-0">
                            <Package className="w-4 h-4 text-primary" />
                            <CardTitle className="text-sm font-semibold text-primary">Audited Assets</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-auto">
                            <Table className="whitespace-nowrap">
                                <TableHeader className="bg-sidebar-accent border-b border-border/50">
                                    <TableRow>
                                        <TableHead className="px-4 h-10 text-xs font-semibold">Asset</TableHead>
                                        <TableHead className="px-4 h-10 text-xs font-semibold">Status</TableHead>
                                        <TableHead className="px-4 h-10 text-xs font-semibold">Verified At</TableHead>
                                        <TableHead className="px-4 h-10 text-xs font-semibold">Notes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {itemsPending ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell colSpan={4} className="p-4">
                                                    <Skeleton className="h-10 w-full" />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : !items || items.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-40 text-center text-muted-foreground italic">
                                                No items found in this audit session.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        items.map((item) => (
                                            <TableRow key={item.id} className="border-border/50 hover:bg-muted/30">
                                                <TableCell className="px-4 py-3">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-sm font-semibold text-foreground">{item.asset.name}</span>
                                                        <code className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded w-fit text-muted-foreground uppercase">
                                                            {item.asset.asset_code}
                                                        </code>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-4 py-3">
                                                    <Badge
                                                        variant="outline"
                                                        className="px-2 py-0.5 text-[10px] font-bold rounded-full"
                                                        style={{
                                                            backgroundColor: `${item.status_obj?.color}15`,
                                                            color: item.status_obj?.color,
                                                            borderColor: `${item.status_obj?.color}30`,
                                                        }}
                                                    >
                                                        {item.status_obj?.name}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-4 py-3">
                                                    <div className="flex flex-col text-[11px] text-muted-foreground">
                                                        <span>{new Date(item.verified_at).toLocaleDateString("vi-VN")}</span>
                                                        <span>{new Date(item.verified_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-4 py-3 max-w-[200px] truncate">
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Info size={12} className="shrink-0 opacity-40" />
                                                        <span className="italic">{item.notes || "No notes"}</span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="flex flex-col gap-4">
                    <Card className="shadow-sm border-border/50 bg-card/60 backdrop-blur-md">
                        <CardHeader className="flex flex-row items-center gap-2 border-b border-border/50 py-3 px-4">
                            <Info className="w-4 h-4 text-primary" />
                            <CardTitle className="text-sm font-semibold text-primary">Audit Information</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <User size={15} className="shrink-0" />
                                    <span className="text-xs font-semibold uppercase tracking-wider">Assignee</span>
                                </div>
                                <span className="text-sm font-semibold text-foreground">{session.assignee?.full_name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar size={15} className="shrink-0" />
                                    <span className="text-xs font-semibold uppercase tracking-wider">Due Date</span>
                                </div>
                                <span className="text-sm font-bold text-red-500/80">
                                    {new Date(session.due_date).toLocaleDateString("vi-VN")}
                                </span>
                            </div>
                            <div className="pt-2 border-t border-border/50">
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                        {session.audit_type === "unit" ? <Building2 size={15} /> : <MapPin size={15} />}
                                        <span className="text-xs font-semibold uppercase tracking-wider">Audit Target</span>
                                    </div>
                                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                                        <span className="text-xs text-muted-foreground block mb-0.5">
                                            {session.audit_type === "unit" ? "Organization Unit" : "Location"}
                                        </span>
                                        <span className="text-sm font-bold text-foreground">
                                            {session.audit_type === "unit" ? session.unit_obj?.name : session.location_obj?.name}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                        <div className="flex items-start gap-3">
                            {isCompleted ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                            ) : (
                                <Clock className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                            )}
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-bold uppercase tracking-tight">Status Note</span>
                                <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                                    {isCompleted 
                                        ? "This audit session has been finalized and approved. No further changes can be made." 
                                        : "This audit session is currently active. Verification progress is being tracked."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
