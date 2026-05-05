"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

import { useDispatch } from "react-redux";

import { RecordAttachmentsCard } from "@/components/common/RecordAttachmentsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { dynamicEndpoints, endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { useMutation } from "@/hooks/useMutation";
import { decrementPendingCount } from "@/redux/slices/task";
import {
  DocumentDetail,
  ApprovalHistory as IApprovalHistory,
  ITask,
} from "@/types/task";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";

// New modular components
import { ActionHeader } from "./task-detail/ActionHeader";
import { ApprovalHistory } from "./task-detail/ApprovalHistory";
import { DocumentInfo } from "./task-detail/DocumentInfo";
import { SidebarInfo } from "./task-detail/SidebarInfo";
import { TaskApprovalForm } from "./task-detail/TaskApprovalForm";
import { getStatusInfo } from "./task-detail/status-utils";

interface TaskDetailProps {
  id: string;
}

export default function TaskDetail({ id }: TaskDetailProps) {
  const t = useTranslations("page_my_tasks.detail");
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const documentType = searchParams.get("document_type") ?? "allocation";
  const dispatch = useDispatch();
  const [comment, setComment] = useState("");
  const { mutate, pending: mutatePending } = useMutation();

  const {
    response: detail,
    pending: detailPending,
    reFetch: reFetchDetail,
  } = useGet<DocumentDetail>(
    {
      url: dynamicEndpoints.DOCUMENT_DETAIL(documentType, Number(id)),
    },
    { staleTime: 0 },
  );

  const {
    response: historyList,
    pending: historyPending,
    reFetch: reFetchHistory,
  } = useGet<IApprovalHistory[]>(
    {
      url: dynamicEndpoints.WORKFLOW_HISTORY(documentType, Number(id)),
    },
    { staleTime: 0 },
  );

  const { response: myTasksResponse, reFetch: reFetchMyTasks } = useGet<
    ITask[]
  >(
    {
      url: `${endpoints.WORKFLOW_TASKS}me`,
      config: {
        params: { status: status },
      },
    },
    { staleTime: 0 },
  );

  const activeTask = (myTasksResponse || []).find(
    (t) => t.document_id === Number(id) && t.document_type === documentType,
  );

  const handleAction = async (status: "APPROVED" | "REJECTED") => {
    if (!activeTask) return;

    await mutate(
      {
        url: dynamicEndpoints.WORKFLOW_TASK_COMPLETE(activeTask?.id),
        method: "post",
        body: {
          status: status,
          comment: comment,
        },
      },
      {
        onSuccess: (res) => {
          const isCompleted =
            (res as { workflow_status: string }).workflow_status ===
            "COMPLETED";
          getApiSuccessMessage(res);
          if (isCompleted) {
            dispatch(decrementPendingCount());
          }
          reFetchDetail();
          reFetchHistory();
          reFetchMyTasks();
        },
        onError: (error) => {
          getApiErrorMessage(error);
        },
      },
    );
  };

  if (detailPending && !detail) {
    return (
      <div className="p-6 flex flex-col gap-3">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!detail) return null;

  return (
    <div className="flex flex-col px-3 pb-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ActionHeader />

      <TaskApprovalForm
        activeTask={activeTask || null}
        comment={comment}
        setComment={setComment}
        mutatePending={mutatePending}
        onAction={handleAction}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-3">
        <div className="lg:col-span-2 flex flex-col gap-3">
          <DocumentInfo detail={detail} documentType={documentType} />
        </div>

        <div className="flex flex-col gap-3">
          <SidebarInfo detail={detail} />
        </div>
      </div>

      <RecordAttachmentsCard
        title={t("vouchers_documents")}
        className="mt-3"
        initialAttachments={
          (detail.attachments || []).map(
            (a: string | { url?: string; file_path?: string }) =>
              typeof a === "string" ? a : a?.url || a?.file_path || String(a),
          ) as string[]
        }
        isPending={mutatePending}
        onSave={async (newAttachments) => {
          const url = dynamicEndpoints.UPLOAD_ATTACHMENTS(
            documentType + "s",
            Number(id),
          );
          await mutate(
            {
              url,
              method: "patch",
              body: newAttachments,
            },
            {
              onSuccess: (res) => {
                getApiSuccessMessage(res);
                reFetchDetail();
              },
              onError: (error) => {
                getApiErrorMessage(error);
              },
            },
          );
        }}
      />

      <ApprovalHistory
        historyPending={historyPending}
        historyList={historyList}
        getStatusInfo={getStatusInfo}
      />
    </div>
  );
}
