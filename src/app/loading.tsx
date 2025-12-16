import Loading from "@/components/common/Loading";

export default function GlobalLoading() {
  return (
    <Loading className="fixed inset-0 z-50 flex items-center justify-center bg-(--bg-container)" />
  );
}
