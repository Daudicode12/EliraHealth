import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes and API routes
  if (
    pathname.startsWith("/api") || 
    pathname.startsWith("/_next") || 
    pathname === "/favicon.ico" ||
    pathname === "/signup" ||
    pathname === "/login"
  ) {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = request.cookies.get("auth-token")?.value;
  
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Decode the mock JWT payload
    const payloadStr = token.replace("mock-jwt-", "");
    const decoded = JSON.parse(Buffer.from(payloadStr, "base64").toString("utf-8"));
    const { role, status } = decoded;

    // Specialist Protection
    if (role === "expert" && pathname.startsWith("/doctor")) {
      if (status === "pending") {
        return NextResponse.redirect(new URL("/verification-pending", request.url));
      }
      if (status === "rejected") {
        return NextResponse.redirect(new URL("/application-rejected", request.url));
      }
      if (status === "suspended") {
        return NextResponse.redirect(new URL("/account-suspended", request.url));
      }
      // If approved, allow access
    }

    // Admin Protection
    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Patient Protection
    if (pathname.startsWith("/patient") && role !== "user") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // If token parsing fails, clear it and login again
    console.error("Middleware decode error:", error);
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("auth-token");
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
