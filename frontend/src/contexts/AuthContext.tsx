"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useWallet } from "./WalletContext"
import { authApi } from "../services/api"

interface AuthContextType {
  isAuthenticated: boolean
  token: string | null
  login: () => Promise<void>
  logout: () => void
  loading: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { isConnected, address, signMessage } = useWallet()

  const login = async () => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected")
    }

    setLoading(true)
    try {
      // 1. Get nonce from backend
      const { nonce } = await authApi.getNonce(address)

      // 2. Sign the message
      const message = `Sign this message to authenticate: ${nonce}`
      const signature = await signMessage(message)

      // 3. Verify signature and get JWT
      const { access_token } = await authApi.verifySignature({
        address,
        signature,
        nonce,
      })

      setToken(access_token)
      setIsAuthenticated(true)
      localStorage.setItem("auth_token", access_token)
    } catch (error) {
      console.error("Authentication failed:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setToken(null)
    setIsAuthenticated(false)
    localStorage.removeItem("auth_token")
  }

  // Check for existing token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("auth_token")
    if (savedToken) {
      setToken(savedToken)
      setIsAuthenticated(true)
    }
  }, [])

  // Logout when wallet disconnects
  useEffect(() => {
    if (!isConnected && isAuthenticated) {
      logout()
    }
  }, [isConnected, isAuthenticated])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        token,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
