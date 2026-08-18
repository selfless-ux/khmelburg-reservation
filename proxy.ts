import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Страница входа доступна без авторизации
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const isAuthenticated =
    request.cookies.get("admin_authenticated")?.value === "true";

  // Все остальные страницы /admin требуют авторизации
  if (!isAuthenticated) {
    return NextResponse.redirect(
      new URL("/admin/login", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};