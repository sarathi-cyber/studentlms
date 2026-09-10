import Link from "next/link";

import { getCurrentUser } from "@/lib/auth/session";
import AdminLogoutButton from "./admin-logout-button";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="techvora-page min-h-screen">
      <div className="techvora-content min-h-screen">
        <header className="border-b border-[#242424] bg-[#0b0b0b]/90 backdrop-blur-xl">
          <div className="flex min-h-20 items-center justify-between px-6 lg:px-10">
            <div className="pl-14 lg:pl-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#d4af37]">
                Administration
              </p>

              <h1 className="mt-1 text-xl font-bold text-white">
                Admin Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden text-right sm:block">
                <p className="text-sm text-white">
                  {user?.email}
                </p>

                <p className="mt-1 text-[11px] uppercase tracking-[0.15em] text-zinc-600">
                  Administrator
                </p>
              </div>

              <AdminLogoutButton />
            </div>
          </div>
        </header>

        <section className="px-6 py-8 lg:px-10">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d4af37]">
              Techvora LMS
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Control center.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
              Manage courses, students, enrollments, learning
              progress, assessments, certificates, resources,
              and LMS settings from one place.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Students"
              value="0"
              description="Registered students"
            />

            <StatCard
              label="Courses"
              value="0"
              description="Total courses"
            />

            <StatCard
              label="Enrollments"
              value="0"
              description="Course enrollments"
            />

            <StatCard
              label="Certificates"
              value="0"
              description="Certificates issued"
            />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <section className="techvora-card rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
                    Quick Actions
                  </p>

                  <h3 className="mt-2 text-xl font-bold text-white">
                    Manage your LMS
                  </h3>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <QuickAction
                  href="/admin/courses"
                  title="Manage Courses"
                  description="Create and organize courses."
                />

                <QuickAction
                  href="/admin/students"
                  title="Manage Students"
                  description="View and manage learners."
                />

                <QuickAction
                  href="/admin/enrollments"
                  title="Enrollments"
                  description="Control course enrollment."
                />

                <QuickAction
                  href="/admin/settings"
                  title="System Settings"
                  description="Configure the LMS."
                />
              </div>
            </section>

            <section className="techvora-card rounded-2xl p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
                System
              </p>

              <h3 className="mt-2 text-xl font-bold text-white">
                Admin Status
              </h3>

              <div className="mt-6 space-y-4">
                <StatusRow
                  label="Authentication"
                  value="Operational"
                />

                <StatusRow
                  label="Database"
                  value="Connected"
                />

                <StatusRow
                  label="Authorization"
                  value="RBAC Active"
                />

                <StatusRow
                  label="Admin Access"
                  value="Protected"
                />
              </div>
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="techvora-card techvora-glow rounded-2xl p-6">
      <p className="text-sm text-zinc-500">{label}</p>

      <p className="techvora-gold-text mt-3 text-4xl font-black">
        {value}
      </p>

      <p className="mt-2 text-xs text-zinc-600">
        {description}
      </p>
    </div>
  );
}

function QuickAction({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-[#252525] bg-[#101010] p-4 transition hover:border-[#d4af37]/30 hover:bg-[#151515]"
    >
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-white transition group-hover:text-[#d4af37]">
          {title}
        </h4>

        <span className="text-[#d4af37] transition-transform group-hover:translate-x-1">
          →
        </span>
      </div>

      <p className="mt-2 text-xs leading-5 text-zinc-600">
        {description}
      </p>
    </Link>
  );
}

function StatusRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#202020] pb-3">
      <span className="text-sm text-zinc-500">{label}</span>

      <span className="text-xs font-semibold text-[#d4af37]">
        {value}
      </span>
    </div>
  );
}
