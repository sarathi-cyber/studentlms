import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import AdminSidebar from "../admin-sidebar";

export default async function AdminProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/admin/login");
  }

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <AdminSidebar user={user} />

      <main className="min-h-screen lg:pl-72">
        {children}
      </main>
    </div>
  );
}
