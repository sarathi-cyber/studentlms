"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type Level = "beginner" | "intermediate" | "advanced";

export default function CreateCourseForm() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [level, setLevel] = useState<Level>("beginner");
  const [durationMinutes, setDurationMinutes] = useState("0");
  const [isPublished, setIsPublished] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 120);
  }

  function handleTitleChange(value: string) {
    setTitle(value);

    // Automatically generate slug while the user is creating the title.
    setSlug(generateSlug(value));
  }

  function validate() {
    const errors: Record<string, string> = {};

    const cleanTitle = title.trim();
    const cleanSlug = slug.trim();
    const duration = Number(durationMinutes);

    if (cleanTitle.length < 3) {
      errors.title = "Course title must be at least 3 characters.";
    }

    if (cleanTitle.length > 200) {
      errors.title = "Course title must not exceed 200 characters.";
    }

    if (
      cleanSlug.length < 3 ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanSlug)
    ) {
      errors.slug =
        "Use lowercase letters, numbers and hyphens only.";
    }

    if (description.trim().length > 5000) {
      errors.description =
        "Description must not exceed 5000 characters.";
    }

    if (thumbnailUrl.trim()) {
      try {
        new URL(thumbnailUrl.trim());
      } catch {
        errors.thumbnailUrl = "Enter a valid thumbnail URL.";
      }
    }

    if (!Number.isInteger(duration) || duration < 0) {
      errors.durationMinutes =
        "Duration must be a whole number of minutes.";
    }

    if (duration > 100000) {
      errors.durationMinutes =
        "Duration exceeds the maximum allowed value.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          description: description.trim() || null,
          thumbnailUrl: thumbnailUrl.trim() || null,
          level,
          durationMinutes: Number(durationMinutes),
          isPublished,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details && typeof data.details === "object") {
          setFieldErrors(data.details);
        }

        throw new Error(
          data.error || "Failed to create course.",
        );
      }

      window.location.href = `/admin/courses/${data.course.id}`;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create course.",
      );
      setLoading(false);
    }
  }

  return (
    <div className="techvora-page min-h-screen">
      <div className="techvora-content min-h-screen">
        {/* Header */}
        <header className="border-b border-[#242424] bg-[#0b0b0b]/90 backdrop-blur-xl">
          <div className="flex min-h-20 items-center justify-between gap-4 px-6 lg:px-10">
            <div className="pl-14 lg:pl-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#d4af37]">
                Administration
              </p>

              <h1 className="mt-1 text-xl font-bold text-white">
                Create Course
              </h1>
            </div>

            <Link
              href="/admin/courses"
              className="rounded-xl border border-[#242424] bg-[#101010] px-4 py-2 text-xs font-medium text-zinc-400 transition hover:border-[#d4af37]/40 hover:text-[#d4af37]"
            >
              ← Courses
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-6 py-8 lg:px-10">
          {/* Intro */}
          <section className="mb-8">
            <p className="text-sm text-zinc-600">
              Add a new learning experience to Techvora Academy.
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
              Course Details
            </h2>
          </section>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Basic Information */}
              <section className="rounded-2xl border border-[#242424] bg-[#0b0b0b] p-6 lg:p-8">
                <div className="mb-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#d4af37]">
                    01
                  </p>

                  <h3 className="mt-1 text-lg font-bold text-white">
                    Basic Information
                  </h3>

                  <p className="mt-1 text-sm text-zinc-600">
                    Define the public identity of the course.
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="title"
                      className="mb-2 block text-sm font-medium text-zinc-300"
                    >
                      Course Title
                    </label>

                    <input
                      id="title"
                      value={title}
                      onChange={(event) =>
                        handleTitleChange(event.target.value)
                      }
                      placeholder="e.g. C Programming Masterclass"
                      maxLength={200}
                      className="techvora-input w-full rounded-xl px-4 py-3 text-sm"
                      disabled={loading}
                    />

                    {fieldErrors.title && (
                      <p className="mt-2 text-xs text-red-400">
                        {fieldErrors.title}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="slug"
                      className="mb-2 block text-sm font-medium text-zinc-300"
                    >
                      URL Slug
                    </label>

                    <div className="flex items-center rounded-xl border border-[#242424] bg-[#101010]">
                      <span className="pl-4 text-sm text-zinc-700">
                        /courses/
                      </span>

                      <input
                        id="slug"
                        value={slug}
                        onChange={(event) =>
                          setSlug(generateSlug(event.target.value))
                        }
                        placeholder="c-programming-masterclass"
                        maxLength={120}
                        className="w-full bg-transparent px-2 py-3 text-sm text-white outline-none"
                        disabled={loading}
                      />
                    </div>

                    {fieldErrors.slug && (
                      <p className="mt-2 text-xs text-red-400">
                        {fieldErrors.slug}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="mb-2 block text-sm font-medium text-zinc-300"
                    >
                      Description
                    </label>

                    <textarea
                      id="description"
                      value={description}
                      onChange={(event) =>
                        setDescription(event.target.value)
                      }
                      placeholder="Describe what students will learn in this course..."
                      maxLength={5000}
                      rows={6}
                      className="techvora-input w-full resize-y rounded-xl px-4 py-3 text-sm"
                      disabled={loading}
                    />

                    <div className="mt-2 flex justify-between text-[11px] text-zinc-700">
                      <span>Maximum 5000 characters</span>
                      <span>{description.length}/5000</span>
                    </div>

                    {fieldErrors.description && (
                      <p className="mt-2 text-xs text-red-400">
                        {fieldErrors.description}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="thumbnailUrl"
                      className="mb-2 block text-sm font-medium text-zinc-300"
                    >
                      Thumbnail URL
                    </label>

                    <input
                      id="thumbnailUrl"
                      type="url"
                      value={thumbnailUrl}
                      onChange={(event) =>
                        setThumbnailUrl(event.target.value)
                      }
                      placeholder="https://example.com/course-thumbnail.jpg"
                      maxLength={2048}
                      className="techvora-input w-full rounded-xl px-4 py-3 text-sm"
                      disabled={loading}
                    />

                    {fieldErrors.thumbnailUrl && (
                      <p className="mt-2 text-xs text-red-400">
                        {fieldErrors.thumbnailUrl}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Course Configuration */}
              <section className="rounded-2xl border border-[#242424] bg-[#0b0b0b] p-6 lg:p-8">
                <div className="mb-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#d4af37]">
                    02
                  </p>

                  <h3 className="mt-1 text-lg font-bold text-white">
                    Course Configuration
                  </h3>

                  <p className="mt-1 text-sm text-zinc-600">
                    Configure the level, estimated duration and visibility.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="level"
                      className="mb-2 block text-sm font-medium text-zinc-300"
                    >
                      Difficulty Level
                    </label>

                    <select
                      id="level"
                      value={level}
                      onChange={(event) =>
                        setLevel(event.target.value as Level)
                      }
                      className="techvora-input w-full rounded-xl px-4 py-3 text-sm"
                      disabled={loading}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">
                        Intermediate
                      </option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="durationMinutes"
                      className="mb-2 block text-sm font-medium text-zinc-300"
                    >
                      Duration
                    </label>

                    <div className="flex items-center rounded-xl border border-[#242424] bg-[#101010]">
                      <input
                        id="durationMinutes"
                        type="number"
                        min="0"
                        max="100000"
                        step="1"
                        value={durationMinutes}
                        onChange={(event) =>
                          setDurationMinutes(event.target.value)
                        }
                        className="w-full bg-transparent px-4 py-3 text-sm text-white outline-none"
                        disabled={loading}
                      />

                      <span className="pr-4 text-xs text-zinc-700">
                        minutes
                      </span>
                    </div>

                    {fieldErrors.durationMinutes && (
                      <p className="mt-2 text-xs text-red-400">
                        {fieldErrors.durationMinutes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Publish */}
                <div className="mt-6 rounded-xl border border-[#242424] bg-[#101010] p-5">
                  <div className="flex items-start gap-4">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isPublished}
                      onClick={() =>
                        setIsPublished((current) => !current)
                      }
                      disabled={loading}
                      className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${
                        isPublished
                          ? "bg-[#d4af37]"
                          : "bg-zinc-800"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full transition ${
                          isPublished
                            ? "left-6 bg-black"
                            : "left-1 bg-zinc-500"
                        }`}
                      />
                    </button>

                    <div>
                      <p className="text-sm font-semibold text-white">
                        Publish course immediately
                      </p>

                      <p className="mt-1 text-xs leading-5 text-zinc-600">
                        {isPublished
                          ? "The course will be visible through the student-facing course catalogue."
                          : "The course will be saved as a draft and remain hidden from students."}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Actions */}
              <section className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Link
                  href="/admin/courses"
                  className="rounded-xl border border-[#242424] bg-[#101010] px-6 py-3 text-center text-sm font-semibold text-zinc-400 transition hover:border-[#d4af37]/30 hover:text-white"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={loading}
                  className="techvora-button rounded-xl px-7 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                      Creating...
                    </span>
                  ) : (
                    "Create Course"
                  )}
                </button>
              </section>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
