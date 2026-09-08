import { NextResponse } from "next/server";

import { clearSession } from "@/lib/auth/session";

export async function POST() {
  try {
    await clearSession();

    return NextResponse.json({
      message: "Logout successful.",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return NextResponse.json(
      {
        error: "Unable to log out.",
      },
      { status: 500 },
    );
  }
}