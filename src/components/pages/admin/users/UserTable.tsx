"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";

import { EditIcon, Key, RotateCcw, UserCog } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import { TablePagination } from "@/components/common/TablePagination";
import {
  TableEmptyRow,
  TableLoadingRows,
} from "@/components/common/TableStateDisplay";
import { Button } from "@/components/ui/button";
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
import { AppDispatch, RootState } from "@/redux";
import { actionSetUser } from "@/redux/slices/auth";
import { IUser } from "@/types/auth";

import ChangePasswordModal from "./ChangePasswordModal";
import UserFormModal from "./UserFormModal";

export default function UserTable() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const t = useTranslations("page_users");
  const td = useTranslations("page_users.delete");
  const tc = useTranslations("Common");

  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(100);
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

  const [isCreating, setIsCreating] = useState(false);
  const [userToEdit, setUserToEdit] = useState<IUser | null>(null);
  const [userToPwChange, setUserToPwChange] = useState<IUser | null>(null);
  const [userToResetPw, setUserToResetPw] = useState<IUser | null>(null);
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
      <div className="flex items-center justify-between w-full gap-2 flex-wrap">
        <Select value={isActive} onValueChange={(val) => { setIsActive(val); setSkip(0); }}>
          <SelectTrigger className="w-40 h-9"><SelectValue placeholder={t("all_statuses")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("all_statuses")}</SelectItem>
            <SelectItem value="true">{t("active")}</SelectItem>
            <SelectItem value="false">{t("inactive")}</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setIsCreating(true)}>{t("add_user")}</Button>
      </div>
      <div className="border border-(--surface-border-color) flex-1 min-h-0 w-full overflow-hidden [&_div[data-slot=table-container]]:h-full [&_div[data-slot=table-container]]:overflow-auto">
        <Table className="w-full">
          <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color) sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead className="font-semibold h-10 px-4 w-10 text-center">{tc("stt")}</TableHead>
              <TableHead className="font-semibold h-10 px-4">{t("full_name")}</TableHead>
              <TableHead className="font-semibold h-10 px-4 hidden sm:table-cell">{t("username")}</TableHead>
              <TableHead className="font-semibold h-10 px-4 hidden md:table-cell">{t("email")}</TableHead>
              <TableHead className="font-semibold h-10 px-4 text-center hidden md:table-cell">{t("staff_code_short")}</TableHead>
              <TableHead className="font-semibold h-10 px-4 text-center hidden sm:table-cell">{t("role")}</TableHead>
              <TableHead className="font-semibold h-10 px-4 text-center hidden sm:table-cell">{t("status")}</TableHead>
              <TableHead className="font-semibold h-10 px-4 text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-(--surface-border-color)">
            {pending ? <TableLoadingRows colSpan={8} rows={6} /> : users.length === 0 ? (
              <TableEmptyRow colSpan={8} icon={UserCog} message={t("no_users_found")} description={t("add_first_user_description")} />
            ) : users.map((user, index) => (
              <TableRow key={user.id} className="hover:bg-primary/5 transition-colors">
                <TableCell className="px-4 py-1.5 text-center text-muted-foreground">{skip + index + 1}</TableCell>
                <TableCell className="px-4 py-1.5 font-medium text-foreground">{user.full_name}</TableCell>
                <TableCell className="px-4 py-1.5 hidden sm:table-cell">{user.username}</TableCell>
                <TableCell className="px-4 py-1.5 hidden md:table-cell">{user.email}</TableCell>
                <TableCell className="px-4 py-1.5 text-center hidden md:table-cell">
                  {user.staff_code ? <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm font-medium">{user.staff_code}</span> : <span className="text-red-600 text-xs">{t("not_linked")}</span>}
                </TableCell>
                <TableCell className="px-4 py-1.5 text-center hidden sm:table-cell">
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm font-medium">{user.role_obj?.name || user.role}</span>
                </TableCell>
                <TableCell className="px-4 py-1.5 text-center hidden sm:table-cell">
                  {user.is_active ? <span className="text-green-600 bg-green-500/10 px-2 py-1 rounded-md text-sm font-medium">{t("active")}</span> : <span className="text-red-600 bg-red-500/10 px-2 py-1 rounded-md text-sm font-medium">{t("inactive")}</span>}
                </TableCell>
                <TableCell className="px-4 py-1.5 text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => setUserToPwChange(user)}><Key size={14} /></Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => setUserToResetPw(user)}><RotateCcw size={14} /></Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => setUserToEdit(user)}><EditIcon size={14} /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        skip={skip}
        limit={limit}
        count={users.length}
        pending={pending}
        onPageChange={setSkip}
        onLimitChange={setLimit}
      />

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
        onSuccess={handleSuccess}
        title={td("title")}
        description={td.rich("confirm_message", {
          name: userToDelete?.username || "this user",
          important: (chunks) => (
            <span className="font-semibold">{chunks}</span>
          ),
        })}
        url={userToDelete ? dynamicEndpoints.USER_DETAIL(userToDelete.id) : ""}
        method="patch"
        body={{ is_active: false }}
        translationGroup="page_users.delete"
      />
      <ConfirmDeleteModal
        isOpen={userToResetPw !== null}
        onClose={() => setUserToResetPw(null)}
        onSuccess={handleSuccess}
        title={t("reset.title")}
        description={t.rich("reset.confirm_message", {
          name: userToResetPw?.username || "this user",
          important: (chunks) => (
            <span className="font-semibold">{chunks}</span>
          ),
        })}
        url={
          userToResetPw
            ? dynamicEndpoints.USER_RESET_PASSWORD(userToResetPw.id)
            : ""
        }
        method="post"
        translationGroup="page_users.reset"
        confirmText={t("reset.confirm")}
        loadingText={t("reset.resetting")}
      />
    </div>
  );
}
