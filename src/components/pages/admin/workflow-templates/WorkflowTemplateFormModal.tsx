"use client";

import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { GripVertical, PlusIcon, Shield, Trash2Icon, User } from "lucide-react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { IRole } from "@/types/rbac";
import { IWorkflowTemplate } from "@/types/workflow-template";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";

const StepSchema = z.object({
  id: z.number().optional(),
  step_order: z.number().min(1),
  name: z.string().min(1, "Step name is required"),
  default_assignee_role_id: z.number().nullable().optional(),
  default_assignee_user_id: z.number().nullable().optional(),
});

const TemplateSchema = z.object({
  name: z.string().min(1, "Workflow name is required"),
  document_type: z.string().min(1, "Document type is required"),
  description: z.string().optional(),
  is_active: z.boolean(),
  is_locked: z.boolean(),
  steps: z.array(StepSchema),
});

type FormValues = z.infer<typeof TemplateSchema>;
type AssigneeType = "none" | "role" | "user";

const DOCUMENT_TYPES = [
  { value: "transfer", label: "Transfer", labelVi: "Điều chuyển tài sản" },
  { value: "allocation", label: "Allocation", labelVi: "Cấp phát tài sản" },
  { value: "recovery", label: "Recovery", labelVi: "Thu hồi tài sản" },
  { value: "maintenance", label: "Maintenance", labelVi: "Bảo trì/Sửa chữa" },
  { value: "rental", label: "Rental", labelVi: "Cho thuê tài sản" },
  {
    value: "rental_return",
    label: "Rental Return",
    labelVi: "Hoàn trả cho thuê",
  },
  { value: "liquidation", label: "Liquidation", labelVi: "Thanh lý tài sản" },
  { value: "audit", label: "Audit", labelVi: "Kiểm kê tài sản" },
];

function getAssigneeType(
  roleId?: number | null,
  userId?: number | null,
): AssigneeType {
  if (roleId) return "role";
  if (userId) return "user";
  return "none";
}

