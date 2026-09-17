import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { profiles, users } from "@/lib/db/schema";
import { updateProfileSchema } from "@/lib/validation/profile";

function calculateProfileCompleted(profile: {
  fullName: string | null;
  dateOfBirth: string | null;
  educationLevel: string | null;
  classOrYear: string | null;
  schoolOrCollege: string | null;
  phone: string | null;
  parentGuardianName: string | null;
  parentGuardianContact: string | null;
  parentConsent: boolean;
}) {
  return Boolean(
    profile.fullName?.trim() &&
      profile.dateOfBirth &&
      profile.educationLevel?.trim() &&
      profile.classOrYear?.trim() &&
      profile.schoolOrCollege?.trim() &&
      profile.phone?.trim() &&
      profile.parentGuardianName?.trim() &&
      profile.parentGuardianContact?.trim() &&
      profile.parentConsent,
  );
}

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  if (user.role !== "student") {
    return NextResponse.json(
      { error: "Student access required" },
      { status: 403 },
    );
  }

  let profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, user.id),
  });

  if (!profile) {
    const [created] = await db
      .insert(profiles)
      .values({
        userId: user.id,
        profileCompleted: false,
      })
      .returning();

    profile = created;
  }

  return NextResponse.json({
    profile: {
      id: profile.id,
      userId: profile.userId,
      email: user.email,
      fullName: profile.fullName,
      profileImage: profile.profileImage,
      dateOfBirth: profile.dateOfBirth,
      educationLevel: profile.educationLevel,
      classOrYear: profile.classOrYear,
      institution: profile.institution,
      schoolOrCollege: profile.schoolOrCollege,
      phone: profile.phone,
      country: profile.country,
      parentGuardianName: profile.parentGuardianName,
      parentGuardianContact: profile.parentGuardianContact,
      parentConsent: profile.parentConsent,
      profileCompleted: profile.profileCompleted,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    },
  });
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  if (user.role !== "student") {
    return NextResponse.json(
      { error: "Student access required" },
      { status: 403 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const result = updateProfileSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: result.error.flatten(),
      },
      { status: 400 },
    );
  }

  const existing = await db.query.profiles.findFirst({
    where: eq(profiles.userId, user.id),
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Student profile not found" },
      { status: 404 },
    );
  }

  const data = result.data;

  const merged = {
    fullName:
      data.fullName !== undefined ? data.fullName : existing.fullName,

    dateOfBirth:
      data.dateOfBirth !== undefined
        ? data.dateOfBirth
        : existing.dateOfBirth,

    educationLevel:
      data.educationLevel !== undefined
        ? data.educationLevel
        : existing.educationLevel,

    classOrYear:
      data.classOrYear !== undefined
        ? data.classOrYear
        : existing.classOrYear,

    institution:
      data.institution !== undefined
        ? data.institution
        : existing.institution,

    schoolOrCollege:
      data.schoolOrCollege !== undefined
        ? data.schoolOrCollege
        : existing.schoolOrCollege,

    phone:
      data.phone !== undefined ? data.phone : existing.phone,

    country:
      data.country !== undefined ? data.country : existing.country,

    parentGuardianName:
      data.parentGuardianName !== undefined
        ? data.parentGuardianName
        : existing.parentGuardianName,

    parentGuardianContact:
      data.parentGuardianContact !== undefined
        ? data.parentGuardianContact
        : existing.parentGuardianContact,

    parentConsent:
      data.parentConsent !== undefined
        ? data.parentConsent
        : existing.parentConsent,
  };

  const profileCompleted = calculateProfileCompleted(merged);

  const [updated] = await db
    .update(profiles)
    .set({
      fullName: merged.fullName,
      dateOfBirth: merged.dateOfBirth,
      educationLevel: merged.educationLevel,
      classOrYear: merged.classOrYear,
      institution: merged.institution,
      schoolOrCollege: merged.schoolOrCollege,
      phone: merged.phone,
      country: merged.country,
      parentGuardianName: merged.parentGuardianName,
      parentGuardianContact: merged.parentGuardianContact,
      parentConsent: merged.parentConsent,
      profileCompleted,
      updatedAt: new Date(),
    })
    .where(eq(profiles.userId, user.id))
    .returning();

  return NextResponse.json({
    message: "Profile updated successfully",
    profile: {
      id: updated.id,
      userId: updated.userId,
      email: user.email,
      fullName: updated.fullName,
      profileImage: updated.profileImage,
      dateOfBirth: updated.dateOfBirth,
      educationLevel: updated.educationLevel,
      classOrYear: updated.classOrYear,
      institution: updated.institution,
      schoolOrCollege: updated.schoolOrCollege,
      phone: updated.phone,
      country: updated.country,
      parentGuardianName: updated.parentGuardianName,
      parentGuardianContact: updated.parentGuardianContact,
      parentConsent: updated.parentConsent,
      profileCompleted: updated.profileCompleted,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    },
  });
}
