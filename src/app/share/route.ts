// WHY: Handle shared content from other apps (photos, text, URLs)
// WHAT: Web Share Target API handler for receiving shared data
// HOW: Next.js API route processes multipart form data from share intent
// GOTCHA: Only works when app is installed as PWA

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      // Redirect to login with return URL
      return NextResponse.redirect(
        new URL(`/auth/signin?callbackUrl=/share`, request.url)
      );
    }

    const formData = await request.formData();
    const title = formData.get("title") as string | null;
    const text = formData.get("text") as string | null;
    const url = formData.get("url") as string | null;
    const media = formData.getAll("media") as File[];

    // Store shared data in session or temporary storage
    // For now, redirect to a page that can process it
    const params = new URLSearchParams();
    if (title) params.set("title", title);
    if (text) params.set("text", text);
    if (url) params.set("url", url);
    if (media.length > 0) params.set("hasMedia", "true");

    // Redirect to share handler page
    return NextResponse.redirect(
      new URL(`/share/process?${params.toString()}`, request.url)
    );
  } catch (error) {
    console.error("Share target error:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export async function GET(request: NextRequest) {
  // Handle share intent when opened directly
  return NextResponse.redirect(new URL("/", request.url));
}
