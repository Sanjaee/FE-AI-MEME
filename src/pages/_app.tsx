import "@/styles/globals.css";
import { SessionProvider, useSession } from "next-auth/react";
import type { AppProps } from "next/app";
import Head from "next/head";
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
    <>
      <Head>
        {/* Meta tags for SEO and social sharing */}
        <title>Token AI Agent - Real-time Crypto Market Analytics</title>
        <meta name="description" content="Token AI Agent - Real-time market data & analytics for cryptocurrency tokens" />
        <meta name="keywords" content="crypto, token, blockchain, market data, analytics, solana" />
        <meta name="author" content="Token AI Agent" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Token AI Agent - Real-time Crypto Market Analytics" />
        <meta property="og:description" content="Real-time market data & analytics for cryptocurrency tokens" />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:url" content="https://meme-ai-delta.vercel.app" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Token AI Agent - Real-time Crypto Market Analytics" />
        <meta name="twitter:description" content="Real-time market data & analytics for cryptocurrency tokens" />
        <meta name="twitter:image" content="/logo.png" />
        
        {/* PWA and mobile */}
        <meta name="theme-color" content="#000000" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Token AI Agent" />
      </Head>
      <SessionProvider session={pageProps.session}>
        <ProtectedContent>
          <Component {...pageProps} />
        </ProtectedContent>
      </SessionProvider>
    </>
  );
}
