"use client"

import { useDraggable } from "@dnd-kit/core"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Task } from "@/types/kanban"
import { GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"

interface KanbanCardProps {
    task: Task
}

export function KanbanCard({ task }: KanbanCardProps) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: task.id,
        disabled: !task.assignee
    })

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={cn(
                "group cursor-grab active:cursor-grabbing border-white/5 transition-all bg-background/60 backdrop-blur-md shadow-sm rounded-xl overflow-hidden ring-1 ring-white/5",
                !task.assignee ? "border-red-500/50 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.1)] cursor-not-allowed opacity-90" : "hover:border-primary/30 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-primary/5"
            )}
        >
            <div className={`h-1 w-full absolute top-0 left-0 bg-gradient-to-r ${task.priority === 'Alta' ? 'from-red-500/50 via-red-500 to-red-500/50' :
                task.priority === 'Média' ? 'from-amber-500/50 via-amber-500 to-amber-500/50' :
                    'from-blue-500/50 via-blue-500 to-blue-500/50'
                } opacity-50`} />

            <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0 pt-5">
                <Badge
                    variant="secondary"
                    className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 h-auto border-0 ${task.priority === 'Alta' ? 'bg-red-500/10 text-red-400' :
                        task.priority === 'Média' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-blue-500/10 text-blue-400'
                        }`}
                >
                    {task.priority}
                </Badge>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded-md">
                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-1">
                <CardTitle className="text-sm font-semibold leading-snug mb-3 text-white/90 group-hover:text-primary transition-colors">
                    {task.title}
                </CardTitle>
                <div className="flex justify-between items-end text-xs text-muted-foreground border-top border-white/5 pt-3 mt-1">
                    <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-[8px] font-bold text-white border border-white/10">
                            SF
                        </div>
                        <span className="font-medium text-white/50">{task.client}</span>
                    </div>
                    <span className="bg-white/5 px-2 py-0.5 rounded text-[10px] font-mono opacity-70">{task.dueDate}</span>
                </div>
            </CardContent>
        </Card>
    )
}
