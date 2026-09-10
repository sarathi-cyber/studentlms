import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import LogoutButton from "./logout-button";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="techvora-page min-h-screen text-white">
      <div className="techvora-content">
        <header className="border-b border-[#292929] bg-[#0d0d0d]/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
            <div>
              <div className="techvora-gold-text text-xl font-black tracking-[0.12em]">
                TECHVORA
              </div>

              <div className="mt-1 text-[10px] font-medium tracking-[0.4em] text-zinc-500">
                ACADEMY
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-white">
                  {user.email}
                </p>

                <p className="mt-1 text-xs capitalize text-zinc-500">
                  {user.role} · {user.status}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 text-sm font-bold text-[#d4af37]">
                {user.email.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:grid-cols-[220px_1fr]">
          <aside className="techvora-card techvora-glow h-fit rounded-2xl p-4">
            <nav className="space-y-2">
              <div className="rounded-xl bg-[#d4af37] px-4 py-3 text-sm font-semibold text-black shadow-lg shadow-[#d4af37]/10">
                Dashboard
              </div>

              <button
                type="button"
                disabled
                className="w-full cursor-not-allowed rounded-xl px-4 py-3 text-left text-sm text-zinc-500 transition"
              >
                My Courses
              </button>

              <button
                type="button"
                disabled
                className="w-full cursor-not-allowed rounded-xl px-4 py-3 text-left text-sm text-zinc-500 transition"
              >
                Progress
              </button>

              <button
                type="button"
                disabled
                className="w-full cursor-not-allowed rounded-xl px-4 py-3 text-left text-sm text-zinc-500 transition"
              >
                Profile
              </button>
            </nav>

            <div className="techvora-divider my-6" />

            <LogoutButton />
          </aside>

          <section>
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d4af37]">
                Student Dashboard
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Welcome back.
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
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

            <div className="techvora-card mt-6 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="techvora-float flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#d4af37]/25 bg-[#d4af37]/10 text-lg text-[#d4af37]">
                  ✦
                </div>

                <div>
                  <h2 className="text-lg font-semibold">
                    Getting Started
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Your dashboard is ready. Courses, lessons,
                    progress tracking, assessments, and certificates
                    will appear here as they become available.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <FeatureCard
                title="Learning"
                description="Access your enrolled courses and continue your lessons."
              />

              <FeatureCard
                title="Achievements"
                description="Track your progress and collect certificates as you learn."
              />
            </div>
          </section>
        </div>
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
    <div className="techvora-card techvora-glow rounded-2xl p-6">
      <p className="text-sm text-zinc-500">{title}</p>

      <p className="techvora-gold-text mt-3 text-3xl font-black">
        {value}
      </p>

      <p className="mt-1 text-xs text-zinc-500">
        {description}
      </p>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="techvora-card rounded-2xl p-5">
      <div className="mb-3 h-1 w-10 rounded-full bg-[#d4af37]" />

      <h3 className="font-semibold text-white">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-zinc-500">
        {description}
      </p>
    </div>
  );
}
