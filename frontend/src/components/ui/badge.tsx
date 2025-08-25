import { HTMLAttributes } from "react"
import { clsx } from "clsx"

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground shadow-sm",
        className
      )}
      {...props}
    />
  )
}
