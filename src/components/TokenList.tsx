import { useEffect, useRef, useState } from "react"
import { TokenData } from "@/types/token"
import TokenRow from "./token/TokenRow"
import TokenBnbRow from "./token/TokenBnbRow"
import TokenTableHeader from "./token/TokenTableHeader"
import TokenRowSkeleton from "./token/TokenRowSkeleton"

interface TokenListProps {
  tokens: TokenData[]
  isLoading?: boolean
  chain?: "solana" | "bnb"
}

const ITEMS_PER_PAGE = 20

export default function TokenList({ tokens, isLoading = false, chain = "solana" }: TokenListProps) {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)
  const observerTarget = useRef<HTMLDivElement>(null)

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < tokens.length) {
          setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, tokens.length))
        }
      },
      { threshold: 0.1 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [visibleCount, tokens.length])

  const visibleTokens = tokens.slice(0, visibleCount)
  const hasMore = visibleCount < tokens.length

  // Show skeleton when loading
  if (isLoading) {
    return (
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="space-y-0 min-w-[1200px]">
          <TokenTableHeader />
          <div className="space-y-0">
            {Array.from({ length: 10 }).map((_, index) => (
              <TokenRowSkeleton key={`skeleton-${index}`} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (tokens.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-zinc-400">No tokens found</div>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="space-y-0 min-w-[1200px]">
        <TokenTableHeader />
        <div className="space-y-0">
          {visibleTokens.map((token, index) => 
            chain === "bnb" ? (
              <TokenBnbRow key={token.tokenAddress || index} token={token} />
            ) : (
              <TokenRow key={token.tokenAddress || index} token={token} />
            )
          )}
        </div>
        
        {/* Observer target for infinite scroll */}
        {hasMore && (
          <div ref={observerTarget} className="flex items-center justify-center py-8">
            <div className="text-zinc-400 text-sm">Loading more tokens...</div>
          </div>
        )}
        
        {!hasMore && tokens.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-center py-8">
            <div className="text-zinc-500 text-sm">All tokens loaded</div>
          </div>
        )}
      </div>
    </div>
  )
}

