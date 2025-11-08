import { useState, useEffect, useCallback, useRef } from "react"
import { Geist, Geist_Mono } from "next/font/google"
import axios from "axios"
import { TokenData } from "@/types/token"
import Header from "@/components/Header"
import TokenList from "@/components/TokenList"
import MaintenanceDialog from "@/components/MaintenanceDialog"
import PlisioMarquee from "@/components/PlisioMarquee"
import ChatAiButton from "@/components/token/Ai"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

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
  const [bnbTokens, setBnbTokens] = useState<TokenData[]>([])
  const [loading, setLoading] = useState(true)
  const [bnbLoading, setBnbLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [lastUpdateBnb, setLastUpdateBnb] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isRefreshingBnb, setIsRefreshingBnb] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showMaintenance, setShowMaintenance] = useState(false)
  const [showMaintenanceBnb, setShowMaintenanceBnb] = useState(false)
  const [tokenApiError, setTokenApiError] = useState(false)
  const [tokenApiErrorBnb, setTokenApiErrorBnb] = useState(false)
  const [activeTab, setActiveTab] = useState<"solana" | "bnb">("solana")
  const isFetchingRef = useRef(false)
  const isFetchingBnbRef = useRef(false)

  const fetchTokens = useCallback(async () => {
    // Prevent concurrent requests
    if (isFetchingRef.current) {
      return
    }
    
    try {
      isFetchingRef.current = true
      setIsRefreshing(true)
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.zascript.com'
  
      const response = await axios.get(`${backendUrl}/api/ai-token`, {
        headers: {
          'Cache-Control': 'no-cache',
        }
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
        setTokenApiError(false)
      } else {
        // Jika data tidak valid, set empty tokens tapi tidak tampilkan maintenance
        setTokens([])
        setLastUpdate(new Date())
        setShowMaintenance(false)
        setTokenApiError(false)
      }
    } catch (err) {
      // Hanya tampilkan maintenance jika terjadi network/fetch error dari TOKEN API
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
      
      // Only show maintenance for network/fetch errors from TOKEN API
      // This is specifically for /api/ai-token endpoint
      if (isNetworkError) {
        // Set token API error flag
        setTokenApiError(true)
        setShowMaintenance(true)
      } else {
        // For other errors (HTTP errors, validation errors, dll), silently handle
        // Don't show maintenance, just keep existing tokens
        setTokenApiError(false)
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

  const fetchBnbTokens = useCallback(async () => {
    // Prevent concurrent requests
    if (isFetchingBnbRef.current) {
      return
    }
    
    try {
      isFetchingBnbRef.current = true
      setIsRefreshingBnb(true)
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.zascript.com'
  
      const response = await axios.get(`${backendUrl}/api/ai-token-bnb`, {
        headers: {
          'Cache-Control': 'no-cache',
        }
      })

      const data = response.data

      // Handle format baru BNB: {status: "Success", data: [...]}
      if ((data.status === "Success" || data.success) && data.data && Array.isArray(data.data)) {
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
        
        setBnbTokens(sortedTokens)
        setLastUpdateBnb(new Date())
        setShowMaintenanceBnb(false)
        setTokenApiErrorBnb(false)
      } else {
        // Jika data tidak valid, set empty tokens tapi tidak tampilkan maintenance
        setBnbTokens([])
        setLastUpdateBnb(new Date())
        setShowMaintenanceBnb(false)
        setTokenApiErrorBnb(false)
      }
    } catch (err) {
      // Hanya tampilkan maintenance jika terjadi network/fetch error dari TOKEN API
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
      
      // Only show maintenance for network/fetch errors from TOKEN API
      // This is specifically for /api/ai-token/bnb endpoint
      if (isNetworkError) {
        // Set token API error flag
        setTokenApiErrorBnb(true)
        setShowMaintenanceBnb(true)
      } else {
        // For other errors (HTTP errors, validation errors, dll), silently handle
        // Don't show maintenance, just keep existing tokens
        setTokenApiErrorBnb(false)
        setShowMaintenanceBnb(false)
      }
      
      // Silently catch and handle all errors - no console logging
      // Error is already handled above (show/hide maintenance dialog)
    } finally {
      setBnbLoading(false)
      setIsRefreshingBnb(false)
      isFetchingBnbRef.current = false
    }
  }, [])

  // Initial mount - set mounted state
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch data ketika tab berubah atau pertama kali mount
  useEffect(() => {
    if (activeTab === "solana") {
      fetchTokens()
    } else if (activeTab === "bnb") {
      fetchBnbTokens()
    }
  }, [activeTab, fetchTokens, fetchBnbTokens]) // Fetch ketika tab berubah

  // Auto refresh every 1 second - hanya fetch token untuk tab yang aktif
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === "solana") {
        fetchTokens()
      } else if (activeTab === "bnb") {
        fetchBnbTokens()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [activeTab, fetchTokens, fetchBnbTokens])

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
          isRefreshing={activeTab === "solana" ? isRefreshing : isRefreshingBnb} 
          lastUpdate={activeTab === "solana" ? lastUpdate : lastUpdateBnb} 
          mounted={mounted} 
        />

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "solana" | "bnb")} className="w-full">
          <TabsList className="mb-6 bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="solana" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white flex items-center gap-2">
              <img 
                src="https://axiom.trade/images/sol-fill.svg" 
                alt="Solana" 
                className="w-4 h-4"
              />
              Solana
            </TabsTrigger>
            <TabsTrigger value="bnb" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white flex items-center gap-2">
              <img 
                src="https://axiom.trade/images/bnb-fill.svg" 
                alt="BNB" 
                className="w-4 h-4"
              />
              BNB
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="solana" className="mt-0">
            <TokenList tokens={tokens} isLoading={loading} chain="solana" />
          </TabsContent>
          
          <TabsContent value="bnb" className="mt-0">
            <TokenList tokens={bnbTokens} isLoading={bnbLoading} chain="bnb" />
          </TabsContent>
        </Tabs>
      </div>

      {/* MaintenanceDialog untuk Solana */}
      <MaintenanceDialog
        isOpen={showMaintenance && tokenApiError && activeTab === "solana"}
        onRetry={() => {
          setTokenApiError(false)
          setShowMaintenance(false)
          fetchTokens()
        }}
      />

      {/* MaintenanceDialog untuk BNB */}
      <MaintenanceDialog
        isOpen={showMaintenanceBnb && tokenApiErrorBnb && activeTab === "bnb"}
        onRetry={() => {
          setTokenApiErrorBnb(false)
          setShowMaintenanceBnb(false)
          fetchBnbTokens()
        }}
      />

      {/* AI Chat Component */}
      <ChatAiButton />
    </div>
  )
}
