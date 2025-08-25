"use client"

import { useState } from "react"
import { useAuth } from "../hooks/useAuth"
import { useTasks } from "../hooks/useTasks"
import { TaskList } from "../components/TaskList"
import { CreateTaskDialog } from "../components/CreateTaskDialog"
import { Header } from "../components/Header"
import { StatsCards } from "../components/StatsCards"
import { Button } from "../components/ui/button"
import { Plus } from "lucide-react"

export function Dashboard() {
  const { logout } = useAuth()
  const [page, setPage] = useState(1)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const { data: tasksData, isLoading, error } = useTasks(page, 50)

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Something went wrong</h2>
          <p className="text-muted-foreground">Failed to load your tasks. Please try again.</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onLogout={logout} />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Overview */}
        <StatsCards tasksData={tasksData} />

        {/* Tasks Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Your Tasks</h2>
              <p className="text-muted-foreground">
                {tasksData?.total ? `${tasksData.total} total tasks` : "No tasks yet"}
              </p>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </div>

          <TaskList
            tasks={tasksData?.tasks || []}
            loading={isLoading}
            page={page}
            totalPages={tasksData?.totalPages || 1}
            onPageChange={setPage}
          />
        </div>
      </main>

      <CreateTaskDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  )
}
