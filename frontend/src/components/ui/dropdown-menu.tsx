"use client"

import { PropsWithChildren, useState, HTMLAttributes } from "react"
import { clsx } from "clsx"

interface DropdownMenuProps {
  children: React.ReactNode
  className?: string
}

interface DropdownMenuTriggerProps extends HTMLAttributes<HTMLButtonElement> {}
interface DropdownMenuContentProps extends HTMLAttributes<HTMLDivElement> {}
interface DropdownMenuItemProps extends HTMLAttributes<HTMLDivElement> {}

// Root
export function DropdownMenu({ children, className }: PropsWithChildren<DropdownMenuProps>) {
  return <div className={clsx("relative inline-block text-left", className)}>{children}</div>
}

// Trigger
export function DropdownMenuTrigger({ children, className, ...props }: DropdownMenuTriggerProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

// Content
export function DropdownMenuContent({ children, className, ...props }: DropdownMenuContentProps) {
  const [open, setOpen] = useState(true)

  return (
    <div
      className={clsx(
        "absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg border border-gray-200 p-1 z-50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Item
export function DropdownMenuItem({ children, className, ...props }: DropdownMenuItemProps) {
  return (
    <div
      className={clsx(
        "cursor-pointer rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
