import { useState, useEffect, useCallback, useRef } from "react"
import { Geist, Geist_Mono } from "next/font/google"
import axios from "axios"
import { TokenData } from "@/types/token"
import Header from "@/components/Header"
import TokenList from "@/components/TokenList"
import MaintenanceDialog from "@/components/MaintenanceDialog"
import PlisioMarquee from "@/components/PlisioMarquee"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export default function Home() {
  const [tokens, setTokens] = useState<TokenData[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showMaintenance, setShowMaintenance] = useState(false)
  const isFetchingRef = useRef(false)

  const fetchTokens = useCallback(async () => {
    // Prevent concurrent requests
    if (isFetchingRef.current) {
      return
    }
    
    try {
      isFetchingRef.current = true
      setIsRefreshing(true)
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
  
      const response = await axios.get(`${backendUrl}/api/ai-token`, {
        headers: {
          'Cache-Control': 'no-cache',
        },
        timeout: 10000, // 10 second timeout
      })

      const data = response.data

      if (data.success && data.data && Array.isArray(data.data)) {
        // Normalize snipersHoldPercent untuk semua token (maksimal 3.323437761849493)
        const MAX_SNIPERS_HOLD_PERCENT = 3.323437761849493;
        const normalizedTokens = data.data.map((token: TokenData) => {
          if (token.snipersHoldPercent && token.snipersHoldPercent > MAX_SNIPERS_HOLD_PERCENT) {
            return {
              ...token,
              snipersHoldPercent: MAX_SNIPERS_HOLD_PERCENT
            };
          }
          return token;
        });
        
        // Deduplicate berdasarkan tokenTicker, pilih yang marketCapSol paling besar
        const tokenMap = new Map<string, TokenData>();
        
        normalizedTokens.forEach((token: TokenData) => {
          const ticker = token.tokenTicker?.toLowerCase().trim() || '';
          
          // Skip jika tokenTicker kosong atau tidak valid
          if (!ticker) return;
          
          const existing = tokenMap.get(ticker);
          
          // Jika belum ada atau marketCapSol lebih besar, simpan token ini
          if (!existing || (token.marketCapSol > existing.marketCapSol)) {
            tokenMap.set(ticker, token);
          }
        });
        
        // Convert map kembali ke array
        const deduplicatedTokens = Array.from(tokenMap.values());
        
        // Filter hanya token dengan devHoldsPercent = 0
        const filteredTokens = deduplicatedTokens.filter((token: TokenData) => {
          return token.devHoldsPercent === 0 || 
                 token.devHoldsPercent === null || 
                 token.devHoldsPercent === undefined ||
                 (typeof token.devHoldsPercent === 'number' && Math.abs(token.devHoldsPercent) < 0.0001);
        });
        
        // Sort berdasarkan date terbaru (prioritas utama), volumeSol sebagai secondary
        const sortedTokens = filteredTokens.sort((a, b) => {
          // Ambil date terbaru (prioritaskan openTrading, fallback ke createdAt)
          const dateA = new Date(a.openTrading || a.createdAt).getTime();
          const dateB = new Date(b.openTrading || b.createdAt).getTime();
          
          // Prioritaskan date terbaru (descending - yang terbaru di atas)
          if (dateB !== dateA) {
            return dateB - dateA;
          }
          // Jika date sama, urutkan berdasarkan volumeSol (descending)
          return b.volumeSol - a.volumeSol;
        });
        
        setTokens(sortedTokens)
        setLastUpdate(new Date())
        setShowMaintenance(false)
      } else {
        // Jika data tidak valid, set empty tokens tapi tidak tampilkan maintenance
        setTokens([])
        setLastUpdate(new Date())
        setShowMaintenance(false)
      }
    } catch (err) {
      // Hanya tampilkan maintenance jika terjadi network/fetch error
      // Network errors: timeout, connection refused, no network, dll
      // Bukan network errors: HTTP 4xx/5xx (sudah dapat response dari server)
      
      const isNetworkError = axios.isAxiosError(err) && (
        // Timeout error
        err.code === 'ECONNABORTED' ||
        // Network error (no connection, CORS, dll)
        err.code === 'ERR_NETWORK' ||
        err.code === 'ERR_CONNECTION_REFUSED' ||
        err.code === 'ERR_CONNECTION_TIMED_OUT' ||
        // No response means network error
        !err.response
      )
      
      // Only show maintenance for network/fetch errors
      if (isNetworkError) {
        // Silently handle network errors - no logging
        setShowMaintenance(true)
      } else {
        // For other errors (HTTP errors, validation errors, dll), silently handle
        // Don't show maintenance, just keep existing tokens
        setShowMaintenance(false)
      }
      
      // Silently catch and handle all errors - no console logging
      // Error is already handled above (show/hide maintenance dialog)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
      isFetchingRef.current = false
    }
  }, [])

  useEffect(() => {
    setMounted(true)
    fetchTokens()
  }, [fetchTokens])

  // Auto refresh every 1 second
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTokens()
    }, 1000)

    return () => clearInterval(interval)
  }, [fetchTokens])

  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-black text-white relative overflow-hidden`}
    >
      {/* Plisio Marquee at the very top */}
      <PlisioMarquee />
      
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-900/10 rounded-full filter blur-3xl opacity-50"></div>
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-cyan-900/5 rounded-full filter blur-3xl opacity-30"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-[1440px] relative z-10">
        <Header 
          isRefreshing={isRefreshing} 
          lastUpdate={lastUpdate} 
          mounted={mounted} 
        />

        <TokenList tokens={tokens} isLoading={loading} />
      </div>

      <MaintenanceDialog
        isOpen={showMaintenance}
        onRetry={() => {
          window.location.reload()
        }}
      />
    </div>
  )
}
