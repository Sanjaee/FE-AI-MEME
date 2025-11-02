import { useMemo } from "react"
import { seededRandom } from "@/utils/format"

interface MiniChartProps {
  isPositive: boolean
  seed: number
}

export default function MiniChart({ isPositive, seed }: MiniChartProps) {
  const points = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => {
      const x = (i / 19) * 100
      const rand = seededRandom(seed + i)
      const y = isPositive
        ? 50 - rand * 30 - i * 0.5
        : 50 + rand * 30 + i * 0.5
      return `${x},${y}`
    }).join(" ")
  }, [isPositive, seed])

  return (
    <svg
      width="60"
      height="30"
      viewBox="0 0 100 100"
      className="w-15 h-8 mr-4"
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        stroke={isPositive ? "#22c55e" : "#ef4444"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

