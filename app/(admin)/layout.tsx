import { requireRole } from "@/lib/auth";
import AdminSidebar from "./_components/admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole("admin");
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 md:flex-row md:gap-6">
      <AdminSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
