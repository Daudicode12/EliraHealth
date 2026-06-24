import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes and API routes
  const publicPaths = [
    "/api", "/_next", "/favicon.ico",
    "/signup", "/login",
    "/about", "/services", "/faq", "/contact",
    "/images",
  ];
  if (
    pathname === "/" ||
    publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))
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

    // Specialist Route Protection
    if (pathname.startsWith("/specialist")) {
      if (role !== "expert") {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      if (status === "profile_incomplete") {
        // Allow only /specialist/profile/complete
        const isAllowed = pathname === "/specialist/profile/complete";
        if (!isAllowed) {
          return NextResponse.redirect(new URL("/specialist/profile/complete", request.url));
        }
      } else if (status === "pending_review") {
        // Allow only /specialist/dashboard, /specialist/profile, and /specialist/notifications
        const isAllowed = 
          pathname === "/specialist/dashboard" || 
          pathname === "/specialist/profile" || 
          pathname === "/specialist/notifications";
        if (!isAllowed) {
          return NextResponse.redirect(new URL("/specialist/dashboard", request.url));
        }
      } else if (status === "rejected") {
        if (pathname !== "/specialist/application-rejected") {
          return NextResponse.redirect(new URL("/specialist/application-rejected", request.url));
        }
      } else if (status === "suspended") {
        if (pathname !== "/specialist/account-suspended") {
          return NextResponse.redirect(new URL("/specialist/account-suspended", request.url));
        }
      }
    }

    // Admin Protection
    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // User Route Protection
    if (pathname.startsWith("/user") && role !== "user") {
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
