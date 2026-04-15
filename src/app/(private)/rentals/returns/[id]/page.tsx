import RentalReturnDetail from "@/components/pages/user/rentals/RentalReturnDetail";

export const metadata = {
    title: "Rental Return Detail | Asset Management System",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <RentalReturnDetail id={id} />;
}
