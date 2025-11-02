export default function TokenTableHeader() {
  return (
    <div className="bg-zinc-900 border-b border-zinc-700 sticky top-0 z-10">
      <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_0.8fr_2fr_0.5fr] gap-5 items-center px-5 py-4">
        {/* Pair Info */}
        <div className="text-zinc-400 text-sm font-semibold uppercase tracking-wider">
          Pair Info
        </div>

        {/* Market Cap */}
        <div className="text-zinc-400 text-sm font-semibold uppercase tracking-wider">
          Market Cap
        </div>

        {/* Liquidity */}
        <div className="text-zinc-400 text-sm font-semibold uppercase tracking-wider">
          Liquidity
        </div>

        {/* Volume */}
        <div className="text-zinc-400 text-sm font-semibold uppercase tracking-wider">
          Volume
        </div>

        {/* TXNS */}
        <div className="text-zinc-400 text-sm font-semibold uppercase tracking-wider">
          TXNS
        </div>

        {/* Token Info */}
        <div className="text-zinc-400 text-sm font-semibold uppercase tracking-wider">
          Token Info
        </div>

        {/* Action */}
        <div className="text-zinc-400 text-sm font-semibold uppercase tracking-wider text-right">
          Action
        </div>
      </div>
    </div>
  )
}

