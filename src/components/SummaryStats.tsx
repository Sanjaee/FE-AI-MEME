import { TokenData } from "@/types/token"
import { formatNumber } from "@/utils/format"

interface SummaryStatsProps {
  tokens: TokenData[]
}

export default function SummaryStats({ tokens }: SummaryStatsProps) {
  const totalMarketCap = tokens.reduce((sum, token) => sum + token.marketCapSol * 150, 0)
  const totalVolume = tokens.reduce((sum, token) => sum + token.volumeSol * 150, 0)
  const totalTokens = tokens.length
  const activeTokens = tokens.filter(t => t.isPumpLive).length

  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg p-6 hover:border-zinc-700 transition-colors">
        <div className="text-zinc-500 text-xs uppercase tracking-wider mb-2 font-semibold">
          Total Market Cap
        </div>
        <div className="text-2xl font-bold text-white">
          {formatNumber(totalMarketCap)}
        </div>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg p-6 hover:border-zinc-700 transition-colors">
        <div className="text-zinc-500 text-xs uppercase tracking-wider mb-2 font-semibold">
          Total Volume
        </div>
        <div className="text-2xl font-bold text-white">
          {formatNumber(totalVolume)}
        </div>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg p-6 hover:border-zinc-700 transition-colors">
        <div className="text-zinc-500 text-xs uppercase tracking-wider mb-2 font-semibold">
          Active Tokens
        </div>
        <div className="text-2xl font-bold text-emerald-400">
          {activeTokens}
        </div>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg p-6 hover:border-zinc-700 transition-colors">
        <div className="text-zinc-500 text-xs uppercase tracking-wider mb-2 font-semibold">
          Total Listed
        </div>
        <div className="text-2xl font-bold text-white">
          {totalTokens}
        </div>
      </div>
    </div>
  )
}

