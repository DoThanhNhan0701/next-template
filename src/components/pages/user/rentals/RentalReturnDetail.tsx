"use client";

import { useGet } from "@/hooks/useGet";
import { RentalReturnDocument } from "@/types/task";
import { ApprovalHistory } from "@/types/task";
import { dynamicEndpoints } from "@/config/endpoints";
import { useRouter } from "next/navigation";
import {
    ChevronLeft, Package, MapPin, Clock, FileText,
    Building2, Phone, Mail, Calendar, FileCheck, Link2,
    History, CheckCircle2, XCircle, User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface Props { id: string; }

export default function RentalReturnDetail({ id }: Props) {
    const router = useRouter();

    const { response: detail, pending } = useGet<RentalReturnDocument>({
        url: `/api/v1/rentals/returns/${id}`,
    });

    const { response: historyList, pending: historyPending } = useGet<ApprovalHistory[]>({
        url: dynamicEndpoints.WORKFLOW_HISTORY("rental_return", Number(id)),
    });

    if (pending && !detail) {
        return (
            <div className="p-6 flex flex-col gap-4">
                <Skeleton className="h-9 w-28" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!detail) return null;

    const totalAssets = detail.details.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="flex flex-col px-4 pb-6 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Back */}
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
                    <h1 className="text-lg font-semibold text-foreground">Rental Return Detail</h1>
                    <span className="text-xs text-muted-foreground">Return Management</span>
                </div>
            </div>

            {/* Summary */}
            <Card className="border border-border/50 shadow-sm bg-card/60 backdrop-blur-md overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/80 rounded-r" />
                <CardContent className="p-5 pl-7">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        {/* Left: record info */}
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                <FileText className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Record Number</span>
                                <span className="text-xl font-bold text-foreground tracking-tight">{detail.record_number}</span>
                                <span className="text-xs text-muted-foreground">
                                    Rental: {detail.rental.record_number}
                                </span>
                            </div>
                        </div>

                        {/* Right: stats */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex flex-col items-center px-5 py-2.5 rounded-xl bg-primary/5 border border-primary/10 min-w-20">
                                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Assets</span>
                                <span className="text-2xl font-bold text-primary">{totalAssets}</span>
                            </div>
                            <div className="flex flex-col items-center px-5 py-2.5 rounded-xl bg-muted/40 border border-border/50 min-w-20">
                                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Items</span>
                                <span className="text-2xl font-bold text-foreground">{detail.details.length}</span>
                            </div>
                            <Badge
                                variant="outline"
                                className="px-4 py-2 text-sm font-bold rounded-xl h-auto"
                                style={{
                                    backgroundColor: `${detail.status_obj?.color}18`,
                                    color: detail.status_obj?.color,
                                    borderColor: `${detail.status_obj?.color}40`,
                                }}
                            >
                                {detail.status_obj?.name}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
                {/* Items table */}
                <div className="lg:col-span-2">
                    <Card className="shadow-sm border-border/50 bg-card/60 backdrop-blur-md h-full flex flex-col">
                        <CardHeader className="flex flex-row items-center gap-2 border-b border-border/50 py-3 px-4 shrink-0">
                            <Package className="w-4 h-4 text-primary" />
                            <CardTitle className="text-sm font-semibold text-primary">Return Items</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-auto">
                            <Table className="whitespace-nowrap">
                                <TableHeader className="bg-sidebar-accent border-b border-border/50">
                                    <TableRow>
                                        <TableHead className="font-semibold h-10 px-4 w-[5%] text-center">
                                            No
                                        </TableHead>
                                        <TableHead className="px-4 h-10 text-xs font-semibold">Asset</TableHead>
                                        <TableHead className="px-4 h-10 text-xs font-semibold text-center">Qty</TableHead>
                                        <TableHead className="px-4 h-10 text-xs font-semibold">Condition</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {detail.details.map((item, index) => (
                                        <TableRow key={item.id} className="border-border/50 hover:bg-muted/30">
                                            {/* No */}
                                            <TableCell className="px-4 py-3 text-center text-muted-foreground">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-sm font-semibold text-foreground">{item.asset.name}</span>
                                                    <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded w-fit text-muted-foreground">
                                                        {item.asset.asset_code}
                                                    </code>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-center">
                                                <span className="inline-flex items-center justify-center w-8 h-6 bg-primary/10 text-primary rounded-lg text-sm font-bold">
                                                    {item.quantity}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <span className="text-sm text-foreground/80 italic">
                                                    {item.condition || "—"}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="flex flex-col gap-4">
                    {/* Customer Info */}
                    <Card className="shadow-sm border-border/50 bg-card/60 backdrop-blur-md">
                        <CardHeader className="flex flex-row items-center gap-2 border-b border-border/50 py-3 px-4">
                            <Building2 className="w-4 h-4 text-primary" />
                            <CardTitle className="text-sm font-semibold text-primary">Customer Information</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 flex flex-col gap-3">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</span>
                                <span className="text-sm font-semibold text-foreground">{detail.rental.customer.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone size={14} className="shrink-0" />
                                <span>{detail.rental.customer.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail size={14} className="shrink-0" />
                                <span className="truncate">{detail.rental.customer.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin size={14} className="shrink-0" />
                                <span>{detail.rental.customer.address || "—"}</span>
                            </div>
                            <div className="flex flex-col gap-1 pt-2 border-t border-border/50">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Identifier</span>
                                <code className="text-xs font-mono bg-muted px-2 py-1 rounded text-foreground">
                                    {detail.rental.customer.identifier}
                                </code>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Return Info */}
                    <Card className="shadow-sm border-border/50 bg-card/60 backdrop-blur-md">
                        <CardHeader className="flex flex-row items-center gap-2 border-b border-border/50 py-3 px-4">
                            <FileCheck className="w-4 h-4 text-primary" />
                            <CardTitle className="text-sm font-semibold text-primary">Return Information</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar size={15} />
                                    <span className="text-xs font-semibold uppercase tracking-wider">Lease Date</span>
                                </div>
                                <span className="text-sm font-semibold text-foreground">
                                    {new Date(detail.rental.lease_date).toLocaleDateString("vi-VN")}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar size={15} />
                                    <span className="text-xs font-semibold uppercase tracking-wider">Return Date</span>
                                </div>
                                <span className="text-sm font-semibold text-foreground">
                                    {new Date(detail.return_date).toLocaleDateString("vi-VN")}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <MapPin size={15} />
                                    <span className="text-xs font-semibold uppercase tracking-wider">To Location</span>
                                </div>
                                <span className="text-sm font-semibold text-foreground">{detail.to_location.name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <FileText size={15} />
                                    <span className="text-xs font-semibold uppercase tracking-wider">Contract</span>
                                </div>
                                <span className="text-sm font-semibold text-foreground">{detail.rental.contract_number}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <FileText size={15} />
                                    <span className="text-xs font-semibold uppercase tracking-wider">Rental Record</span>
                                </div>
                                <span className="text-sm font-semibold text-foreground">{detail.rental.record_number}</span>
                            </div>
                            {detail.creator && (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <User size={15} />
                                        <span className="text-xs font-semibold uppercase tracking-wider">Creator</span>
                                    </div>
                                    <span className="text-sm font-semibold text-foreground">{detail.creator.full_name}</span>
                                </div>
                            )}
                            {detail.created_at && (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Clock size={15} />
                                        <span className="text-xs font-semibold uppercase tracking-wider">Created</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm font-semibold text-foreground">
                                            {new Date(detail.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(detail.created_at).toLocaleDateString("vi-VN")}
                                        </span>
                                    </div>
                                </div>
                            )}
                            {detail.notes && (
                                <div className="flex flex-col gap-1.5 pt-2 border-t border-border/50">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes</span>
                                    <p className="text-sm text-foreground/80 leading-relaxed italic">{detail.notes}</p>
                                </div>
                            )}
                            {detail.attachments && detail.attachments.length > 0 && (
                                <div className="flex flex-col gap-1.5 pt-2 border-t border-border/50">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Attachments</span>
                                    <div className="flex flex-col gap-1">
                                        {detail.attachments.map((attachment, index) => {
                                            const fileName = typeof attachment === 'string'
                                                ? attachment.split('/').pop()
                                                : attachment.file_name;
                                            const fileUrl = typeof attachment === 'string'
                                                ? attachment
                                                : attachment.file_path;
                                            return (
                                                <a
                                                    key={index}
                                                    href={fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-primary hover:underline underline-offset-2 truncate flex items-center gap-1.5"
                                                >
                                                    <Link2 size={12} />
                                                    {fileName}
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="p-3 rounded-xl bg-muted/30 border border-border/50 text-center">
                        <p className="text-xs text-muted-foreground italic leading-relaxed">
                            Return document has been processed.
                        </p>
                    </div>
                </div>
            </div>

            {/* Workflow History */}
            <Card className="shadow-sm border-border/50 bg-card/60 backdrop-blur-md">
                <CardHeader className="flex flex-row items-center gap-2 border-b border-border/50 py-3 px-4">
                    <History className="w-4 h-4 text-amber-500" />
                    <CardTitle className="text-sm font-semibold text-primary">Approval History</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {historyPending ? (
                        <div className="flex flex-col gap-2 p-4">
                            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                        </div>
                    ) : !historyList || historyList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                            <Clock className="w-8 h-8 opacity-30" />
                            <p className="text-sm italic">Chưa có lịch sử phê duyệt.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-sidebar-accent border-b border-border/50">
                                <TableRow>
                                    <TableHead className="px-4 h-10 text-xs font-semibold">Step</TableHead>
                                    <TableHead className="px-4 h-10 text-xs font-semibold">Approver</TableHead>
                                    <TableHead className="px-4 h-10 text-xs font-semibold text-center">Status</TableHead>
                                    <TableHead className="px-4 h-10 text-xs font-semibold">Comment</TableHead>
                                    <TableHead className="px-4 h-10 text-xs font-semibold">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {historyList.map((hist) => (
                                    <TableRow key={hist.id} className="border-border/50 hover:bg-muted/30">
                                        <TableCell className="px-4 py-3 text-sm font-semibold">{hist.step_name}</TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold uppercase">
                                                    {hist.requester_name?.charAt(0)}
                                                </div>
                                                <span className="text-sm">{hist.requester_name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-center">
                                            {hist.status === "APPROVED" ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600">
                                                    <CheckCircle2 size={12} /> Approved
                                                </span>
                                            ) : hist.status === "REJECTED" ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-500">
                                                    <XCircle size={12} /> Rejected
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600">
                                                    <Clock size={12} /> Pending
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-sm text-muted-foreground italic">{hist.comment || "—"}</TableCell>
                                        <TableCell className="px-4 py-3 text-xs text-muted-foreground">
                                            {new Date(hist.action_date).toLocaleString("vi-VN")}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
