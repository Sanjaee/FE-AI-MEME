import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "content"> {
  content: string | React.ReactNode
  side?: "top" | "bottom" | "left" | "right"
}

const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({ className, content, side = "top", children, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false)

    return (
      <div
        ref={ref}
        className="relative inline-block"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        {...props}
      >
        {children}
        {isVisible && (
          <div
            className={cn(
              "absolute z-50 rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white shadow-md border border-zinc-800 whitespace-nowrap",
              side === "top" && "bottom-full left-1/2 -translate-x-1/2 mb-2",
              side === "bottom" && "top-full left-1/2 -translate-x-1/2 mt-2",
              side === "left" && "right-full top-1/2 -translate-y-1/2 mr-2",
              side === "right" && "left-full top-1/2 -translate-y-1/2 ml-2",
              className
            )}
          >
            {content}
            <div
              className={cn(
                "absolute w-2 h-2 bg-zinc-900 border border-zinc-800 rotate-45",
                side === "top" && "top-full left-1/2 -translate-x-1/2 -mt-1",
                side === "bottom" && "bottom-full left-1/2 -translate-x-1/2 -mb-1",
                side === "left" && "left-full top-1/2 -translate-y-1/2 -ml-1",
                side === "right" && "right-full top-1/2 -translate-y-1/2 -mr-1"
              )}
            />
          </div>
        )}
      </div>
    )
  }
)
Tooltip.displayName = "Tooltip"

export { Tooltip }

