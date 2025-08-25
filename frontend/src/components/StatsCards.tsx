import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { CheckCircle, Clock, AlertCircle, BarChart3 } from "lucide-react"

interface StatsCardsProps {
  tasksData?: {
    tasks: Array<{ status: string }>
    total: number
  }
}

export function StatsCards({ tasksData }: StatsCardsProps) {
  const stats = {
    total: tasksData?.total || 0,
    pending: tasksData?.tasks.filter((t) => t.status === "pending").length || 0,
    processed: tasksData?.tasks.filter((t) => t.status === "processed").length || 0,
    failed: tasksData?.tasks.filter((t) => t.status === "failed").length || 0,
  }

  const cards = [
    {
      title: "Total Tasks",
      value: stats.total,
      icon: BarChart3,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      title: "Processed",
      value: stats.processed,
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      title: "Failed",
      value: stats.failed,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            <div className={`w-8 h-8 rounded-full ${card.bgColor} flex items-center justify-center`}>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
