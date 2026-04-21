"use client";

import { useState } from "react";

import { EditIcon, MapPin, PlusIcon, Trash2Icon } from "lucide-react";

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
import { endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { ILocation } from "@/types/location";

import ConfirmDeleteModal from "./ConfirmDeleteModal";
import LocationFormModal from "./LocationFormModal";

export default function LocationTable() {
  const [skip, setSkip] = useState(0);
  const [limit] = useState(20);
  const [isActiveFilter, setIsActiveFilter] = useState("all");

  const queryParams = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });

  if (isActiveFilter !== "all") {
    queryParams.append("is_active", isActiveFilter);
  }

  const { response, pending, reFetch, setResponse } = useGet<ILocation[]>({
    url: `${endpoints.LOCATIONS}?${queryParams.toString()}`,
  });

  const locations = response || [];
  const currentPage = Math.floor(skip / limit) + 1;
  const hasMore = locations.length === limit;

  const [isCreating, setIsCreating] = useState(false);
  const [locationToEdit, setLocationToEdit] = useState<ILocation | null>(null);
  const [locationToDelete, setLocationToDelete] = useState<ILocation | null>(
    null,
  );

  const handleSuccess = (responseData?: unknown, method?: string) => {
    if (responseData && method === "patch") {
      const resp = responseData as { data?: ILocation } | ILocation;
      const updatedItem = ("data" in resp ? resp.data : resp) as
        | ILocation
        | undefined;
      if (updatedItem?.id) {
        setResponse((prev: ILocation[] | null) =>
          prev
            ? prev.map((loc: ILocation) =>
                loc.id === updatedItem?.id ? { ...loc, ...updatedItem } : loc,
              )
            : null,
        );
        return;
      }
    } else if (responseData && method === "post") {
      const resp = responseData as { data?: ILocation } | ILocation;
      const newItem = ("data" in resp ? resp.data : resp) as
        | ILocation
        | undefined;
      if (newItem?.id) {
        setResponse((prev: ILocation[] | null) =>
          prev ? [newItem, ...prev] : [newItem],
        );
        return;
      }
    } else if (responseData && method === "delete") {
      const resp = responseData as { data?: ILocation } | ILocation;
      const deletedItem = ("data" in resp ? resp.data : resp) as
        | ILocation
        | undefined;
      if (deletedItem?.id) {
        setResponse((prev: ILocation[] | null) =>
          prev
            ? prev.filter((loc: ILocation) => loc.id !== deletedItem.id)
            : null,
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
          value={isActiveFilter}
          onValueChange={(val) => {
            setIsActiveFilter(val);
            setSkip(0);
          }}
        >
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setIsCreating(true)}>
          <PlusIcon size={16} className="mr-2" />
          Add Location
        </Button>
      </div>

      <div className="border border-(--surface-border-color) flex-1 min-h-0 w-full overflow-hidden [&_div[data-slot=table-container]]:h-full [&_div[data-slot=table-container]]:overflow-auto">
        <Table className="whitespace-nowrap">
          <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color) sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead className="font-semibold h-10 px-4 w-[5%] text-center">
                No
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[25%]">
                Code
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[35%]">
                Location Name
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[20%]">
                Description
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-center w-[10%]">
                Status
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-right w-[10%]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-(--surface-border-color)">
            {pending ? (
              <TableLoadingRows colSpan={6} rows={6} />
            ) : locations.length === 0 ? (
              <TableEmptyRow
                colSpan={6}
                icon={MapPin}
                message="No locations found"
                description="Add your first location using the button above."
              />
            ) : (
              locations.map((loc, index) => (
                <TableRow
                  key={loc.id}
                  className="hover:bg-primary/5 transition-colors"
                >
                  <TableCell className="px-4 py-3 text-center text-muted-foreground">
                    {skip + index + 1}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-medium text-foreground">
                    {loc.code}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-medium text-foreground">
                    {loc.name}
                  </TableCell>
                  <TableCell className="px-4 py-3">{loc.description}</TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    {loc.is_active ? (
                      <span className="text-green-600 bg-green-500/10 px-2 py-1 rounded-md text-sm font-medium">
                        Active
                      </span>
                    ) : (
                      <span className="text-red-600 bg-red-500/10 px-2 py-1 rounded-md text-sm font-medium">
                        Inactive
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => setLocationToEdit(loc)}
                      >
                        <EditIcon size={14} />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:bg-red-500/10"
                        onClick={() => setLocationToDelete(loc)}
                      >
                        <Trash2Icon size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {locations.length > 0 || skip > 0 ? (
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

      <LocationFormModal
        isOpen={isCreating || locationToEdit !== null}
        onClose={() => {
          setIsCreating(false);
          setLocationToEdit(null);
        }}
        locationToEdit={locationToEdit}
        onSuccess={handleSuccess}
      />

      <ConfirmDeleteModal
        isOpen={locationToDelete !== null}
        onClose={() => setLocationToDelete(null)}
        location={locationToDelete}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
