import { useQuery, useMutation, useQueryClient } from "react-query"
import { tasksApi } from "../services/api"

export function useTasks(page = 1, limit = 50) {
  return useQuery(["tasks", page, limit], () => tasksApi.getTasks(page, limit), {
    keepPreviousData: true,
  })
}

export function useTask(id: number) {
  return useQuery(["task", id], () => tasksApi.getTask(id), {
    enabled: !!id,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation(tasksApi.createTask, {
    onSuccess: () => {
      queryClient.invalidateQueries(["tasks"])
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation(({ id, data }: { id: number; data: any }) => tasksApi.updateTask(id, data), {
    onSuccess: () => {
      queryClient.invalidateQueries(["tasks"])
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation(tasksApi.deleteTask, {
    onSuccess: () => {
      queryClient.invalidateQueries(["tasks"])
    },
  })
}
