"use client"
import { AuthProvider } from "./contexts/AuthContext"
import { WalletProvider } from "./contexts/WalletContext"
import { LoginPage } from "./pages/LoginPage"
import { Dashboard } from "./pages/Dashboard"
import { useAuth } from "./hooks/useAuth"

function AppContent() {
  const { isAuthenticated } = useAuth() as { isAuthenticated: boolean }

  return <div className="min-h-screen bg-background">{isAuthenticated ? <Dashboard /> : <LoginPage />}</div>
}

function App() {
  return (
    <WalletProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </WalletProvider>
  )
}

export default App
