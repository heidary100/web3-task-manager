"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { createAppKit } from "@reown/appkit/react"
import { EthersAdapter } from "@reown/appkit-adapter-ethers"
import { mainnet, arbitrum, polygon } from "@reown/appkit/networks"

// 1. Get projectId from https://cloud.reown.com
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || "demo-project-id"

// 2. Set the networks
const networks = [mainnet, arbitrum, polygon]

// 3. Create a metadata object - optional
const metadata = {
  name: "Web3 Task Manager",
  description: "Decentralized task management with wallet authentication",
  url: "https://web3taskmanager.com",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
}

// 4. Create Ethers adapter
const ethersAdapter = new EthersAdapter()

// 5. Create the AppKit instance
createAppKit({
  adapters: [ethersAdapter],
  networks,
  metadata,
  projectId,
  features: {
    analytics: true,
  },
})

interface WalletContextType {
  isConnected: boolean
  address: string | null
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  signMessage: (message: string) => Promise<string>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)

  const connect = async () => {
    try {
      // AppKit handles the connection UI
      const modal = document.querySelector("w3m-modal")
      if (modal) {
        modal.setAttribute("open", "true")
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    }
  }

  const disconnect = async () => {
    try {
      // AppKit handles disconnection
      setIsConnected(false)
      setAddress(null)
    } catch (error) {
      console.error("Failed to disconnect wallet:", error)
    }
  }

  const signMessage = async (message: string): Promise<string> => {
    try {
      // Get the provider from AppKit
      const provider = ethersAdapter.getProvider()
      if (!provider) throw new Error("No provider available")

      const signer = await provider.getSigner()
      return await signer.signMessage(message)
    } catch (error) {
      console.error("Failed to sign message:", error)
      throw error
    }
  }

  // Listen for account changes
  useEffect(() => {
    const handleAccountChange = (accounts: string[]) => {
      if (accounts.length > 0) {
        setAddress(accounts[0])
        setIsConnected(true)
      } else {
        setAddress(null)
        setIsConnected(false)
      }
    }

    // Listen for AppKit events
    window.addEventListener("w3m-account-change", (event: any) => {
      handleAccountChange(event.detail.accounts || [])
    })

    return () => {
      window.removeEventListener("w3m-account-change", handleAccountChange)
    }
  }, [])

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address,
        connect,
        disconnect,
        signMessage,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
