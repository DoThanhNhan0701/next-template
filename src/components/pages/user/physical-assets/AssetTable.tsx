"use client";

import { useState } from "react";
import { endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { IPhysicalAsset } from "@/types/physical-asset";
import { EditIcon, PlusIcon, Laptop, Calendar, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import AssetFormModal from "./AssetFormModal";

export default function AssetTable() {
  const [skip, setSkip] = useState(0);
  const [limit] = useState(20);

  const queryParams = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });

  const { response, pending, reFetch } = useGet<IPhysicalAsset[]>({
    url: `${endpoints.PHYSICAL_ASSETS}?${queryParams.toString()}`,
  });
  const assets = response || [];

  const currentPage = Math.floor(skip / limit) + 1;
  const hasMore = assets.length === limit;

  const [isCreating, setIsCreating] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<IPhysicalAsset | null>(null);

  return (
    <div className="w-full h-full flex flex-col min-h-0 gap-2">
      <div className="flex items-center justify-between w-full">
        <h2 className="text-xl font-semibold">Physical Assets</h2>
        <Button onClick={() => setIsCreating(true)}>
          <PlusIcon size={16} className="mr-2" />
          Declare Asset
        </Button>
      </div>

      <div className="border border-(--surface-border-color) rounded-lg flex-1 min-h-0 w-full overflow-hidden [&_div[data-slot=table-container]]:h-full [&_div[data-slot=table-container]]:overflow-auto">
        <Table className="whitespace-nowrap">
          <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color) sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead className="font-semibold h-10 px-4">Asset</TableHead>
              <TableHead className="font-semibold h-10 px-4">Ownership</TableHead>
              <TableHead className="font-semibold h-10 px-4">Location</TableHead>
              <TableHead className="font-semibold h-10 px-4">Purchase Info</TableHead>
              <TableHead className="font-semibold h-10 px-4 text-center">Status</TableHead>
              <TableHead className="font-semibold h-10 px-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-(--surface-border-color)">
            {pending ? (
              <TableRow>
                <TableCell colSpan={6} className="px-4 py-3 text-center">Loading...</TableCell>
              </TableRow>
            ) : assets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="px-4 py-3 text-center">No assets declared yet</TableCell>
              </TableRow>
            ) : (
              assets.map((asset) => (
                <TableRow key={asset.id} className="hover:bg-primary/5 transition-colors">
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg text-primary">
                        <Laptop size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">{asset.name}</span>
                        <span className="text-xs text-muted-foreground font-mono">{asset.asset_code}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex flex-col gap-1 text-sm">
                      <div className="flex items-center gap-1.5">
                        <User size={12} className="text-muted-foreground" />
                        <span>{asset.holder_name || "Unassigned"}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{asset.owner || "No owner info"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex flex-col gap-1 text-sm">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-muted-foreground" />
                        <span>{asset.location || "Floating"}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex flex-col gap-1 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-muted-foreground" />
                        <span>{asset.purchase_date?.split("T")[0] || "N/A"}</span>
                      </div>
                      <span className="font-semibold text-xs">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(asset.cost)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    <span className="px-2 py-1 rounded-md text-xs font-medium border border-border">
                      Status ID: {asset.status_id}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setAssetToEdit(asset)}
                    >
                      <EditIcon size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {assets.length > 0 || skip > 0 ? (
        <Pagination className="flex w-full justify-end mt-1">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => { e.preventDefault(); if (skip > 0 && !pending) setSkip(Math.max(0, skip - limit)); }}
                className={skip === 0 || pending ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>{currentPage}</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => { e.preventDefault(); if (hasMore && !pending) setSkip(skip + limit); }}
                className={!hasMore || pending ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}

      <AssetFormModal
        isOpen={isCreating || assetToEdit !== null}
        onClose={() => { setIsCreating(false); setAssetToEdit(null); }}
        assetToEdit={assetToEdit}
        onSuccess={() => reFetch()}
      />
    </div>
  );
}
