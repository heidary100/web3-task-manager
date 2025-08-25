import type { PropsWithChildren, HTMLAttributes } from "react"
import { clsx } from "clsx"

export function Card({ className, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return <div className={clsx("rounded-xl border bg-card text-card-foreground shadow", className)} {...props} />
}

export function CardHeader({ className, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return <div className={clsx("flex flex-col space-y-1.5 p-6", className)} {...props} />
}

export function CardTitle({ className, ...props }: PropsWithChildren<HTMLAttributes<HTMLHeadingElement>>) {
  return <h3 className={clsx("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
}

export function CardDescription({ className, ...props }: PropsWithChildren<HTMLAttributes<HTMLParagraphElement>>) {
  return <p className={clsx("text-sm text-muted-foreground", className)} {...props} />
}

export function CardContent({ className, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return <div className={clsx("p-6 pt-0", className)} {...props} />
}
