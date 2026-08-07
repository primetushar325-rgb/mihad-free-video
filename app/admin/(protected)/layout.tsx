import AdminShell from "@/components/admin/AdminShell";

// All pages under /admin (except /admin/login) are wrapped by the
// AdminShell which enforces authentication client-side.
export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
