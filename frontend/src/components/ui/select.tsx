"use client"

import { PropsWithChildren, useState, HTMLAttributes } from "react"
import { clsx } from "clsx"

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

interface SelectTriggerProps extends HTMLAttributes<HTMLButtonElement> {}
interface SelectContentProps extends HTMLAttributes<HTMLDivElement> {}
interface SelectItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string
}
interface SelectValueProps extends HTMLAttributes<HTMLSpanElement> {}

// Root
export function Select({ value, onValueChange, children, className }: PropsWithChildren<SelectProps>) {
  const [open, setOpen] = useState(false)
  return (
    <div className={clsx("relative inline-block w-full", className)}>
      {children}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md bg-white shadow-lg border border-gray-200">
          {children}
        </div>
      )}
    </div>
  )
}

// Trigger
export function SelectTrigger({ children, className, onClick, ...props }: SelectTriggerProps) {
  return (
    <button
      type="button"
      className={clsx(
        "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

// Value
export function SelectValue({ children, className, ...props }: SelectValueProps) {
  return <span className={clsx("block truncate", className)} {...props}>{children}</span>
}

// Content
export function SelectContent({ children, className, ...props }: SelectContentProps) {
  return (
    <div
      className={clsx(
        "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Item
export function SelectItem({ children, className, ...props }: SelectItemProps) {
  return (
    <div
      className={clsx(
        "cursor-pointer select-none rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
