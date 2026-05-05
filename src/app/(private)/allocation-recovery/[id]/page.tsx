import AllocationRecoveryDetail from "@/components/pages/user/allocation-recovery/AllocationRecoveryDetail";

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params;
  return <AllocationRecoveryDetail id={id} />;
}
