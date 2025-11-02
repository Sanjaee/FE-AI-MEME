import { useState } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip } from "@/components/ui/tooltip"
import {
  Globe,
  Link2,
  Search,
  Edit,
  ArrowUp,
  ArrowDown,
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  Copy,
  Check,
} from "lucide-react"
import { FaXTwitter } from "react-icons/fa6"
import { LuChartCandlestick } from "react-icons/lu"
import { TokenData } from "@/types/token"
import { formatNumber, formatTimeAgo, calculateChangePercent } from "@/utils/format"
import MiniChart from "./MiniChart"

interface TokenRowProps {
  token: TokenData
}

export default function TokenRow({ token }: TokenRowProps) {
  const [copied, setCopied] = useState(false)
  const changePercent = calculateChangePercent(token.marketCapSol)
  const isPositive = changePercent >= 0
  const marketCapFormatted = formatNumber(token.marketCapSol * 150)
  const volumeFormatted = formatNumber(token.volumeSol * 150)
  const liquidityFormatted = formatNumber(token.liquiditySol * 150)

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(token.tokenAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <div className="bg-[#1a1a1a] border-b border-zinc-800 hover:bg-[#202020] transition-colors">
      <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_0.8fr_2fr_0.5fr] gap-5 items-center px-5 py-5">
        {/* Pair Info */}
        <div className="flex items-center gap-5">
          <div className="relative flex-shrink-0">
            <Avatar className="h-16 w-16 rounded-xl border-2 border-zinc-700">
              <AvatarImage src={token.tokenImage} alt={token.tokenName} />
              <AvatarFallback className="rounded-xl bg-zinc-800 text-white text-lg">
                {token.tokenTicker.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border-2 border-[#1a1a1a] flex items-center justify-center">
              <Clock className="h-3 w-3 text-black" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="font-bold text-white text-base truncate">{token.tokenTicker}</span>
              <span className="text-zinc-500 w-3 text-sm truncate flex-1">{token.tokenName}</span>
              <Tooltip content={copied ? "Copied!" : "Copy address"}>
                <button
                  onClick={handleCopyAddress}
                  className="text-zinc-500 hover:text-white transition-colors flex-shrink-0"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-zinc-500 text-xs font-medium whitespace-nowrap">
                {formatTimeAgo(token.openTrading || token.createdAt)}
              </span>
              <div className="flex gap-1.5 items-center flex-shrink-0">
                <button className="text-zinc-500 hover:text-white transition-colors">
                  <Edit className="h-3.5 w-3.5" />
                </button>
                {token.twitter && (
                  <Tooltip content={token.twitter} side="top">
                    <a
                      href={token.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-500 hover:text-white transition-colors"
                    >
                      <FaXTwitter className="h-3.5 w-3.5" />
                    </a>
                  </Tooltip>
                )}
                {token.website && (
                  <Tooltip content={token.website} side="top">
                    <a
                      href={token.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-500 hover:text-white transition-colors"
                    >
                      <Globe className="h-3.5 w-3.5" />
                    </a>
                  </Tooltip>
                )}
                <button className="text-zinc-500 hover:text-white transition-colors">
                  <Link2 className="h-3.5 w-3.5" />
                </button>
                <button className="text-zinc-500 hover:text-white transition-colors">
                  <Search className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Market Cap */}
        <div className="flex items-center gap-3">
          <MiniChart isPositive={isPositive} seed={token.marketCapSol} />
          <div className="min-w-0">
            <div className="text-white font-bold text-lg truncate">{marketCapFormatted}</div>
            <div className={`text-sm font-semibold truncate ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
              {isPositive ? "+" : ""}{changePercent.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Liquidity */}
        <div className="text-white font-semibold text-base truncate">{liquidityFormatted}</div>

        {/* Volume */}
        <div className="text-white font-semibold text-base truncate">{volumeFormatted}</div>

        {/* TXNS */}
        <div className="min-w-0">
          <div className="text-white font-bold text-base mb-1 truncate">{token.numTxns}</div>
          <div className="text-xs truncate">
            <span className="text-emerald-400 font-medium">{token.numBuys}</span>
            <span className="text-zinc-600 mx-1">/</span>
            <span className="text-rose-400 font-medium">{token.numSells}</span>
          </div>
        </div>

        {/* Token Info */}
        <div className="space-y-2 min-w-0">
          <div className="flex items-center justify-between text-xs gap-2">
            <span className="text-rose-400 flex items-center gap-1.5 truncate">
              <ArrowDown className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{token.top10HoldersPercent.toFixed(2)}%</span>
            </span>
            <span className="text-emerald-400 flex items-center gap-1.5 truncate">
              <ArrowUp className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{token.devHoldsPercent.toFixed(2)}%</span>
            </span>
          </div>
          <div className="flex items-center justify-between text-xs gap-2">
            <span className="text-emerald-400 flex items-center gap-1.5 truncate">
              <TrendingUp className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">0%</span>
            </span>
            <span className="text-rose-400 flex items-center gap-1.5 truncate">
              <TrendingDown className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{token.snipersHoldPercent.toFixed(2)}%</span>
            </span>
          </div>
          <div className="flex items-center justify-between text-xs gap-2">
            <span className="text-emerald-400 flex items-center gap-1.5 truncate">
              <TrendingUp className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{token.insidersHoldPercent.toFixed(2)}%</span>
            </span>
            {token.dexPaid ? (
              <span className="text-emerald-400 flex items-center gap-1.5 truncate">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a]"></div>
                </div>
                <span className="truncate">Paid</span>
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1.5 truncate">
                <div className="w-3.5 h-3.5 rounded-full bg-rose-400 flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a]"></div>
                </div>
                <span className="truncate">Unpaid</span>
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-xs pt-1.5 border-t border-zinc-800 gap-2">
            <span className="text-zinc-400 flex items-center gap-1.5 truncate">
              <Users className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{token.numHolders}</span>
            </span>
            <span className="text-zinc-400 flex items-center gap-1.5 truncate">
              <LuChartCandlestick className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{token.numTradingBotUsers}</span>
            </span>
          </div>
        </div>

        {/* Action Buttons Column */}
        <div className="flex flex-col gap-2.5 items-end">
          <a
            href={`https://axiom.trade/meme/${token.tokenAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md text-xs font-medium text-white transition-colors"
          >
            axiom
          </a>
          <a
            href={`https://gmgn.ai/solana/token/${token.tokenAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md text-xs font-medium text-white transition-colors"
          >
            gmgn
          </a>
          <a
            href={`https://bullx.io/solana/${token.tokenAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md text-xs font-medium text-white transition-colors"
          >
            bull x
          </a>
        </div>
      </div>
    </div>
  )
}

