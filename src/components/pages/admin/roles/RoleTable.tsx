"use client";

import { useEffect, useState } from "react";

import { useTranslations } from "next-intl";

import { EditIcon, Search, Shield } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import { TablePagination } from "@/components/common/TablePagination";
import {
  TableEmptyRow,
  TableLoadingRows,
} from "@/components/common/TableStateDisplay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useGet } from "@/hooks/useGet";
import { AppDispatch, RootState } from "@/redux";
import { actionFetchUser, actionSetUser } from "@/redux/slices/auth";
import { IRoleObj } from "@/types/auth";
import { IRole } from "@/types/rbac";

import RoleFormModal from "./RoleFormModal";

export default function RoleTable() {
  const t = useTranslations("page_roles");
  const td = useTranslations("page_roles.delete");
  const tc = useTranslations("Common");
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(100);
  const [isActiveFilter, setIsActiveFilter] = useState("all");

  const { search, searchVal, setSearchVal } = useDebouncedSearch();

  useEffect(() => {
    setSkip(0);
  }, [search]);

  const queryParams = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });

  if (isActiveFilter !== "all") {
    queryParams.append("is_active", isActiveFilter);
  }

  if (search) {
    queryParams.append("search", search);
  }

  const { response, pending, reFetch, setResponse } = useGet<IRole[]>({
    url: `${endpoints.RBAC_ROLES}?${queryParams.toString()}`,
  });

  const roles = response || [];

  const [isCreating, setIsCreating] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<IRole | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<IRole | null>(null);

  const handleSuccess = (responseData?: unknown, method?: string) => {
    if (responseData && method === "patch") {
      const resp = responseData as { data?: IRole } | IRole;
      const updatedItem = ("data" in resp ? resp.data : resp) as
        | IRole
        | undefined;
      if (updatedItem?.id) {
        const isEditingCurrentUserRole =
          user && roleToEdit && roleToEdit.name === user.role;

        if (isEditingCurrentUserRole) {
          dispatch(
            actionSetUser({
              ...user,
              role: updatedItem.name,
              permissions: updatedItem.permissions?.map((p) => p.code) || [],
              role_obj: updatedItem as unknown as IRoleObj,
            }),
          );
        } else {
          dispatch(actionFetchUser());
        }
        setResponse((prev: IRole[] | null) =>
          prev
            ? prev.map((r: IRole) =>
                r.id === updatedItem?.id ? { ...r, ...updatedItem } : r,
              )
            : null,
        );
        return;
      }
    } else if (responseData && method === "post") {
      const resp = responseData as { data?: IRole } | IRole;
      const newItem = ("data" in resp ? resp.data : resp) as IRole | undefined;
      if (newItem?.id) {
        setResponse((prev: IRole[] | null) =>
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
        <div className="flex items-center gap-2 flex-wrap flex-1 max-w-md">
          <Select
            value={isActiveFilter}
            onValueChange={(val) => {
              setIsActiveFilter(val);
              setSkip(0);
            }}
          >
            <SelectTrigger className="w-40 h-9">
              <SelectValue placeholder={t("all_statuses")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("all_statuses")}</SelectItem>
              <SelectItem value="true">{t("active")}</SelectItem>
              <SelectItem value="false">{t("inactive")}</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="search"
              placeholder={tc("search_placeholder") || "Tìm kiếm..."}
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="pl-9 h-9 text-sm w-full"
            />
          </div>
        </div>
        <Button onClick={() => setIsCreating(true)}>{t("add_role")}</Button>
      </div>
      <div className="border border-(--surface-border-color) flex-1 min-h-0 w-full overflow-hidden [&_div[data-slot=table-container]]:h-full [&_div[data-slot=table-container]]:overflow-auto">
        <Table className="w-full">
          <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color) sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead className="font-semibold h-10 px-4 w-10 text-center">
                {tc("stt")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4">
                {t("role_name")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 hidden md:table-cell">
                {t("description_label")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-center hidden sm:table-cell">
                {t("status")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-right">
                {t("actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className={`divide-y divide-(--surface-border-color) transition-opacity duration-200 ${pending ? "opacity-60" : ""}`}>
            {pending && roles.length === 0 ? (
              <TableLoadingRows colSpan={5} rows={6} />
            ) : roles.length === 0 ? (
              <TableEmptyRow
                colSpan={5}
                icon={Shield}
                message={t("no_roles_found")}
                description={t("add_first_role_description")}
              />
            ) : (
              roles.map((role, index) => (
                <TableRow
                  key={role.id}
                  className="hover:bg-primary/5 transition-colors"
                >
                  <TableCell className="px-4 py-1.5 text-center text-muted-foreground">
                    {skip + index + 1}
                  </TableCell>
                  <TableCell className="px-4 py-1.5 font-medium text-foreground">
                    {role.name}
                  </TableCell>
                  <TableCell className="px-4 py-1.5 hidden md:table-cell">
                    {role.description}
                  </TableCell>
                  <TableCell className="px-4 py-1.5 text-center hidden sm:table-cell">
                    {role.is_active ? (
                      <span className="text-green-600 bg-green-500/10 px-2 py-1 rounded-md text-sm font-medium">
                        {t("active")}
                      </span>
                    ) : (
                      <span className="text-red-600 bg-red-500/10 px-2 py-1 rounded-md text-sm font-medium">
                        {t("inactive")}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-1.5 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => setRoleToEdit(role)}
                      >
                        <EditIcon size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        skip={skip}
        limit={limit}
        count={roles.length}
        pending={pending}
        onPageChange={setSkip}
        onLimitChange={setLimit}
      />

      <RoleFormModal
        isOpen={isCreating || roleToEdit !== null}
        onClose={() => {
          setIsCreating(false);
          setRoleToEdit(null);
        }}
        roleToEdit={roleToEdit}
        onSuccess={handleSuccess}
      />

      <ConfirmDeleteModal
        isOpen={roleToDelete !== null}
        onClose={() => setRoleToDelete(null)}
        onSuccess={handleSuccess}
        title={td("title")}
        description={td.rich("confirm_message", {
          name: roleToDelete?.name || "this role",
          important: (chunks) => (
            <span className="font-semibold">{chunks}</span>
          ),
        })}
        url={
          roleToDelete ? dynamicEndpoints.RBAC_ROLE_DETAIL(roleToDelete.id) : ""
        }
        method="delete"
        translationGroup="page_roles.delete"
      />
    </div>
  );
}
