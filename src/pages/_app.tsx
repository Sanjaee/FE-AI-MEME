import "@/styles/globals.css";
import { SessionProvider, useSession } from "next-auth/react";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect } from "react";

// Protected wrapper component
function ProtectedContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Only check auth for admin pages
    if (router.pathname.startsWith("/admin/EZA")) {
      if (status === "unauthenticated") {
        router.push("/login");
      } else if (status === "authenticated" && session?.user?.role !== "admin") {
        // Only allow admin role
        router.push("/");
      }
    }
  }, [session, status, router]);

  // Don't block non-admin pages
  if (!router.pathname.startsWith("/admin/EZA")) {
    return <>{children}</>;
  }

  // For admin pages, show loading or redirect
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null; // Will redirect in useEffect
  }

  if (session?.user?.role !== "admin") {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <ProtectedContent>
        <Component {...pageProps} />
      </ProtectedContent>
    </SessionProvider>
  );
}
