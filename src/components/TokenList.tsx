import { useEffect, useRef, useState } from "react"
import { TokenData } from "@/types/token"
import TokenRow from "./token/TokenRow"
import TokenTableHeader from "./token/TokenTableHeader"

interface TokenListProps {
  tokens: TokenData[]
}

const ITEMS_PER_PAGE = 20

export default function TokenList({ tokens }: TokenListProps) {
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

  if (tokens.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-zinc-400">No tokens found</div>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      <TokenTableHeader />
      <div className="space-y-0">
        {visibleTokens.map((token, index) => (
          <TokenRow key={token.tokenAddress || index} token={token} />
        ))}
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
  )
}

