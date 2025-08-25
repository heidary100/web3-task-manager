"use client"

import { useState } from "react"
import { useWallet } from "../contexts/WalletContext"
import { useAuth } from "../hooks/useAuth"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Wallet, Shield, Zap, CheckCircle } from "lucide-react"

export function LoginPage() {
  const { isConnected, connect } = useWallet()
  const { login, loading } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async () => {
    try {
      setError(null)
      await connect()
    } catch (err) {
      setError("Failed to connect wallet")
    }
  }

  const handleLogin = async () => {
    try {
      setError(null)
      await login()
    } catch (err) {
      setError("Authentication failed. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground">Web3 Task Manager</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Secure, decentralized task management powered by blockchain technology. Connect your wallet to get
              started.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <span className="text-foreground">Wallet-only authentication</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <span className="text-foreground">Lightning-fast task processing</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-primary" />
              </div>
              <span className="text-foreground">Handle 10,000+ tasks efficiently</span>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Wallet className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
            <CardDescription>Sign in securely with your Web3 wallet to access your tasks</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {!isConnected ? (
              <Button onClick={handleConnect} className="w-full h-12 text-base" size="lg">
                <Wallet className="w-5 h-5 mr-2" />
                Connect Wallet
              </Button>
            ) : (
              <Button onClick={handleLogin} disabled={loading} className="w-full h-12 text-base" size="lg">
                {loading ? (
                  <>
                    <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    Sign Message to Login
                  </>
                )}
              </Button>
            )}

            <p className="text-xs text-muted-foreground text-center">
              By connecting your wallet, you agree to our terms of service and privacy policy.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
