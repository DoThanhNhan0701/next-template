"use client";

import { Control, Controller, FieldValues, Path } from "react-hook-form";

import MultiAttachmentUpload from "@/components/common/MultiAttachmentUpload";

interface FormAttachmentsSectionProps<T extends FieldValues> {
  control: Control<T>;
  name?: Path<T>;
  title?: string;
  sectionNumber?: string;
  className?: string;
}

export function FormAttachmentsSection<T extends FieldValues>({
  control,
  name = "attachments" as Path<T>,
  title = "Attachments",
  sectionNumber,
  className = "flex flex-col gap-3",
}: FormAttachmentsSectionProps<T>) {
  return (
    <div className={className}>
      <h3 className="text-sm font-semibold text-primary border-b pb-1">
        {sectionNumber}
        {title}
      </h3>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <MultiAttachmentUpload
            value={field.value || []}
            onChange={field.onChange}
          />
        )}
      />
    </div>
  );
}
