"use client"

import { useWallet } from "../contexts/WalletContext"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { LogOut, Wallet, User } from "lucide-react"

interface HeaderProps {
  onLogout: () => void
}

export function Header({ onLogout }: HeaderProps) {
  const { address, disconnect } = useWallet()

  const handleLogout = async () => {
    await disconnect()
    onLogout()
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">Task Manager</h1>
          </div>

          <div className="flex items-center gap-4">
            {address && (
              <Card className="px-3 py-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground font-mono">{formatAddress(address)}</span>
                </div>
              </Card>
            )}

            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
