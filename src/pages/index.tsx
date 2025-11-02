import { useState, useEffect } from "react"
import { Geist, Geist_Mono } from "next/font/google"
import { TokenData } from "@/types/token"
import Header from "@/components/Header"
import SummaryStats from "@/components/SummaryStats"
import TokenList from "@/components/TokenList"

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
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [mounted, setMounted] = useState(false)

  const fetchTokens = async () => {
    try {
      setIsRefreshing(true)
      const response = await fetch("http://localhost:5000/api/ai-token")
      const data = await response.json()

      if (data.success && data.data && Array.isArray(data.data)) {
        setTokens(data.data)
        setLastUpdate(new Date())
        setError(null)
      } else {
        setError("Failed to fetch tokens")
      }
    } catch (err) {
      console.error("Error fetching tokens:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    fetchTokens()
  }, [])

  // Auto refresh every 1 second
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTokens()
    }, 1000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-black text-white relative overflow-hidden`}
    >
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-900/10 rounded-full filter blur-3xl opacity-50"></div>
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-cyan-900/5 rounded-full filter blur-3xl opacity-30"></div>
      </div>
      
      <div className="container mx-auto px-6 py-8 max-w-[1920px] relative z-10">
        <Header 
          isRefreshing={isRefreshing} 
          lastUpdate={lastUpdate} 
          mounted={mounted} 
        />
        
        <SummaryStats tokens={tokens} />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-zinc-400">Loading tokens...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-red-400">Error: {error}</div>
          </div>
        ) : (
          <TokenList tokens={tokens} />
        )}
      </div>
    </div>
  )
}
