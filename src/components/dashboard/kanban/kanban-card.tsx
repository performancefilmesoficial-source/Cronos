"use client"

import { useDraggable } from "@dnd-kit/core"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Task } from "@/types/kanban"
import { GripVertical, Instagram, Play, Youtube, Facebook, Linkedin } from "lucide-react"
import { cn } from "@/lib/utils"

interface KanbanCardProps {
    task: Task
}

export function KanbanCard({ task }: KanbanCardProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
    })

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
    } : undefined

    const getSocialIcon = (type: string) => {
        const t = (type || "").toLowerCase()
        const iconClass = "w-3 h-3 text-muted-foreground/80"
        if (t.includes("instagram")) return <Instagram className={iconClass} />
        if (t.includes("tiktok")) return <Play className={iconClass} />
        if (t.includes("youtube")) return <Youtube className={iconClass} />
        if (t.includes("facebook")) return <Facebook className={iconClass} />
        if (t.includes("linkedin")) return <Linkedin className={iconClass} />
        return <Instagram className={iconClass} />
    }

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={cn(
                "group cursor-grab active:cursor-grabbing border-white/5 transition-all bg-white/[0.03] backdrop-blur-md shadow-sm rounded-xl overflow-hidden ring-1 ring-white/5",
                isDragging ? "opacity-50 border-primary/50 ring-primary/20 scale-105" : "hover:border-primary/30 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-primary/5",
                !task.assignee && "border-amber-500/20 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.05)]"
            )}
        >
            <div className={`h-1 w-full absolute top-0 left-0 bg-gradient-to-r ${task.priority === 'Alta' ? 'from-red-500/50 via-red-500 to-red-500/50' :
                task.priority === 'Média' ? 'from-amber-500/50 via-amber-500 to-amber-500/50' :
                    'from-blue-500/50 via-blue-500 to-blue-500/50'
                } opacity-50`} />

            <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0 pt-5">
                <div className="flex flex-col gap-1.5">
                    <h3 className="font-black text-[9px] uppercase tracking-[0.2em] text-white/40">{task.client}</h3>
                    <Badge
                        variant="secondary"
                        className={`text-[8px] uppercase tracking-wider font-bold px-2 py-0.5 h-auto border-0 ${task.priority === 'Alta' ? 'bg-red-500/10 text-red-400' :
                            task.priority === 'Média' ? 'bg-amber-500/10 text-amber-400' :
                                'bg-blue-500/10 text-blue-400'
                            }`}
                    >
                        {task.priority || 'Normal'}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-white/5 p-1 rounded-lg">
                        {getSocialIcon(task.title)}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded-md">
                        <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-1">
                <CardTitle className="text-sm font-semibold leading-snug mb-4 text-white/90 group-hover:text-primary transition-colors line-clamp-2">
                    {task.title}
                </CardTitle>
                <div className="flex justify-between items-center text-xs text-muted-foreground border-t border-white/5 pt-3 mt-1">
                    <div className="flex items-center gap-2">
                        {task.assignee ? (
                            null
                        ) : (
                            <div className="h-4 w-4 rounded-full border border-dashed border-white/20 bg-white/5 flex items-center justify-center">
                                <span className="text-[7px] text-zinc-500">?</span>
                            </div>
                        )}
                        <span className="text-[10px] font-medium text-white/50 truncate max-w-[80px]">
                            {task.assignee || 'Sem responsável'}
                        </span>
                    </div>
                    <span className="bg-white/5 px-2 py-0.5 rounded text-[9px] font-mono opacity-50">{task.dueDate}</span>
                </div>
            </CardContent>
        </Card>
    )
}
