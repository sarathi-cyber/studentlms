import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/authorization";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export async function POST(request: Request) {
  const auth = await requireAdmin();

  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No image file was provided." },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid image type. Only JPG, PNG and WEBP images are allowed.",
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "Image is too large. Maximum allowed size is 5 MB.",
        },
        { status: 400 },
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: "The uploaded image is empty." },
        { status: 400 },
      );
    }

    const extension =
      file.type === "image/jpeg"
        ? "jpg"
        : file.type === "image/png"
          ? "png"
          : "webp";

    const blob = await put(
      `course-thumbnails/${crypto.randomUUID()}.${extension}`,
      file,
      {
        access: "public",
        addRandomSuffix: false,
      },
    );

    return NextResponse.json(
      {
        success: true,
        url: blob.url,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Thumbnail upload failed:", error);

    return NextResponse.json(
      { error: "Failed to upload thumbnail." },
      { status: 500 },
    );
  }
}
