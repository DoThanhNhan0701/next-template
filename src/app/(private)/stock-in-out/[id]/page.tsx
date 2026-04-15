import StockAdjustmentDetail from "@/components/pages/user/stock-adjustments/StockAdjustmentDetail";

export const metadata = {
    title: "Stock Adjustment Detail | Asset Management System",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <StockAdjustmentDetail id={id} />;
}
