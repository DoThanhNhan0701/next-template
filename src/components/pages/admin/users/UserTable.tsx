"use client";

import { useState } from "react";

import { EditIcon, Key, PlusIcon, Trash2Icon, UserCog } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

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
import { AppDispatch, RootState } from "@/redux";
import { actionSetUser } from "@/redux/slices/auth";
import { IUser } from "@/types/auth";

import ChangePasswordModal from "./ChangePasswordModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import UserFormModal from "./UserFormModal";

export default function UserTable() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  console.log(user);

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

  const { response, pending, reFetch, setResponse } = useGet<IUser[]>({
    url: `${endpoints.USERS}?${queryParams.toString()}`,
  });
  const users = response || [];

  const currentPage = Math.floor(skip / limit) + 1;
  const hasMore = users.length === limit;

  const [isCreating, setIsCreating] = useState(false);
  const [userToEdit, setUserToEdit] = useState<IUser | null>(null);
  const [userToPwChange, setUserToPwChange] = useState<IUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<IUser | null>(null);

  const handleSuccess = (responseData?: unknown, method?: string) => {
    if (responseData && method === "patch") {
      const resp = responseData as { data?: IUser } | IUser;
      const updatedItem = ("data" in resp ? resp.data : resp) as
        | IUser
        | undefined;
      if (updatedItem?.id) {
        if (user && updatedItem.id === user.id) {
          dispatch(
            actionSetUser({
              ...user,
              ...updatedItem,
            }),
          );
        }
        setResponse((prev: IUser[] | null) =>
          prev
            ? prev.map((u: IUser) =>
                u.id === updatedItem?.id ? { ...u, ...updatedItem } : u,
              )
            : null,
        );
        return;
      }
    } else if (responseData && method === "post") {
      const resp = responseData as { data?: IUser } | IUser;
      const newItem = ("data" in resp ? resp.data : resp) as IUser | undefined;
      if (newItem?.id) {
        setResponse((prev: IUser[] | null) =>
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
          Add User
        </Button>
      </div>

      <div className="border border-(--surface-border-color) rounded-lg flex-1 min-h-0 w-full overflow-hidden [&_div[data-slot=table-container]]:h-full [&_div[data-slot=table-container]]:overflow-auto">
        <Table className="whitespace-nowrap">
          <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color) sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead className="font-semibold h-10 px-4 w-[5%] text-center">
                No
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[15%]">
                Username
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[25%]">
                Full Name
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[25%]">
                Email
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-center w-[10%]">
                Role
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-center w-[10%]">
                Status
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-right w-[15%]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-(--surface-border-color)">
            {pending ? (
              <TableLoadingRows colSpan={7} rows={6} />
            ) : users.length === 0 ? (
              <TableEmptyRow
                colSpan={7}
                icon={UserCog}
                message="No users found"
                description="Add your first user using the button above."
              />
            ) : (
              users.map((user, index) => (
                <TableRow
                  key={user.id}
                  className="hover:bg-primary/5 transition-colors"
                >
                  <TableCell className="px-4 py-3 text-center text-muted-foreground">
                    {skip + index + 1}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-medium text-foreground">
                    {user.username}
                  </TableCell>
                  <TableCell className="px-4 py-3">{user.full_name}</TableCell>
                  <TableCell className="px-4 py-3">{user.email}</TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm font-medium">
                      {user.role_obj?.name || user.role}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    {user.is_active ? (
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
                        onClick={() => setUserToPwChange(user)}
                      >
                        <Key size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => setUserToEdit(user)}
                      >
                        <EditIcon size={14} />
                      </Button>
                      {user.is_active && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:bg-red-500/10"
                          onClick={() => setUserToDelete(user)}
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

      {users.length > 0 || skip > 0 ? (
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

      <UserFormModal
        isOpen={isCreating || userToEdit !== null}
        onClose={() => {
          setIsCreating(false);
          setUserToEdit(null);
        }}
        userToEdit={userToEdit}
        onSuccess={handleSuccess}
      />
      <ChangePasswordModal
        isOpen={userToPwChange !== null}
        onClose={() => setUserToPwChange(null)}
        userId={userToPwChange?.id || null}
      />
      <ConfirmDeleteModal
        isOpen={userToDelete !== null}
        onClose={() => setUserToDelete(null)}
        user={userToDelete}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
