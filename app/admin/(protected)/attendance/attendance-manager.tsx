"use client";

import { useEffect, useMemo, useState } from "react";

type Course = {
  id: string;
  title: string;
  slug: string;
};

type Student = {
  id: string;
  email: string;
  fullName: string | null;
  educationLevel: string | null;
  classOrYear: string | null;
  institution: string | null;
};

type AttendanceStatus =
  | "present"
  | "absent"
  | "late"
  | "excused";

type AttendanceRow = Student & {
  status: AttendanceStatus;
  remarks: string;
  existingRecordId: string | null;
};

const statuses: {
  value: AttendanceStatus;
  label: string;
}[] = [
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "late", label: "Late" },
  { value: "excused", label: "Excused" },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function AttendanceManager() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(today());
  const [students, setStudents] = useState<AttendanceRow[]>([]);

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadCourses() {
      try {
        setLoadingCourses(true);
        setError("");

        const response = await fetch("/api/courses", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to load courses.",
          );
        }

        setCourses(data.courses ?? []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load courses.",
        );
      } finally {
        setLoadingCourses(false);
      }
    }

    loadCourses();
  }, []);

  async function loadStudents() {
    if (!courseId || !attendanceDate) {
      setStudents([]);
      return;
    }

    try {
      setLoadingStudents(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `/api/admin/attendance?courseId=${encodeURIComponent(
          courseId,
        )}&attendanceDate=${encodeURIComponent(attendanceDate)}`,
        {
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load attendance.",
        );
      }

      const existingRecords = data.records ?? [];

      const studentResponse = await fetch(
        `/api/admin/enrollments?status=active`,
        {
          cache: "no-store",
        },
      );

      const studentData = await studentResponse.json();

      if (!studentResponse.ok) {
        throw new Error(
          studentData.error ||
            "Unable to load enrolled students.",
        );
      }

      const enrollments = (studentData.enrollments ?? []) as Array<{        courseId: string;        userId: string;        studentEmail: string;        studentName: string | null;        educationLevel: string | null;        classOrYear: string | null;        institution: string | null;      }>;      const uniqueEnrollments = Array.from(        new Map(          enrollments            .filter(              (enrollment) => enrollment.courseId === courseId,            )            .map(              (enrollment) => [enrollment.userId, enrollment] as const,            ),        ).values(),      );      const enrolledStudents = uniqueEnrollments.map(        (enrollment) => {          const existing = existingRecords.find(            (record: {              userId: string;            }) => record.userId === enrollment.userId,          );          return {            id: enrollment.userId,            email: enrollment.studentEmail,            fullName: enrollment.studentName,            educationLevel: enrollment.educationLevel,            classOrYear: enrollment.classOrYear,            institution: enrollment.institution,            status: existing?.status ?? "present",            remarks: existing?.remarks ?? "",            existingRecordId: existing?.id ?? null,          };        },      );      setStudents(enrolledStudents);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load students.",
      );
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, [courseId, attendanceDate]);

  function updateRow(
    studentId: string,
    changes: Partial<AttendanceRow>,
  ) {
    setStudents((current) =>
      current.map((student) =>
        student.id === studentId
          ? { ...student, ...changes }
          : student,
      ),
    );
  }

  async function saveAttendance() {
    if (!courseId || !attendanceDate) {
      setError("Please select a course and date.");
      return;
    }

    if (students.length === 0) {
      setError("There are no active students to mark.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const newRecords = students.filter(
        (student) => !student.existingRecordId,
      );

      const existingRecords = students.filter(
        (student) => student.existingRecordId,
      );

      if (newRecords.length > 0) {
        const response = await fetch(
          "/api/admin/attendance/bulk",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              courseId,
              attendanceDate,
              records: newRecords.map((student) => ({
                userId: student.id,
                status: student.status,
                remarks: student.remarks.trim() || null,
              })),
            }),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to save attendance.",
          );
        }
      }

      for (const student of existingRecords) {
        const response = await fetch(
          `/api/admin/attendance/${student.existingRecordId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status: student.status,
              remarks: student.remarks.trim() || null,
            }),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              `Unable to update attendance for ${student.email}.`,
          );
        }
      }

      setMessage("Attendance saved successfully.");
      await loadStudents();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save attendance.",
      );
    } finally {
      setSaving(false);
    }
  }

  const filteredStudents = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return students;
    }

    return students.filter((student) =>
      [
        student.fullName,
        student.email,
        student.classOrYear,
        student.institution,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query),
        ),
    );
  }, [students, search]);

  const counts = useMemo(
    () => ({
      present: students.filter(
        (student) => student.status === "present",
      ).length,
      absent: students.filter(
        (student) => student.status === "absent",
      ).length,
      late: students.filter(
        (student) => student.status === "late",
      ).length,
      excused: students.filter(
        (student) => student.status === "excused",
      ).length,
    }),
    [students],
  );

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-6 lg:px-10 xl:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#d4af37]">
            Attendance Management
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Mark Attendance
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-500 sm:text-base">
            Record and manage daily attendance for active students.
          </p>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
            {message}
          </div>
        )}

        <section className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 sm:p-8">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-300">
                Course
              </label>

              <select
                value={courseId}
                onChange={(event) =>
                  setCourseId(event.target.value)
                }
                disabled={loadingCourses}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]"
              >
                <option value="">
                  {loadingCourses
                    ? "Loading courses..."
                    : "Select a course"}
                </option>

                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-300">
                Attendance Date
              </label>

              <input
                type="date"
                value={attendanceDate}
                onChange={(event) =>
                  setAttendanceDate(event.target.value)
                }
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statuses.map((status) => (
            <div
              key={status.value}
              className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-5"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                {status.label}
              </p>

              <p className="mt-2 text-3xl font-bold">
                {counts[status.value]}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 sm:p-8">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold">
                Students
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                {students.length} active student
                {students.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search students..."
                className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#d4af37]"
              />

              <button
                type="button"
                onClick={saveAttendance}
                disabled={
                  saving ||
                  loadingStudents ||
                  students.length === 0
                }
                className="rounded-xl bg-[#d4af37] px-5 py-3 text-sm font-bold text-black transition hover:bg-[#e7c95c] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Attendance"}
              </button>
            </div>
          </div>

          {loadingStudents ? (
            <div className="rounded-xl border border-white/10 bg-black/40 p-10 text-center text-sm text-zinc-500">
              Loading students...
            </div>
          ) : !courseId ? (
            <div className="rounded-xl border border-dashed border-white/10 p-10 text-center text-sm text-zinc-500">
              Select a course to load students.
            </div>
          ) : students.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 p-10 text-center text-sm text-zinc-500">
              No active students found for this course.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="rounded-2xl border border-white/10 bg-black/40 p-5"
                >
                  <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr_1fr] xl:items-center">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">
                        {student.fullName ||
                          "Unnamed Student"}
                      </p>

                      <p className="mt-1 truncate text-sm text-zinc-500">
                        {student.email}
                      </p>

                      <p className="mt-2 text-xs text-zinc-600">
                        {[
                          student.classOrYear,
                          student.educationLevel,
                          student.institution,
                        ]
                          .filter(Boolean)
                          .join(" • ") ||
                          "Profile details unavailable"}
                      </p>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-zinc-600">
                        Status
                      </label>

                      <select
                        value={student.status}
                        onChange={(event) =>
                          updateRow(student.id, {
                            status:
                              event.target
                                .value as AttendanceStatus,
                          })
                        }
                        className="w-full rounded-xl border border-white/10 bg-[#0d0d0d] px-3 py-3 text-sm text-white outline-none focus:border-[#d4af37]"
                      >
                        {statuses.map((status) => (
                          <option
                            key={status.value}
                            value={status.value}
                          >
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-zinc-600">
                        Remarks
                      </label>

                      <input
                        type="text"
                        value={student.remarks}
                        onChange={(event) =>
                          updateRow(student.id, {
                            remarks: event.target.value,
                          })
                        }
                        maxLength={1000}
                        placeholder="Optional remarks"
                        className="w-full rounded-xl border border-white/10 bg-[#0d0d0d] px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#d4af37]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
