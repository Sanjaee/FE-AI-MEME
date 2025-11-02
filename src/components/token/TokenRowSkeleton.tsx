export default function TokenRowSkeleton() {
  return (
    <div className="bg-[#1a1a1a] border-b border-zinc-800 animate-pulse">
      <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_0.8fr_2fr_0.5fr] gap-5 items-center px-5 py-5">
        {/* Pair Info */}
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <div className="h-16 w-16 rounded-xl bg-zinc-800 border-2 border-zinc-700"></div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 bg-[#1a1a1a]"></div>
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="h-4 w-20 bg-zinc-800 rounded"></div>
              <div className="h-3 w-32 bg-zinc-800 rounded"></div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="h-3 w-12 bg-zinc-800 rounded"></div>
              <div className="flex gap-1.5">
                <div className="h-3.5 w-3.5 bg-zinc-800 rounded"></div>
                <div className="h-3.5 w-3.5 bg-zinc-800 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Market Cap */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-16 bg-zinc-800 rounded"></div>
          <div className="min-w-0 space-y-2">
            <div className="h-5 w-24 bg-zinc-800 rounded"></div>
            <div className="h-4 w-16 bg-zinc-800 rounded"></div>
          </div>
        </div>

        {/* Liquidity */}
        <div className="h-5 w-20 bg-zinc-800 rounded"></div>

        {/* Volume */}
        <div className="h-5 w-20 bg-zinc-800 rounded"></div>

        {/* TXNS */}
        <div className="min-w-0 space-y-2">
          <div className="h-5 w-12 bg-zinc-800 rounded"></div>
          <div className="h-3 w-16 bg-zinc-800 rounded"></div>
        </div>

        {/* Token Info */}
        <div className="space-y-2 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="h-4 w-16 bg-zinc-800 rounded"></div>
            <div className="h-4 w-16 bg-zinc-800 rounded"></div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="h-4 w-16 bg-zinc-800 rounded"></div>
            <div className="h-4 w-16 bg-zinc-800 rounded"></div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="h-4 w-16 bg-zinc-800 rounded"></div>
            <div className="h-4 w-12 bg-zinc-800 rounded"></div>
          </div>
          <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-zinc-800">
            <div className="h-4 w-16 bg-zinc-800 rounded"></div>
            <div className="h-4 w-16 bg-zinc-800 rounded"></div>
          </div>
        </div>

        {/* Action Buttons Column */}
        <div className="flex flex-col gap-2.5 items-end">
          <div className="w-full h-8 bg-zinc-800 rounded-md"></div>
          <div className="w-full h-8 bg-zinc-800 rounded-md"></div>
          <div className="w-full h-8 bg-zinc-800 rounded-md"></div>
        </div>
      </div>
    </div>
  )
}

