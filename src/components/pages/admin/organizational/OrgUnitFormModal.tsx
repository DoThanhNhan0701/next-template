"use client";

import { useEffect } from "react";

import { useTranslations } from "next-intl";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { SelectField } from "@/components/common/SelectField";
import {
  GetOrgUnitSchema,
  IOrgUnitFormValues,
} from "@/components/schemas/admin/org-unit.schema";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { useMutation } from "@/hooks/useMutation";
import { IUser } from "@/types/auth";
import { IOrgUnit } from "@/types/org";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";
import { cleanFormData } from "@/utils/form";

interface Props {
  unitToEdit?: IOrgUnit | null;
  parentUnit?: { id: number; name: string } | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (savedUnit: IOrgUnit) => void;
  isParentDisabled?: boolean;
}

export default function OrgUnitFormModal({
  unitToEdit,
  parentUnit,
  isOpen,
  onClose,
  onSuccess,
  isParentDisabled = false,
}: Props) {
  const t = useTranslations("page_organization");
  const isEditing = !!unitToEdit;
  const { mutate, pending } = useMutation<IOrgUnit>();

  // Fetch users for leader selection
  const { response: userRes } = useGet<IUser[]>(
    { url: endpoints.USERS },
    { disabled: !isOpen },
  );
  const users = userRes || [];

  // Fetch all organizational units for parent selection
  const { response: unitsRes } = useGet<IOrgUnit[]>(
    { url: endpoints.ORG_UNITS },
    { disabled: !isOpen },
  );
  const allUnits = unitsRes || [];

  // Helper to format units hierarchically
  const availableParentUnits = (() => {
    interface HierarchicalOrgUnit extends IOrgUnit {
      displayName: string;
    }

    const excludeIds = new Set<number>();
    if (unitToEdit) {
      excludeIds.add(unitToEdit.id);
      // Recursively add all descendants to exclude list
      const addDescendants = (id: number) => {
        allUnits
          .filter((u) => u.parent_id === id)
          .forEach((child) => {
            excludeIds.add(child.id);
            addDescendants(child.id);
          });
      };
      addDescendants(unitToEdit.id);
    }

    const formatTree = (
      parentId: number | null = null,
      depth = 0,
    ): HierarchicalOrgUnit[] => {
      return allUnits
        .filter((u) => u.parent_id === parentId && !excludeIds.has(u.id))
        .sort((a, b) => a.name.localeCompare(b.name))
        .reduce<HierarchicalOrgUnit[]>((acc, unit) => {
          const children = formatTree(unit.id, depth + 1);
          return [
            ...acc,
            {
              ...unit,
              displayName: `${"\u00A0\u00A0\u00A0\u00A0".repeat(depth)}${depth > 0 ? "└─ " : ""}${unit.name} (${unit.code})`,
            },
            ...children,
          ];
        }, []);
    };

    return formatTree();
  })();

  const schema = GetOrgUnitSchema(t);
  const form = useForm<IOrgUnitFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      code: "",
      unit_type: "department",
      parent_id: null,
      leader_id: null,
      address: "",
      description: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (unitToEdit) {
        form.reset({
          name: unitToEdit.name,
          code: unitToEdit.code,
          unit_type: unitToEdit.unit_type as
            | "company"
            | "department"
            | "branch",
          parent_id: unitToEdit.parent_id,
          leader_id: unitToEdit.leader_id,
          address: unitToEdit.address || "",
          description: unitToEdit.description || "",
          is_active: unitToEdit.is_active,
        });
      } else {
        form.reset({
          name: "",
          code: "",
          unit_type: "department",
          parent_id: parentUnit?.id || null,
          leader_id: null,
          address: "",
          description: "",
          is_active: true,
        });
      }
    }
  }, [isOpen, unitToEdit, parentUnit, form]);

  const onSubmit = async (data: IOrgUnitFormValues) => {
    const cleanedData = cleanFormData(data);

    // Explicitly allow null for parent_id and leader_id to unset them
    if (data.parent_id === null) cleanedData.parent_id = null;
    if (data.leader_id === null) cleanedData.leader_id = null;
    const url = isEditing
      ? `${endpoints.ORG_UNITS}/${unitToEdit.id}/`
      : endpoints.ORG_UNITS;
    const method = isEditing ? "patch" : "post";

    await mutate(
      {
        url,
        method,
        body: cleanedData,
      },
      {
        onSuccess: (res) => {
          getApiSuccessMessage(res);
          onSuccess(res);
          onClose();
        },
        onError: (err) => {
          getApiErrorMessage(err);
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-3 shrink-0 border-b">
          <DialogTitle>
            {isEditing ? t("edit_unit") : t("create_unit")}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t("modifying_unit", { name: unitToEdit.name })
              : parentUnit
                ? t("adding_sub_unit", { name: parentUnit.name })
                : t("adding_root_unit")}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="flex-1 px-6 pb-6 overflow-y-auto">
            <FieldGroup className="grid grid-cols-2 gap-3">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="col-span-2 gap-1">
                    <FieldLabel>{t("unit_name")}</FieldLabel>
                    <Input {...field} placeholder={t("name_placeholder")} />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="code"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>{t("unit_code")}</FieldLabel>
                    <Input {...field} placeholder={t("code_placeholder")} />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="unit_type"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>{t("unit_type")}</FieldLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("select_type")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="company">{t("company")}</SelectItem>
                        <SelectItem value="branch">{t("branch")}</SelectItem>
                        <SelectItem value="department">
                          {t("department")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="parent_id"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="col-span-2 gap-1">
                    <FieldLabel>{t("parent_unit")}</FieldLabel>
                    <SelectField
                      disabled={isParentDisabled}
                      options={(availableParentUnits ?? []).map((unit) => ({
                        label: `${unit.name} (${unit.code})`,
                        value: unit.id,
                      }))}
                      value={field.value}
                      onChange={(val: string | number) =>
                        field.onChange(val === "none" ? null : Number(val))
                      }
                      placeholder={t("select_parent")}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="leader_id"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="col-span-2 gap-1">
                    <FieldLabel>{t("leader")}</FieldLabel>
                    <SelectField
                      disabled={isParentDisabled}
                      options={(users ?? []).map((u) => ({
                        label: `${u.full_name} (${u.username})`,
                        value: u.id,
                      }))}
                      value={field.value}
                      onChange={(val: string | number) =>
                        field.onChange(val === "none" ? null : Number(val))
                      }
                      placeholder={t("select_leader")}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="address"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="col-span-2 gap-1">
                    <FieldLabel>{t("address")}</FieldLabel>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder={t("address_placeholder")}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="col-span-2 gap-1">
                    <FieldLabel>{t("description")}</FieldLabel>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      placeholder={t("description_placeholder")}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="is_active"
                control={form.control}
                render={({ field }) => (
                  <Field
                    orientation="horizontal"
                    className="flex items-center gap-2 rounded-md border p-3 space-y-0"
                  >
                    <Checkbox
                      id="is_active"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <FieldLabel
                        htmlFor="is_active"
                        className="text-sm font-medium cursor-pointer"
                      >
                        {t("active_status")}
                      </FieldLabel>
                      <p className="text-xs text-muted-foreground">
                        {t("active_status_description")}
                      </p>
                    </div>
                  </Field>
                )}
              />
            </FieldGroup>
          </div>

          <DialogFooter className="p-3 shrink-0 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? t("saving") : t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
