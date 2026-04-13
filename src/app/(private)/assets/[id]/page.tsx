import AssetDetail from "@/components/pages/user/physical-assets/AssetDetail";

export const metadata = {
  title: "Asset Detail | RS Asset",
  description: "View details of physical asset",
};

export default async function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AssetDetail id={id} />;
}
