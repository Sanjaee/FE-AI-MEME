import { useState } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip } from "@/components/ui/tooltip"
import {
  Globe,
  Users,
  Copy,
  Check,
} from "lucide-react"
import { FaXTwitter } from "react-icons/fa6"
import { LuChartCandlestick, LuBoxes } from "react-icons/lu"
import { RiUserStarLine } from "react-icons/ri"
import { FaChessKing, FaGhost, FaCrosshairs } from "react-icons/fa"
import { MdRadioButtonChecked } from "react-icons/md"
import { TokenData } from "@/types/token"
import { formatNumber, formatTimeAgo, calculateChangePercent } from "@/utils/format"
import MiniChart from "./MiniChart"

interface TokenBnbRowProps {
  token: TokenData
}

export default function TokenBnbRow({ token }: TokenBnbRowProps) {
  const [copied, setCopied] = useState(false)
  const changePercent = calculateChangePercent(token.marketCapSol)
  const isPositive = changePercent >= 0
  // BNB price is typically around $600-700, using $650 as average
  const BNB_PRICE = 650
  const marketCapFormatted = formatNumber(token.marketCapSol * BNB_PRICE)
  const volumeFormatted = formatNumber(token.volumeSol * BNB_PRICE)
  const liquidityFormatted = formatNumber(token.liquiditySol * BNB_PRICE)

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(token.tokenAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleLinkClick = async (url: string) => {
    try {
      // Step 1: Copy token address ke clipboard
      await navigator.clipboard.writeText(token.tokenAddress)
      setCopied(true)
      
      // Step 2: Delay sebentar untuk feedback (300ms)
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Step 3: Redirect ke URL yang diinginkan
      window.open(url, '_blank', 'noopener,noreferrer')
      
      // Reset copied state setelah 2 detik
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy or redirect:", err)
    }
  }

  return (
    <div className="bg-[#1a1a1a] border-b border-zinc-800 hover:bg-[#202020] transition-colors">
      <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_0.8fr_2fr_0.5fr] gap-5 items-center px-5 py-5">
        {/* Pair Info */}
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <Avatar className="h-16 w-16 rounded-xl border-2 border-zinc-700">
              <AvatarImage src={token.tokenImage} alt={token.tokenName} />
              <AvatarFallback className="rounded-xl bg-zinc-800 text-white text-lg">
                {token.tokenTicker.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 bg-[#1a1a1a] flex items-center justify-center">
                <img src={"https://axiom.trade/images/evm/protocols/fourmeme-grad.svg"} alt="Fourmeme" className="w-full h-full" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="font-bold text-white text-base truncate">{token.tokenTicker}</span>
              <span className="text-zinc-500 w-3 text-sm truncate flex-1">{token.tokenName}</span>
              <Tooltip content={copied ? "Copied!" : "Copy address"}>
                <button
                  onClick={handleCopyAddress}
                  className="text-zinc-500 hover:text-white transition-colors shrink-0"
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
              <div className="flex gap-1.5 items-center shrink-0">
               
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
            <Tooltip content="Top 10 Holders" side="top">
              <span className="text-rose-400 flex items-center gap-1.5 truncate cursor-pointer">
                <RiUserStarLine className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{token.top10HoldersPercent.toFixed(2)}%</span>
              </span>
            </Tooltip>
            <Tooltip content="Dev Holdings" side="top">
              <span className="text-emerald-400 flex items-center gap-1.5 truncate cursor-pointer">
                <FaChessKing className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{token.devHoldsPercent.toFixed(2)}%</span>
              </span>
            </Tooltip>
          </div>
          <div className="flex items-center justify-between text-xs gap-2">
            <Tooltip content="Bundlers Hold" side="top">
              <span className="text-emerald-400 flex items-center gap-1.5 truncate cursor-pointer">
                <LuBoxes className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{token.bundlersHoldPercent?.toFixed(2) || '0.00'}%</span>
              </span>
            </Tooltip>
            <Tooltip content="Snipers Hold" side="top">
              <span className="text-rose-400 flex items-center gap-1.5 truncate cursor-pointer">
                <FaCrosshairs className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{token.snipersHoldPercent.toFixed(2)}%</span>
              </span>
            </Tooltip>
          </div>
          <div className="flex items-center justify-between text-xs gap-2">
            <Tooltip content="Insiders Hold" side="top">
              <span className="text-emerald-400 flex items-center gap-1.5 truncate cursor-pointer">
                <FaGhost className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{token.insidersHoldPercent.toFixed(2)}%</span>
              </span>
            </Tooltip>
            <Tooltip content="DEX Paid" side="top">
              <span className="text-emerald-400 flex items-center gap-1.5 truncate cursor-pointer">
                <MdRadioButtonChecked className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">DEX</span>
              </span>
            </Tooltip>
          </div>
          <div className="flex items-center justify-between text-xs pt-1.5 border-t border-zinc-800 gap-2">
            <Tooltip content="Total Holders" side="top">
              <span className="text-zinc-400 flex items-center gap-1.5 truncate cursor-pointer">
                <Users className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{token.numHolders}</span>
              </span>
            </Tooltip>
            <Tooltip content="Trading Bot Users" side="top">
              <span className="text-zinc-400 flex items-center gap-1.5 truncate cursor-pointer">
                <LuChartCandlestick className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{token.numTradingBotUsers}</span>
              </span>
            </Tooltip>
          </div>
        </div>

        {/* Action Buttons Column */}
        <div className="flex flex-col gap-2.5 items-end">
          <button
            onClick={() => handleLinkClick(`https://axiom.trade`)}
            className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md text-xs font-medium text-white transition-colors"
          >
            axiom
          </button>
          <button
            onClick={() => handleLinkClick(`https://gmgn.ai`)}
            className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md text-xs font-medium text-white transition-colors"
          >
            gmgn
          </button>
          <button
            onClick={() => handleLinkClick(`https://bullx.io`)}
            className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md text-xs font-medium text-white transition-colors"
          >
            bull x
          </button>
        </div>
      </div>
    </div>
  )
}

