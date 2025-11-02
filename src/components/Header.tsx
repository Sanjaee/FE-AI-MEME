import { useState, useEffect } from "react"
import { Activity, Clock } from "lucide-react"

interface HeaderProps {
  isRefreshing: boolean
  lastUpdate: Date | null
  mounted: boolean
}

export default function Header({ isRefreshing, mounted }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date())

  // Independent clock refresh every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Token AI Agent
          </h1>
          <p className="text-zinc-500 text-sm font-medium">
            Real-time market data & analytics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors">
            <Activity className={`h-4 w-4 ${isRefreshing ? "text-emerald-400 animate-pulse" : "text-zinc-500"}`} />
            <span className="text-xs text-zinc-400 font-medium">
              {isRefreshing ? "AI Updating..." : "Live"}
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors">
            <Clock className="h-4 w-4 text-zinc-500" />
            <span className="text-xs text-zinc-400 font-mono">
              {mounted
                ? currentTime.toLocaleTimeString("en-US", {
                    hour12: false,
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })
                : "--:--:--"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

