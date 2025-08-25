"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { useUpdateTask, useDeleteTask } from "../hooks/useTasks"
import { EditTaskDialog } from "./EditTaskDialog"
import { Clock, CheckCircle, AlertCircle, MoreHorizontal, Edit, Trash2, Calendar } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"

interface Task {
  id: number
  title: string
  description?: string
  status: "pending" | "processed" | "failed"
  createdAt: string
  updatedAt: string
}

interface TaskCardProps {
  task: Task
  isSelected: boolean
  onSelect: () => void
}

export function TaskCard({ task, isSelected, onSelect }: TaskCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "processed":
        return <CheckCircle className="w-4 h-4" />
      case "failed":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "processed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "failed":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask.mutateAsync(task.id)
      } catch (error) {
        console.error("Failed to delete task:", error)
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <>
      <Card
        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
          isSelected ? "ring-2 ring-primary shadow-md" : ""
        }`}
        onClick={onSelect}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{task.title}</h3>
              {task.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
              )}
            </div>

            <div className="flex items-center space-x-2 ml-4">
              <Badge className={getStatusColor(task.status)}>
                {getStatusIcon(task.status)}
                <span className="ml-1 capitalize">{task.status}</span>
              </Badge>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="w-3 h-3 mr-1" />
            Created {formatDate(task.createdAt)}
            {task.updatedAt !== task.createdAt && <span className="ml-2">• Updated {formatDate(task.updatedAt)}</span>}
          </div>
        </CardContent>
      </Card>

      <EditTaskDialog task={task} open={editDialogOpen} onOpenChange={setEditDialogOpen} />
    </>
  )
}
