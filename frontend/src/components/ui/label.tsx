import type { LabelHTMLAttributes, PropsWithChildren } from "react"
import { clsx } from "clsx"

export function Label({ className, children, ...props }: PropsWithChildren<LabelHTMLAttributes<HTMLLabelElement>>) {
  return (
    <label className={clsx("text-sm font-medium leading-none", className)} {...props}>
      {children}
    </label>
  )
}
