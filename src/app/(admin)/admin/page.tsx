export const metadata = {
  title: "Admin Dashboard | Asset Management System",
  description: "View admin overview and metrics",
};

export default function AdminPage() {
  return (
    <div className="p-4">
      <h1 className="font-bold text-sm">Admin Dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Welcome to the admin page!
      </p>
    </div>
  );
}
