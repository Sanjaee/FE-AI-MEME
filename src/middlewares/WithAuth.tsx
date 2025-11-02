import {
  NextMiddleware,
  NextResponse,
  NextRequest,
  NextFetchEvent,
} from "next/server";
import { getToken } from "next-auth/jwt";

const onlyAdmin = ["/admin/EZA"];

export default function withAuth(
  middleware: NextMiddleware,
  requireAuth: string[] = []
) {
  return async (req: NextRequest, next: NextFetchEvent) => {
    const pathname = req.nextUrl.pathname;

    // Check if the current path requires authentication
    const requiresAuth = requireAuth.some((route) =>
      pathname.startsWith(route)
    );

    if (requiresAuth) {
      const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
      });

      if (!token) {
        const url = new URL("/login", req.url);
        url.searchParams.set("callbackUrl", encodeURIComponent(req.url));
        return NextResponse.redirect(url);
      }

      // Check admin-only routes - ONLY allow admin role
      const isAdminRoute = onlyAdmin.some((route) =>
        pathname.startsWith(route)
      );
      if (isAdminRoute) {
        // Strict check: must be admin role
        if (token.role !== "admin") {
          return NextResponse.redirect(new URL("/", req.url));
        }
      } else {
        // For other protected routes, also require admin role
        if (token.role !== "admin") {
          return NextResponse.redirect(new URL("/", req.url));
        }
      }
    }

    return middleware(req, next);
  };
}
