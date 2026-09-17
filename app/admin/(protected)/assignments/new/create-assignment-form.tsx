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

export default function CreateAssignmentForm() {
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
    async function loadCourses() {
      try {
        const response = await fetch("/api/courses", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load courses.");
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) return;

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

    if (!Number.isInteger(marks) || marks <= 0) {
      setError("Maximum marks must be a positive whole number.");
      return;
    }

    if (isPublished) {
      const selectedCourse = courses.find(
        (course) => course.id === courseId,
      );

      if (selectedCourse && !selectedCourse.isPublished) {
        setError(
          "An assignment cannot be published for an unpublished course.",
        );
        return;
      }
    }

    try {
      setSubmitting(true);

      const response = await fetch("/api/admin/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          title: title.trim(),
          description: description.trim() || undefined,
          instructions: instructions.trim() || undefined,
          maxMarks: marks,
          dueAt: dueAt
            ? new Date(dueAt).toISOString()
            : null,
          isPublished,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to create assignment.",
        );
      }

      setSuccess("Assignment created successfully.");

      setTimeout(() => {
        router.push("/admin/assignments");
        router.refresh();
      }, 700);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create assignment.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/assignments"
            className="mb-5 inline-flex text-sm text-white/50 transition hover:text-[#d4af37]"
          >
            ← Back to Assignments
          </Link>

          <p className="mb-2 text-xs font-semibold tracking-[0.3em] text-[#d4af37]">
            ASSIGNMENT MANAGEMENT
          </p>

          <h1 className="text-3xl font-bold sm:text-4xl">
            Create Assignment
          </h1>

          <p className="mt-2 text-sm text-white/50">
            Create an assignment for one of your published courses.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-7"
        >
          {/* Course */}
          <div className="mb-6">
            <label
              htmlFor="course"
              className="mb-2 block text-sm font-medium text-white/80"
            >
              Course <span className="text-[#d4af37]">*</span>
            </label>

            <select
              id="course"
              value={courseId}
              onChange={(event) => setCourseId(event.target.value)}
              disabled={loadingCourses || submitting}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/60 disabled:opacity-50"
            >
              <option value="">
                {loadingCourses
                  ? "Loading courses..."
                  : "Select a course"}
              </option>

              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                  {!course.isPublished ? " — Draft" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="mb-6">
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-white/80"
            >
              Assignment Title{" "}
              <span className="text-[#d4af37]">*</span>
            </label>

            <input
              id="title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={200}
              disabled={submitting}
              placeholder="e.g. C Programming Assignment 2"
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#d4af37]/60 disabled:opacity-50"
            />

            <p className="mt-1 text-right text-xs text-white/30">
              {title.length}/200
            </p>
          </div>

          {/* Description */}
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
              disabled={submitting}
              placeholder="Briefly describe what students need to complete."
              className="w-full resize-y rounded-xl border border-white/10 bg-black px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/25 focus:border-[#d4af37]/60 disabled:opacity-50"
            />

            <p className="mt-1 text-right text-xs text-white/30">
              {description.length}/5000
            </p>
          </div>

          {/* Instructions */}
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
              disabled={submitting}
              placeholder="Provide detailed instructions, requirements, submission guidelines, etc."
              className="w-full resize-y rounded-xl border border-white/10 bg-black px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/25 focus:border-[#d4af37]/60 disabled:opacity-50"
            />

            <p className="mt-1 text-right text-xs text-white/30">
              {instructions.length}/10000
            </p>
          </div>

          {/* Marks + Due Date */}
          <div className="mb-6 grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="maxMarks"
                className="mb-2 block text-sm font-medium text-white/80"
              >
                Maximum Marks{" "}
                <span className="text-[#d4af37]">*</span>
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
                disabled={submitting}
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
                disabled={submitting}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/60 disabled:opacity-50"
              />

              <p className="mt-1 text-xs text-white/30">
                Leave empty for no deadline.
              </p>
            </div>
          </div>

          {/* Publish */}
          <div className="mb-8 rounded-xl border border-white/10 bg-black/40 p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(event) =>
                  setIsPublished(event.target.checked)
                }
                disabled={submitting}
                className="mt-1 h-4 w-4 accent-[#d4af37]"
              />

              <span>
                <span className="block text-sm font-medium">
                  Publish Assignment
                </span>

                <span className="mt-1 block text-xs leading-5 text-white/40">
                  Published assignments are visible to eligible
                  students. The selected course must also be
                  published.
                </span>
              </span>
            </label>
          </div>

          {/* Messages */}
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

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/admin/assignments"
              className="rounded-xl border border-white/10 px-6 py-3 text-center text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting || loadingCourses}
              className="rounded-xl bg-[#d4af37] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#e3c354] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Creating Assignment..."
                : "Create Assignment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
