// middleware.ts
import { NextResponse } from "next/server";

export function proxy(req) {
  const url = req.nextUrl.clone();
  const token = req.cookies.get("access_token")?.value;

  const path = url.pathname;

  if (path === "/") {
    return NextResponse.next();
  }

  if (!token) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  try {
    // 🔐 Decode token
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString(),
    );
    // ✅ Allowed
    return NextResponse.next();
  } catch (err) {
    console.error("Invalid token:", err);
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Apply to all protected routes
export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
