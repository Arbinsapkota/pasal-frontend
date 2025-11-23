import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function decodeJWT(token: string): any | null {
  try {
    const base64Url = token.split(".")[1]; // Get the payload part
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}

export function middleware(req: NextRequest) {
  const userCookie = req.cookies.get("ETECH-mh#56O");
  // const adminSession = req.
  const { pathname } = req.nextUrl;

  if (userCookie) {
    const user = decodeJWT(JSON.parse(decodeURIComponent(userCookie.value)));
    const userType = user?.role;

    if (userType === "SUPER_ADMIN" || userType === "SUB_ADMIN") {
      if (pathname !== "/ETECH-Admin/dashboard") {
        return NextResponse.redirect(
          new URL("/ETECH-Admin/dashboard", req.url)
        );
      }
    }

    if (
      pathname.startsWith("/ETECH-Admin") &&
      userType !== "SUPER_ADMIN" &&
      userType !== "SUB_ADMIN"
    ) {
      return NextResponse.redirect(new URL("/homepage", req.url));
    }
  } else {
    if (pathname.startsWith("/ETECH-Admin/dashboard")) {
      return NextResponse.redirect(new URL("/homepage", req.url));
    }

    if (pathname.startsWith("/account")) {
      return NextResponse.redirect(new URL("/homepage", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/ETECH-Admin:path*",
    "/homepage:path*",
    "/homepage/products:path*",
    "/",
    "/account",
    "/ETECH-Admin/dashboard:path*",
    "/checkout",
  ],
};
