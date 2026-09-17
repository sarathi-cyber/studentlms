"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Profile = {
  fullName: string | null;
  email: string;
  dateOfBirth: string | null;
  educationLevel: string | null;
  classOrYear: string | null;
  institution: string | null;
  schoolOrCollege: string | null;
  phone: string | null;
  country: string | null;
  parentGuardianName: string | null;
  parentGuardianContact: string | null;
  parentConsent: boolean;
  profileCompleted: boolean;
};

type Enrollment = {
  id: string;
  courseId: string;
  status: "pending" | "active" | "completed" | "expired" | "cancelled";
  enrolledAt: string;
  approvedAt: string | null;
  completedAt: string | null;
  expiredAt: string | null;
  cancelledAt: string | null;
};

type Props = {
  courseId: string;
  courseTitle: string;
};

export default function EnrollmentForm({
  courseId,
  courseTitle,
}: Props) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [existingEnrollment, setExistingEnrollment] =
    useState<Enrollment | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [consent, setConsent] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [profileResponse, enrollmentResponse] = await Promise.all([
          fetch("/api/profile", {
            credentials: "include",
            cache: "no-store",
          }),
          fetch("/api/enrollments", {
            credentials: "include",
            cache: "no-store",
          }),
        ]);

        const profileData = await profileResponse.json();
        const enrollmentData = await enrollmentResponse.json();

        if (!profileResponse.ok) {
          throw new Error(
            profileData.error || "Unable to load profile",
          );
        }

        if (!enrollmentResponse.ok) {
          throw new Error(
            enrollmentData.error || "Unable to load enrollments",
          );
        }

        setProfile(profileData.profile);
        setConsent(Boolean(profileData.profile.parentConsent));

        const enrollment = enrollmentData.enrollments?.find(
          (item: Enrollment) => item.courseId === courseId,
        );

        setExistingEnrollment(enrollment ?? null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load enrollment information",
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [courseId]);

  async function handleEnroll() {
    if (!profile) return;

    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          courseId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === "ALREADY_ENROLLED" && data.enrollment) {
          setExistingEnrollment(data.enrollment);
          return;
        }

        throw new Error(
          data.error || "Enrollment failed",
        );
      }

      setExistingEnrollment(data.enrollment);
      setMessage(
        "Your enrollment request has been submitted. It is now waiting for admin approval.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit enrollment",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <p className="text-zinc-400">
          Checking your enrollment status...
        </p>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="rounded-2xl border border-red-900 bg-red-950/20 p-6">
        <h3 className="text-lg font-semibold text-red-300">
          Unable to load enrollment
        </h3>

        <p className="mt-2 text-sm text-zinc-400">
          {error}
        </p>
      </div>
    );
  }

  /*
   * Existing enrollment status takes priority.
   * The student should not see the enrollment form again.
   */
  if (existingEnrollment) {
    return (
      <EnrollmentStatus
        enrollment={existingEnrollment}
        courseTitle={courseTitle}
      />
    );
  }

  if (!profile) {
    return null;
  }

  if (!profile.profileCompleted) {
    return (
      <div className="rounded-2xl border border-yellow-800 bg-yellow-950/20 p-6">
        <h3 className="text-xl font-semibold text-yellow-300">
          Complete Your Profile
        </h3>

        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Your student profile must be completed before you can
          request enrollment for {courseTitle}.
        </p>

        <Link
          href="/student/profile"
          className="mt-5 inline-flex rounded-lg bg-[#d4af37] px-5 py-3 font-semibold text-black transition hover:bg-[#e5c65c]"
        >
          Complete Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.2em] text-[#d4af37]">
          Enrollment
        </p>

        <h3 className="mt-2 text-2xl font-semibold">
          Review Your Information
        </h3>

        <p className="mt-2 text-sm text-zinc-400">
          The information below comes directly from your student
          profile.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InfoField label="Full Name" value={profile.fullName} />
        <InfoField label="Email ID" value={profile.email} />
        <InfoField
          label="Date of Birth"
          value={profile.dateOfBirth}
        />
        <InfoField
          label="Currently Studying"
          value={profile.educationLevel}
        />
        <InfoField
          label="Class / Year"
          value={profile.classOrYear}
        />
        <InfoField
          label="School / College"
          value={profile.schoolOrCollege}
        />
        <InfoField
          label="Institution"
          value={profile.institution}
        />
        <InfoField label="Phone Number" value={profile.phone} />
        <InfoField label="Country" value={profile.country} />
        <InfoField
          label="Parent / Guardian"
          value={profile.parentGuardianName}
        />
        <InfoField
          label="Parent / Guardian Contact"
          value={profile.parentGuardianContact}
        />
      </div>

      <div className="mt-6 rounded-xl border border-zinc-800 bg-black p-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) =>
              setConsent(event.target.checked)
            }
            className="mt-1 h-4 w-4 accent-[#d4af37]"
          />

          <span className="text-sm leading-6 text-zinc-300">
            I confirm that the information in my profile is correct
            and that my parent/guardian has provided consent for me
            to participate in this course.
          </span>
        </label>
      </div>

      {message && (
        <div className="mt-5 rounded-xl border border-emerald-800 bg-emerald-950/20 p-4 text-sm text-emerald-300">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-xl border border-red-900 bg-red-950/20 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/student/profile"
          className="text-sm text-zinc-400 underline underline-offset-4 hover:text-[#d4af37]"
        >
          Edit Profile
        </Link>

        <button
          type="button"
          onClick={handleEnroll}
          disabled={submitting || !consent}
          className="rounded-lg bg-[#d4af37] px-6 py-3 font-semibold text-black transition hover:bg-[#e5c65c] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting
            ? "Submitting..."
            : "Request Enrollment"}
        </button>
      </div>

      {!consent && (
        <p className="mt-3 text-right text-xs text-zinc-500">
          Please confirm the consent checkbox to continue.
        </p>
      )}
    </div>
  );
}

