"use client";

import { useEffect } from "react";

import { useTranslations } from "next-intl";

import { zodResolver } from "@hookform/resolvers/zod";
import { Copy } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
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
import { dynamicEndpoints, endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { useMutation } from "@/hooks/useMutation";
import { ILocation } from "@/types/location";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";

const CloneAssetSchema = z.object({
  quantity: z.coerce.number().min(1),
  location_id: z.coerce.number().min(1, "Required"),
  notes: z.string().optional(),
});

type CloneAssetFormValues = z.infer<typeof CloneAssetSchema>;

interface Props {
  assetId: number;
  initialLocationId?: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data?: unknown) => void;
}

export default function CloneAssetModal({
  assetId,
  initialLocationId,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const t = useTranslations("page_physical_assets");
  const { mutate, pending } = useMutation();

  const { response: locationRes } = useGet<ILocation[]>(
    { url: endpoints.LOCATIONS },
    { disabled: !isOpen },
  );

  const locations = locationRes || [];

  const form = useForm({
    resolver: zodResolver(CloneAssetSchema),
    defaultValues: {
      quantity: 1,
      location_id: initialLocationId ?? undefined,
      notes: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        quantity: 1,
        location_id: initialLocationId ?? undefined,
        notes: "",
      });
    }
  }, [isOpen, initialLocationId, form]);

  const onSubmit = async (data: CloneAssetFormValues) => {
    await mutate(
      {
        url: dynamicEndpoints.PHYSICAL_ASSET_CLONE(assetId),
        method: "post",
        body: data,
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
      <DialogContent className="sm:max-w-[500px] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-3 shrink-0 border-b">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-full">
              <Copy className="w-4 h-4 text-primary" />
            </div>
            <DialogTitle className="text-base font-bold">
              {t("modals.clone_title")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {t("modals.clone_description")}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <FieldGroup className="flex flex-col gap-4">
              {/* Quantity */}
              <Controller
                name="quantity"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="gap-1.5">
                    <FieldLabel>{t("modals.fields.quantity")}</FieldLabel>
                    <Input
                      {...field}
                      value={(field.value as number) ?? ""}
                      type="number"
                      min={1}
                      placeholder="1"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Location */}
              <Controller
                name="location_id"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="gap-1.5">
                    <FieldLabel>{t("modals.fields.location")}</FieldLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value?.toString() || ""}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("modals.fields.placeholder_location")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((l) => (
                          <SelectItem key={l.id} value={l.id.toString()}>
                            {l.name}
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

              {/* Notes */}
              <Controller
                name="notes"
                control={form.control}
                render={({ field }) => (
                  <Field className="gap-1.5">
                    <FieldLabel>{t("modals.fields.notes")}</FieldLabel>
                    <Textarea
                      {...field}
                      value={(field.value as string) ?? ""}
                      placeholder={t("modals.fields.placeholder_notes")}
                      className="min-h-[120px] resize-none"
                    />
                  </Field>
                )}
              />
            </FieldGroup>
          </div>

          <DialogFooter className="p-3 shrink-0 border-t gap-2 sm:gap-0 mt-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={pending}
            >
              {t("modals.buttons.cancel")}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? t("modals.buttons.saving") : t("modals.buttons.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
