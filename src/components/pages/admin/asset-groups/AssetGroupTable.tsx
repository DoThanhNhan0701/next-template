"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";

import { EditIcon, Layers, Trash2Icon } from "lucide-react";

import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import {
  TableEmptyRow,
  TableLoadingRows,
} from "@/components/common/TableStateDisplay";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dynamicEndpoints, endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { IAssetGroup } from "@/types/asset-group";

import AssetGroupFormModal from "./AssetGroupFormModal";

export default function AssetGroupTable() {
  const t = useTranslations("page_asset_groups");
  const tt = useTranslations("page_asset_groups.table");
  const td = useTranslations("page_asset_groups.delete");
  const [skip, setSkip] = useState(0);
  const [limit] = useState(20);
  const [isActive, setIsActive] = useState<string>("all");

  const queryParams = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });
  if (isActive !== "all") {
    queryParams.append("is_active", isActive);
  }

  const { response, pending, reFetch, setResponse } = useGet<IAssetGroup[]>({
    url: `${endpoints.ASSET_GROUPS}?${queryParams.toString()}`,
  });
  const assetGroups = response || [];

  const currentPage = Math.floor(skip / limit) + 1;
  const hasMore = assetGroups.length === limit;

  const [isCreating, setIsCreating] = useState(false);
  const [assetGroupToEdit, setAssetGroupToEdit] = useState<IAssetGroup | null>(
    null,
  );
  const [assetGroupToDelete, setAssetGroupToDelete] =
    useState<IAssetGroup | null>(null);

  const handleSuccess = (responseData?: unknown, method?: string) => {
    if (responseData && method === "patch") {
      const resp = responseData as { data?: IAssetGroup } | IAssetGroup;
      const updatedItem = ("data" in resp ? resp.data : resp) as
        | IAssetGroup
        | undefined;
      if (updatedItem?.id) {
        setResponse((prev: IAssetGroup[] | null) =>
          prev
            ? prev.map((u: IAssetGroup) =>
                u.id === updatedItem?.id ? { ...u, ...updatedItem } : u,
              )
            : null,
        );
        return;
      }
    } else if (responseData && method === "post") {
      const resp = responseData as { data?: IAssetGroup } | IAssetGroup;
      const newItem = ("data" in resp ? resp.data : resp) as
        | IAssetGroup
        | undefined;
      if (newItem?.id) {
        setResponse((prev: IAssetGroup[] | null) =>
          prev ? [newItem, ...prev] : [newItem],
        );
        return;
      }
    }
    reFetch();
  };

  return (
    <div className="w-full h-full flex flex-col min-h-0 gap-2">
      <div className="flex items-center justify-between w-full">
        <Select
          value={isActive}
          onValueChange={(val) => {
            setIsActive(val);
            setSkip(0);
          }}
        >
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder={t("all_statuses")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("all_statuses")}</SelectItem>
            <SelectItem value="true">{t("active")}</SelectItem>
            <SelectItem value="false">{t("inactive")}</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setIsCreating(true)}>{t("add_group")}</Button>
      </div>

      <div className="border border-(--surface-border-color) flex-1 min-h-0 w-full overflow-hidden [&_div[data-slot=table-container]]:h-full [&_div[data-slot=table-container]]:overflow-auto">
        <Table className="whitespace-nowrap">
          <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color) sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead className="font-semibold h-10 px-4 w-[5%] text-center">
                {tt("no")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[20%]">
                {tt("code")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[30%]">
                {tt("name")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[10%] text-center">
                {tt("color")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[25%]">
                {tt("description")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-center w-[10%]">
                {tt("status")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-right w-[15%]">
                {tt("actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-(--surface-border-color)">
            {pending ? (
              <TableLoadingRows colSpan={7} rows={6} />
            ) : assetGroups.length === 0 ? (
              <TableEmptyRow
                colSpan={7}
                icon={Layers}
                message={tt("no_groups_found")}
                description={tt("add_first_group")}
              />
            ) : (
              assetGroups.map((group, index) => (
                <TableRow
                  key={group.id}
                  className="hover:bg-primary/5 transition-colors"
                >
                  <TableCell className="px-4 py-3 text-center text-muted-foreground">
                    {skip + index + 1}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-medium text-foreground">
                    {group.code}
                  </TableCell>
                  <TableCell className="px-4 py-3">{group.name}</TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    <div
                      className="w-6 h-6 rounded-full mx-auto border border-(--surface-border-color)"
                      style={{ backgroundColor: group.color }}
                    />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {group.description}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    {group.is_active ? (
                      <span className="text-green-600 bg-green-500/10 px-2 py-1 rounded-md text-sm font-medium">
                        {t("active")}
                      </span>
                    ) : (
                      <span className="text-red-600 bg-red-500/10 px-2 py-1 rounded-md text-sm font-medium">
                        {t("inactive")}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => setAssetGroupToEdit(group)}
                      >
                        <EditIcon size={14} />
                      </Button>
                      {group.is_active && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:bg-red-500/10"
                          onClick={() => setAssetGroupToDelete(group)}
                        >
                          <Trash2Icon size={14} />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {assetGroups.length > 0 || skip > 0 ? (
        <Pagination className="flex w-full justify-end mt-1">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (skip > 0 && !pending) setSkip(Math.max(0, skip - limit));
                }}
                className={
                  skip === 0 || pending ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>

            {currentPage > 1 && (
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setSkip(0);
                  }}
                >
                  1
                </PaginationLink>
              </PaginationItem>
            )}

            {currentPage > 3 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {currentPage > 2 && (
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setSkip((currentPage - 2) * limit);
                  }}
                >
                  {currentPage - 1}
                </PaginationLink>
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationLink href="#" isActive>
                {currentPage}
              </PaginationLink>
            </PaginationItem>

            {hasMore && (
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setSkip(currentPage * limit);
                  }}
                >
                  {currentPage + 1}
                </PaginationLink>
              </PaginationItem>
            )}

            {hasMore && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (hasMore && !pending) setSkip(skip + limit);
                }}
                className={
                  !hasMore || pending ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}

      <AssetGroupFormModal
        isOpen={isCreating || assetGroupToEdit !== null}
        onClose={() => {
          setIsCreating(false);
          setAssetGroupToEdit(null);
        }}
        assetGroupToEdit={assetGroupToEdit}
        onSuccess={handleSuccess}
      />
      <ConfirmDeleteModal
        isOpen={assetGroupToDelete !== null}
        onClose={() => setAssetGroupToDelete(null)}
        onSuccess={handleSuccess}
        title={td("title")}
        description={td.rich("confirm_message", {
          name: assetGroupToDelete?.name || "this item",
          important: (chunks) => (
            <span className="font-semibold">{chunks}</span>
          ),
        })}
        url={
          assetGroupToDelete
            ? dynamicEndpoints.ASSET_GROUP_DETAIL(assetGroupToDelete.id)
            : ""
        }
        method="patch"
        body={{ is_active: false }}
        translationGroup="page_asset_groups.delete"
      />
    </div>
  );
}