function EnrollmentStatus({
  enrollment,
  courseTitle,
}: {
  enrollment: Enrollment;
  courseTitle: string;
}) {
  const status = enrollment.status;

  const statusContent = {
    pending: {
      title: "Enrollment Pending",
      description:
        "Your enrollment request has been submitted and is waiting for admin approval.",
      badge: "PENDING",
    },
    active: {
      title: "You're Enrolled",
      description:
        "Your enrollment has been approved. You can now access this course.",
      badge: "ACTIVE",
    },
    completed: {
      title: "Course Completed",
      description:
        "Congratulations! You have successfully completed this course.",
      badge: "COMPLETED",
    },
    expired: {
      title: "Course Expired",
      description:
        "The course enrollment period has ended before completion.",
      badge: "EXPIRED",
    },
    cancelled: {
      title: "Enrollment Cancelled",
      description:
        "This enrollment has been cancelled and is no longer active.",
      badge: "CANCELLED",
    },
  }[status];

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[#d4af37]">
            Enrollment Status
          </p>

          <h3 className="mt-2 text-2xl font-semibold">
            {statusContent.title}
          </h3>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            {statusContent.description}
          </p>
        </div>

        <span
          className={`inline-flex w-fit rounded-full px-4 py-2 text-xs font-bold tracking-wider ${
            status === "pending"
              ? "bg-yellow-500/10 text-yellow-300 ring-1 ring-yellow-700/40"
              : status === "active"
                ? "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-700/40"
                : status === "completed"
                  ? "bg-[#d4af37]/10 text-[#d4af37] ring-1 ring-[#d4af37]/40"
                  : status === "expired"
                    ? "bg-orange-500/10 text-orange-300 ring-1 ring-orange-700/40"
                    : "bg-red-500/10 text-red-300 ring-1 ring-red-700/40"
          }`}
        >
          {statusContent.badge}
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <InfoField
          label="Course"
          value={courseTitle}
        />

        <InfoField
          label="Requested On"
          value={formatDate(enrollment.enrolledAt)}
        />

        {enrollment.approvedAt && (
          <InfoField
            label="Approved On"
            value={formatDate(enrollment.approvedAt)}
          />
        )}

        {enrollment.completedAt && (
          <InfoField
            label="Completed On"
            value={formatDate(enrollment.completedAt)}
          />
        )}

        {enrollment.expiredAt && (
          <InfoField
            label="Expired On"
            value={formatDate(enrollment.expiredAt)}
          />
        )}

        {enrollment.cancelledAt && (
          <InfoField
            label="Cancelled On"
            value={formatDate(enrollment.cancelledAt)}
          />
        )}
      </div>

      {status === "pending" && (
        <div className="mt-6 rounded-xl border border-yellow-900/60 bg-yellow-950/20 p-4">
          <p className="text-sm text-yellow-200">
            Your request is currently under review. You do not
            need to submit another enrollment request.
          </p>
        </div>
      )}


    </div>
  );
}

function InfoField({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-black p-4">
      <p className="text-xs uppercase tracking-wider text-zinc-600">
        {label}
      </p>

      <p className="mt-1 break-words text-sm text-zinc-200">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
