import MaintenanceDetail from "@/components/pages/user/maintenance/MaintenanceDetail";

export const metadata = {
    title: "Maintenance Detail | Asset Management System",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <MaintenanceDetail id={id} />;
}
