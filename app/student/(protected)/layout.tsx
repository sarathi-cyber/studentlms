import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import StudentSidebar from "./components/student-sidebar";

export default async function StudentProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/student/login");
  }

  if (user.role !== "student") {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <StudentSidebar />

        <main className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
