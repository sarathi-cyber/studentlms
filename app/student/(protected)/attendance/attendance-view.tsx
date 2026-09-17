"use client";

import { useEffect, useState } from "react";

type AttendanceRecord = {
  id: string;
  courseId: string;
  courseTitle: string;
  attendanceDate: string;
  status: "present" | "absent" | "late" | "excused";
  remarks: string | null;
};

type CourseSummary = {
  courseId: string;
  courseTitle: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendancePercentage: number;
};

type AttendanceResponse = {
  summary: {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendancePercentage: number;
  };
  records: AttendanceRecord[];
  courses: CourseSummary[];
};

const statusLabels: Record<AttendanceRecord["status"], string> = {
  present: "Present",
  absent: "Absent",
  late: "Late",
  excused: "Excused",
};

export default function AttendanceView() {
  const [data, setData] = useState<AttendanceResponse>({
    summary: {
      total: 0,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      attendancePercentage: 0,
    },
    records: [],
    courses: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAttendance() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/student/attendance", {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || "Unable to load attendance.",
          );
        }

        setData({
          summary: result.summary ?? {
            total: 0,
            present: 0,
            absent: 0,
            late: 0,
            excused: 0,
            attendancePercentage: 0,
          },
          records: result.records ?? [],
          courses: result.courses ?? [],
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load attendance.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadAttendance();
  }, []);

  const overallPercentage = data.summary.attendancePercentage;
  const recentRecords = data.records.slice(0, 20);

  return (
    <div className="min-h-screen bg-black px-5 py-8 text-white sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d4af37]">
            Student Portal
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            My Attendance
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-zinc-500">
            View your course-wise attendance and attendance history.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-12 text-center text-sm text-zinc-500">
            Loading attendance...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-sm text-red-400">
            {error}
          </div>
        ) : (
          <>
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/5 p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Overall Attendance
                </p>

                <p className="mt-3 text-4xl font-bold text-[#d4af37]">
                  {overallPercentage}%
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Courses
                </p>

                <p className="mt-3 text-4xl font-bold">
                  {data.courses.length}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Attendance Records
                </p>

                <p className="mt-3 text-4xl font-bold">
                  {data.records.length}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Status
                </p>

                <p className="mt-3 text-lg font-semibold text-emerald-400">
                  Read Only
                </p>
              </div>
            </div>

            <section className="mb-8">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">
                  Course Attendance
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Your attendance summary for each enrolled course.
                </p>
              </div>

              {data.courses.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-zinc-500">
                  No attendance records available yet.
                </div>
              ) : (
                <div className="grid gap-5 lg:grid-cols-2">
                  {data.courses.map((course) => (
                    <div
                      key={course.courseId}
                      className="rounded-2xl border border-white/10 bg-zinc-950 p-6"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-white">
                            {course.courseTitle}
                          </h3>

                          <p className="mt-1 text-xs text-zinc-600">
                            {course.total} attendance records
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-2xl font-bold text-[#d4af37]">
                            {course.attendancePercentage}%
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 h-2 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-[#d4af37] transition-all"
                          style={{
                            width: `${Math.min(
                              course.attendancePercentage,
                              100,
                            )}%`,
                          }}
                        />
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <Stat
                          label="Present"
                          value={course.present}
                        />

                        <Stat
                          label="Absent"
                          value={course.absent}
                        />

                        <Stat
                          label="Late"
                          value={course.late}
                        />

                        <Stat
                          label="Excused"
                          value={course.excused}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="mb-4">
                <h2 className="text-xl font-semibold">
                  Attendance History
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Your latest attendance records.
                </p>
              </div>

              {recentRecords.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-zinc-500">
                  No attendance history available.
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-sm">
                      <thead className="border-b border-white/10 bg-white/[0.02]">
                        <tr>
                          <th className="px-5 py-4 font-semibold text-zinc-400">
                            Date
                          </th>

                          <th className="px-5 py-4 font-semibold text-zinc-400">
                            Course
                          </th>

                          <th className="px-5 py-4 font-semibold text-zinc-400">
                            Status
                          </th>

                          <th className="px-5 py-4 font-semibold text-zinc-400">
                            Remarks
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-white/5">
                        {recentRecords.map((record) => (
                          <tr key={record.id}>
                            <td className="px-5 py-4 text-zinc-300">
                              {record.attendanceDate}
                            </td>

                            <td className="px-5 py-4 text-white">
                              {record.courseTitle}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                                  record.status === "present"
                                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                    : record.status === "late"
                                      ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                                      : record.status === "excused"
                                        ? "border-sky-500/20 bg-sky-500/10 text-sky-400"
                                        : "border-red-500/20 bg-red-500/10 text-red-400"
                                }`}
                              >
                                {statusLabels[record.status]}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-zinc-500">
                              {record.remarks || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-black/40 p-3">
      <p className="text-xs text-zinc-600">{label}</p>

      <p className="mt-1 text-lg font-semibold text-white">
        {value}
      </p>
    </div>
  );
}
