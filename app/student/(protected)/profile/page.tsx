"use client";

import { FormEvent, useEffect, useState } from "react";

type Profile = {
  id: string;
  userId: string;
  email: string;
  fullName: string | null;
  profileImage: string | null;
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

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/profile", {
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load profile");
        }

        setProfile(data.profile);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load profile",
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile) return;

    setSaving(true);
    setMessage("");
    setError("");

    const formData = new FormData(event.currentTarget);

    const payload = {
      fullName: String(formData.get("fullName") || ""),
      dateOfBirth: String(formData.get("dateOfBirth") || "") || null,
      educationLevel: String(formData.get("educationLevel") || ""),
      classOrYear: String(formData.get("classOrYear") || ""),
      institution: String(formData.get("institution") || ""),
      schoolOrCollege: String(formData.get("schoolOrCollege") || ""),
      phone: String(formData.get("phone") || ""),
      country: String(formData.get("country") || ""),
      parentGuardianName: String(
        formData.get("parentGuardianName") || "",
      ),
      parentGuardianContact: String(
        formData.get("parentGuardianContact") || "",
      ),
      parentConsent: formData.get("parentConsent") === "on",
    };

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update profile");
      }

      setProfile(data.profile);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update profile",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-6 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="text-zinc-400">Loading profile...</p>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-black p-6 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-red-900 bg-red-950/30 p-6">
            <h1 className="text-xl font-semibold">Unable to load profile</h1>
            <p className="mt-2 text-red-300">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.25em] text-[#d4af37]">
            Student Account
          </p>

          <h1 className="mt-2 text-3xl font-bold">My Profile</h1>

          <p className="mt-2 text-zinc-400">
            Keep your personal, academic, and parent/guardian information
            updated. This information will be used automatically during course
            enrollment.
          </p>
        </div>

        <div
          className={`mb-6 rounded-xl border p-4 ${
            profile.profileCompleted
              ? "border-emerald-800 bg-emerald-950/30"
              : "border-yellow-800 bg-yellow-950/20"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">
                {profile.profileCompleted
                  ? "Profile Complete"
                  : "Profile Incomplete"}
              </p>

              <p className="mt-1 text-sm text-zinc-400">
                {profile.profileCompleted
                  ? "Your profile is ready for course enrollment."
                  : "Complete all required information before enrolling in courses."}
              </p>
            </div>

            <div
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                profile.profileCompleted
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-yellow-500/20 text-yellow-300"
              }`}
            >
              {profile.profileCompleted ? "COMPLETE" : "INCOMPLETE"}
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-emerald-800 bg-emerald-950/30 p-4 text-emerald-300">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-900 bg-red-950/30 p-4 text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="mb-5 text-xl font-semibold">Personal Information</h2>

            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Full Name"
                name="fullName"
                defaultValue={profile.fullName || ""}
                required
              />

              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  Email ID
                </label>

                <input
                  value={profile.email}
                  disabled
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-zinc-500 outline-none"
                />

                <p className="mt-1 text-xs text-zinc-600">
                  Email is linked to your account and cannot be changed here.
                </p>
              </div>

              <Field
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                defaultValue={profile.dateOfBirth || ""}
                required
              />

              <Field
                label="Phone Number"
                name="phone"
                defaultValue={profile.phone || ""}
                required
              />

              <Field
                label="Country"
                name="country"
                defaultValue={profile.country || ""}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="mb-5 text-xl font-semibold">
              Academic Information
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Currently Studying"
                name="educationLevel"
                placeholder="School / College / University"
                defaultValue={profile.educationLevel || ""}
                required
              />

              <Field
                label="Class / Year"
                name="classOrYear"
                placeholder="Example: Class 12 / 2nd Year"
                defaultValue={profile.classOrYear || ""}
                required
              />

              <Field
                label="Institution"
                name="institution"
                placeholder="Institution name"
                defaultValue={profile.institution || ""}
              />

              <Field
                label="School / College"
                name="schoolOrCollege"
                placeholder="School or college name"
                defaultValue={profile.schoolOrCollege || ""}
                required
              />
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="mb-5 text-xl font-semibold">
              Parent / Guardian Information
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Parent / Guardian Name"
                name="parentGuardianName"
                defaultValue={profile.parentGuardianName || ""}
                required
              />

              <Field
                label="Parent / Guardian Contact"
                name="parentGuardianContact"
                defaultValue={profile.parentGuardianContact || ""}
                required
              />
            </div>

            <label className="mt-6 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                name="parentConsent"
                defaultChecked={profile.parentConsent}
                className="mt-1 h-4 w-4 accent-[#d4af37]"
              />

              <span className="text-sm text-zinc-300">
                I confirm that my parent/guardian has given consent for me to
                participate in Techvora Academy courses.
              </span>
            </label>
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#d4af37] px-6 py-3 font-semibold text-black transition hover:bg-[#e5c65c] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  defaultValue,
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-zinc-300">
        {label}
        {required && <span className="ml-1 text-[#d4af37]">*</span>}
      </label>

      <input
        type={type}
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        className="w-full rounded-lg border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-700 focus:border-[#d4af37]"
      />
    </div>
  );
}
