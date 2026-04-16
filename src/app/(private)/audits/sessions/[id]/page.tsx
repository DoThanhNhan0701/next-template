import AuditDetail from "@/components/pages/user/audits/AuditDetail";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <AuditDetail id={id} />;
}