function StepAssigneeFields({
  index,
  control,
  setValue,
  roles,
  users,
}: {
  index: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: any;
  roles: IRole[];
  users: IUser[];
}) {
  const roleId = useWatch({
    control,
    name: `steps.${index}.default_assignee_role_id`,
  });
  const userId = useWatch({
    control,
    name: `steps.${index}.default_assignee_user_id`,
  });
  const [assigneeType, setAssigneeType] = useState<AssigneeType>(() =>
    getAssigneeType(roleId, userId),
  );

  const handleTypeChange = (type: AssigneeType) => {
    setAssigneeType(type);
    setValue(`steps.${index}.default_assignee_role_id`, null);
    setValue(`steps.${index}.default_assignee_user_id`, null);
  };

  return (
    <div className="grid grid-cols-2 gap-3 col-span-2">
      <Field className="gap-1">
        <FieldLabel>Default Assignee Type</FieldLabel>
        <Select
          value={assigneeType}
          onValueChange={(v) => handleTypeChange(v as AssigneeType)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No default</SelectItem>
            <SelectItem value="role">
              <span className="flex items-center gap-1.5">
                <Shield size={12} />
                By Role
              </span>
            </SelectItem>
            <SelectItem value="user">
              <span className="flex items-center gap-1.5">
                <User size={12} />
                Specific Person
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Field className="gap-1">
        <FieldLabel>
          {assigneeType === "role"
            ? "Select Role"
            : assigneeType === "user"
              ? "Select Staff"
              : "Select Assignee"}
        </FieldLabel>
        {assigneeType === "role" ? (
          <Controller
            name={`steps.${index}.default_assignee_role_id`}
            control={control}
            render={({ field: f }) => (
              <Select
                value={f.value?.toString() ?? ""}
                onValueChange={(v) => f.onChange(v ? Number(v) : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role..." />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.id.toString()}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        ) : assigneeType === "user" ? (
          <Controller
            name={`steps.${index}.default_assignee_user_id`}
            control={control}
            render={({ field: f }) => (
              <Select
                value={f.value?.toString() ?? ""}
                onValueChange={(v) => f.onChange(v ? Number(v) : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select staff..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.full_name} ({s.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        ) : (
          <Select disabled>
            <SelectTrigger className="opacity-50">
              <SelectValue placeholder="Select assignee..." />
            </SelectTrigger>
          </Select>
        )}
      </Field>
    </div>
  );
}

interface Props {
  templateToEdit?: IWorkflowTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (saved: IWorkflowTemplate, isEdit: boolean) => void;
}

export default function WorkflowTemplateFormModal({
  templateToEdit,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const isEditing = !!templateToEdit;
  const { mutate, pending } = useMutation<IWorkflowTemplate>();

  const { response: rolesRes } = useGet<IRole[]>(
    { url: endpoints.RBAC_ROLES },
    { disabled: !isOpen },
  );
  const { response: usersRes } = useGet<IUser[]>(
    { url: endpoints.USERS },
    { disabled: !isOpen },
  );

  const roles = rolesRes || [];
  const users = Array.isArray(usersRes) ? usersRes : [];

  const form = useForm<FormValues>({
    resolver: zodResolver(TemplateSchema),
    defaultValues: {
      name: "",
      document_type: "",
      description: "",
      is_active: true,
      is_locked: false,
      steps: [],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "steps",
  });

  useEffect(() => {
    if (!isOpen) return;
    if (templateToEdit) {
      form.reset({
        name: templateToEdit.name,
        document_type: templateToEdit.document_type,
        description: templateToEdit.description || "",
        is_active: templateToEdit.is_active,
        is_locked: templateToEdit.is_locked,
        steps: templateToEdit.steps.map((s) => ({
          id: s.id,
          step_order: s.step_order,
          name: s.name,
          default_assignee_role_id: s.default_assignee_role_id ?? null,
          default_assignee_user_id: s.default_assignee_user_id ?? null,
        })),
      });
    } else {
      form.reset({
        name: "",
        document_type: "",
        description: "",
        is_active: true,
        is_locked: false,
        steps: [],
      });
    }
  }, [isOpen, templateToEdit, form]);

  const onSubmit = async (data: FormValues) => {
    const body = {
      ...data,
      steps: data.steps.map((s, i) => ({ ...s, step_order: i + 1 })),
    };
    const url = isEditing
      ? `${endpoints.TEMPLATES}${templateToEdit.id}/`
      : endpoints.TEMPLATES;
    const method = isEditing ? "put" : "post";

    await mutate(
      { url, method, body },
      {
        onSuccess: (res) => {
          getApiSuccessMessage(res);
          onSuccess(res, isEditing);
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
      <DialogContent className="sm:max-w-[600px] h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 shrink-0 border-b">
          <DialogTitle>
            {isEditing ? "Edit Workflow" : "Create Approval Workflow"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Editing: ${templateToEdit.name}`
              : "Fill in the details for the new workflow."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel>Workflow Name</FieldLabel>
                    <Input
                      {...field}
                      placeholder="e.g. Default Transfer Workflow"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="document_type"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel>Document Type</FieldLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            <span>{t.label}</span>
                            <span className="text-muted-foreground ml-1.5">
                              · {t.labelVi}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="description"
                control={form.control}
                render={({ field }) => (
                  <Field className="gap-1">
                    <FieldLabel>Description</FieldLabel>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Brief description (optional)"
                      rows={3}
                    />
                  </Field>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <Controller
                  name="is_active"
                  control={form.control}
                  render={({ field }) => (
                    <Field className="gap-1 flex justify-start items-center">
                      <label className="flex items-center gap-2 text-sm text-foreground">
                        <Checkbox
                          id="is_active"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        Active
                      </label>
                    </Field>
                  )}
                />
                <Controller
                  name="is_locked"
                  control={form.control}
                  render={({ field }) => (
                    <Field className="gap-1 flex justify-start items-center">
                      <label className="flex items-center gap-2 text-sm text-foreground">
                        <Checkbox
                          id="is_locked"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        Lock Workflow
                      </label>
                    </Field>
                  )}
                />
              </div>
            </FieldGroup>

            {/* Steps */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Approval Steps</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      step_order: fields.length + 1,
                      name: "",
                      default_assignee_role_id: null,
                      default_assignee_user_id: null,
                    })
                  }
                >
                  <PlusIcon size={14} className="mr-1" />
                  Add Step
                </Button>
              </div>

              {fields.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-md">
                  No steps yet. Click &quot;Add Step&quot; to get started.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex items-start gap-2 p-3 border rounded-md bg-muted/20"
                    >
                      <div className="flex items-center gap-1 pt-2 text-muted-foreground shrink-0">
                        <GripVertical size={14} />
                        <span className="text-xs font-mono w-4 text-center">
                          {index + 1}
                        </span>
                      </div>

                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <Controller
                          name={`steps.${index}.name`}
                          control={form.control}
                          render={({ field: f, fieldState }) => (
                            <Field
                              data-invalid={fieldState.invalid}
                              className="gap-1 col-span-2"
                            >
                              <FieldLabel>Step Name</FieldLabel>
                              <Input
                                {...f}
                                placeholder="e.g. Manager Approval"
                              />
                              {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          )}
                        />
                        <StepAssigneeFields
                          index={index}
                          control={form.control}
                          setValue={form.setValue}
                          roles={roles}
                          users={users}
                        />
                      </div>

                      <div className="flex flex-col gap-1 pt-1 shrink-0">
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground"
                            onClick={() => move(index, index - 1)}
                            title="Move up"
                          >
                            ↑
                          </Button>
                        )}
                        {index < fields.length - 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground"
                            onClick={() => move(index, index + 1)}
                            title="Move down"
                          >
                            ↓
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:bg-red-500/10"
                          onClick={() => remove(index)}
                        >
                          <Trash2Icon size={13} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-3 border-t flex justify-end gap-3 shrink-0 bg-muted/10">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending} className="min-w-[120px]">
              {pending ? "Saving..." : isEditing ? "Save Changes" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
