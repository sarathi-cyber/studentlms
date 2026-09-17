"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Course = {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
};

type Assignment = {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  instructions: string | null;
  maxMarks: number;
  dueAt: string | null;
  isPublished: boolean;
  courseTitle?: string | null;
  coursePublished?: boolean;
};

function toDateTimeLocal(value: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);

  return localDate.toISOString().slice(0, 16);
}

export default function EditAssignmentForm({
  assignmentId,
}: {
  assignmentId: string;
}) {
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [maxMarks, setMaxMarks] = useState("100");
  const [dueAt, setDueAt] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [assignmentResponse, coursesResponse] =
          await Promise.all([
            fetch(`/api/admin/assignments/${assignmentId}`, {
              cache: "no-store",
            }),
            fetch("/api/courses", {
              cache: "no-store",
            }),
          ]);

        const assignmentData =
          await assignmentResponse.json();

        const coursesData =
          await coursesResponse.json();

        if (!assignmentResponse.ok) {
          throw new Error(
            assignmentData.error ||
              "Unable to load assignment.",
          );
        }

        if (!coursesResponse.ok) {
          throw new Error(
            coursesData.error ||
              "Unable to load courses.",
          );
        }

        const assignment: Assignment =
          assignmentData.assignment;

        const loadedCourses: Course[] =
          coursesData.courses ?? [];

        if (
          assignment.courseId &&
          assignment.courseTitle &&
          !loadedCourses.some(
            (course) =>
              course.id === assignment.courseId,
          )
        ) {
          loadedCourses.push({
            id: assignment.courseId,
            title: assignment.courseTitle,
            slug: "",
            isPublished:
              assignment.coursePublished ?? false,
          });
        }

        setCourses(loadedCourses);

        setCourseId(assignment.courseId);
        setTitle(assignment.title);
        setDescription(
          assignment.description ?? "",
        );
        setInstructions(
          assignment.instructions ?? "",
        );
        setMaxMarks(
          String(assignment.maxMarks),
        );
        setDueAt(
          toDateTimeLocal(assignment.dueAt),
        );
        setIsPublished(
          assignment.isPublished,
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load assignment.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [assignmentId]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (saving) return;

    setError("");
    setSuccess("");

    if (!courseId) {
      setError("Please select a course.");
      return;
    }

    if (!title.trim()) {
      setError("Assignment title is required.");
      return;
    }

    const marks = Number(maxMarks);

    if (
      !Number.isInteger(marks) ||
      marks <= 0
    ) {
      setError(
        "Maximum marks must be a positive whole number.",
      );
      return;
    }

    const selectedCourse = courses.find(
      (course) => course.id === courseId,
    );

    if (
      isPublished &&
      selectedCourse &&
      !selectedCourse.isPublished
    ) {
      setError(
        "A published assignment requires a published course.",
      );
      return;
    }

    let dueAtValue: string | null = null;

    if (dueAt) {
      const parsedDueAt = new Date(dueAt);

      if (Number.isNaN(parsedDueAt.getTime())) {
        setError("Please enter a valid due date.");
        return;
      }

      dueAtValue = parsedDueAt.toISOString();
    }

    try {
      setSaving(true);

      const response = await fetch(
        `/api/admin/assignments/${assignmentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            courseId,
            title: title.trim(),
            description:
              description.trim() || null,
            instructions:
              instructions.trim() || null,
            maxMarks: marks,
            dueAt: dueAtValue,
            isPublished,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to update assignment.",
        );
      }

      setSuccess(
        "Assignment updated successfully.",
      );

      setTimeout(() => {
        router.push(
          `/admin/assignments/${assignmentId}`,
        );
        router.refresh();
      }, 600);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update assignment.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black px-4 py-12 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#d4af37]" />

          <p className="text-sm text-white/50">
            Loading assignment...
          </p>
        </div>
      </div>
    );
  }

  if (error && !title) {
    return (
      <div className="min-h-screen bg-black px-4 py-12 text-white">
        <div className="mx-auto max-w-4xl">
          <Link
            href={`/admin/assignments/${assignmentId}`}
            className="text-sm text-white/50 hover:text-[#d4af37]"
          >
            ← Back to Assignment
          </Link>

          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href={`/admin/assignments/${assignmentId}`}
          className="mb-5 inline-flex text-sm text-white/50 transition hover:text-[#d4af37]"
        >
          ← Back to Assignment
        </Link>

        <p className="mb-2 text-xs font-semibold tracking-[0.3em] text-[#d4af37]">
          ASSIGNMENT MANAGEMENT
        </p>

        <h1 className="text-3xl font-bold sm:text-4xl">
          Edit Assignment
        </h1>

        <p className="mt-2 text-sm text-white/50">
          Update assignment content, marks, deadline,
          and publication status.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-7"
        >
          <div className="mb-6">
            <label
              htmlFor="courseId"
              className="mb-2 block text-sm font-medium text-white/80"
            >
              Course
            </label>

            <select
              id="courseId"
              value={courseId}
              onChange={(event) =>
                setCourseId(event.target.value)
              }
              disabled={saving}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/60 disabled:opacity-50"
            >
              {courses.map((course) => (
                <option
                  key={course.id}
                  value={course.id}
                >
                  {course.title}
                  {!course.isPublished
                    ? " — Draft"
                    : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-white/80"
            >
              Assignment Title
            </label>

            <input
              id="title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              maxLength={200}
              disabled={saving}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/60 disabled:opacity-50"
            />

            <p className="mt-1 text-right text-xs text-white/30">
              {title.length}/200
            </p>
          </div>

          <div className="mb-6">
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-white/80"
            >
              Description
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              maxLength={5000}
              rows={4}
              disabled={saving}
              className="w-full resize-y rounded-xl border border-white/10 bg-black px-4 py-3 text-sm leading-6 text-white outline-none focus:border-[#d4af37]/60 disabled:opacity-50"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="instructions"
              className="mb-2 block text-sm font-medium text-white/80"
            >
              Instructions
            </label>

            <textarea
              id="instructions"
              value={instructions}
              onChange={(event) =>
                setInstructions(event.target.value)
              }
              maxLength={10000}
              rows={7}
              disabled={saving}
              className="w-full resize-y rounded-xl border border-white/10 bg-black px-4 py-3 text-sm leading-6 text-white outline-none focus:border-[#d4af37]/60 disabled:opacity-50"
            />
          </div>

          <div className="mb-6 grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="maxMarks"
                className="mb-2 block text-sm font-medium text-white/80"
              >
                Maximum Marks
              </label>

              <input
                id="maxMarks"
                type="number"
                min="1"
                step="1"
                value={maxMarks}
                onChange={(event) =>
                  setMaxMarks(event.target.value)
                }
                disabled={saving}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/60 disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="dueAt"
                className="mb-2 block text-sm font-medium text-white/80"
              >
                Due Date & Time
              </label>

              <input
                id="dueAt"
                type="datetime-local"
                value={dueAt}
                onChange={(event) =>
                  setDueAt(event.target.value)
                }
                disabled={saving}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/60 disabled:opacity-50"
              />

              <p className="mt-1 text-xs text-white/30">
                Clear the field for no deadline.
              </p>
            </div>
          </div>

          <div className="mb-8 rounded-xl border border-white/10 bg-black/40 p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(event) =>
                  setIsPublished(event.target.checked)
                }
                disabled={saving}
                className="mt-1 h-4 w-4 accent-[#d4af37]"
              />

              <span>
                <span className="block text-sm font-medium">
                  Published
                </span>

                <span className="mt-1 block text-xs leading-5 text-white/40">
                  Published assignments are available
                  to eligible students.
                </span>
              </span>
            </label>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              {success}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href={`/admin/assignments/${assignmentId}`}
              className="rounded-xl border border-white/10 px-6 py-3 text-center text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#d4af37] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#e3c354] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving Changes..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
