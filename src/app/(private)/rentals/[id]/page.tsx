import RentalDetail from "@/components/pages/user/rentals/RentalDetail";

export const metadata = {
    title: "Rental Detail | Asset Management System",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <RentalDetail id={id} />;
}
