import LiquidationDetail from "@/components/pages/user/liquidations/LiquidationDetail";

export const metadata = {
    title: "Liquidation Detail | Asset Management System",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <LiquidationDetail id={id} />;
}
