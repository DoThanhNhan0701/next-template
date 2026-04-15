import TransferDetail from "@/components/pages/user/transfers/TransferDetail";

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params;
  return <TransferDetail id={id} />;
}
