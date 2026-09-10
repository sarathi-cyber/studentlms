import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <header className="border-b border-[#292929] bg-[#111111]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <div className="text-xl font-bold tracking-wide text-[#d4af37]">
              TECHVORA
            </div>
            <div className="text-[10px] tracking-[0.3em] text-zinc-500">
              ACADEMY
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm font-medium text-white">
              {user.email}
            </p>
            <p className="text-xs capitalize text-zinc-500">
              {user.role} · {user.status}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:grid-cols-[220px_1fr]">
        <aside className="rounded-2xl border border-[#292929] bg-[#111111] p-4">
          <nav className="space-y-2">
            <div className="rounded-xl bg-[#d4af37] px-4 py-3 text-sm font-semibold text-black">
              Dashboard
            </div>

            <div className="rounded-xl px-4 py-3 text-sm text-zinc-400">
              My Courses
            </div>

            <div className="rounded-xl px-4 py-3 text-sm text-zinc-400">
              Progress
            </div>

            <div className="rounded-xl px-4 py-3 text-sm text-zinc-400">
              Profile
            </div>
          </nav>

          <form action="/api/auth/logout" method="POST" className="mt-8">
            <button
              type="submit"
              className="w-full rounded-xl border border-[#292929] px-4 py-3 text-sm font-medium text-zinc-300 transition hover:border-red-900 hover:text-red-400"
            >
              Logout
            </button>
          </form>
        </aside>

        <section>
          <div className="mb-8">
            <p className="text-sm text-[#d4af37]">
              Student Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Welcome back.
            </h1>

            <p className="mt-2 text-zinc-400">
              Your Techvora Academy learning journey starts here.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DashboardCard
              title="My Courses"
              value="0"
              description="Courses enrolled"
            />

            <DashboardCard
              title="Learning Progress"
              value="0%"
              description="Overall completion"
            />

            <DashboardCard
              title="Certificates"
              value="0"
              description="Certificates earned"
            />
          </div>

          <div className="mt-6 rounded-2xl border border-[#292929] bg-[#111111] p-6">
            <h2 className="text-lg font-semibold">
              Getting Started
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Your dashboard is ready. Courses, lessons, progress
              tracking, assessments, and certificates will appear here
              as they become available.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function DashboardCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[#292929] bg-[#111111] p-6">
      <p className="text-sm text-zinc-500">{title}</p>
      <p className="mt-3 text-3xl font-bold text-[#d4af37]">
        {value}
      </p>
      <p className="mt-1 text-xs text-zinc-500">{description}</p>
    </div>
  );
}
