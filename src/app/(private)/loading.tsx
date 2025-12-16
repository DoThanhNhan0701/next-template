import Loading from "@/components/common/Loading";

export default function PageLoading() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-(--surface-container)">
      <Loading />
    </div>
  );
}
