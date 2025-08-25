"use client"

import type React from "react"

import { useState } from "react"
import { FixedSizeList as List } from "react-window"
import { TaskCard } from "./TaskCard"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

interface Task {
  id: number
  title: string
  description?: string
  status: "pending" | "processed" | "failed"
  createdAt: string
  updatedAt: string
}

interface TaskListProps {
  tasks: Task[]
  loading: boolean
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function TaskList({ tasks, loading, page, totalPages, onPageChange }: TaskListProps) {
  const [selectedTask, setSelectedTask] = useState<number | null>(null)

  // Virtualized list item renderer
  const TaskItem = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const task = tasks[index]
    if (!task) return null

    return (
      <div style={style} className="px-2 py-1">
        <TaskCard
          task={task}
          isSelected={selectedTask === task.id}
          onSelect={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
        />
      </div>
    )
  }

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading tasks...</span>
        </div>
      </Card>
    )
  }

  if (!tasks.length) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">No tasks yet</h3>
            <p className="text-muted-foreground">Create your first task to get started</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Virtualized Task List */}
      <Card className="p-4">
        <div className="h-96 w-full">
          <List
            height={384} // 96 * 4 (h-96 in pixels)
            itemCount={tasks.length}
            itemSize={120} // Height of each task card
            width="100%"
          >
            {TaskItem}
          </List>
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
