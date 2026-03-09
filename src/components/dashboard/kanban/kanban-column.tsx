"use client"

import { useDroppable } from "@dnd-kit/core"
import { Column, Task } from "@/types/kanban"
import { KanbanCard } from "./kanban-card"
import { cn } from "@/lib/utils"
import { NewDemandDialog } from "@/components/demands/new-demand-dialog"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface KanbanColumnProps {
    column: Column
    tasks: Task[]
    initialClients?: any[]
}

export function KanbanColumn({ column, tasks, initialClients }: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: column.id,
    })

    const getStatusColor = (title: string) => {
        switch (title) {
            case 'Em Andamento': return 'bg-blue-500 shadow-blue-500/50'
            case 'Aguardando Aprovação': return 'bg-amber-500 shadow-amber-500/50'
            case 'Ajustes': return 'bg-rose-500 shadow-rose-500/50'
            case 'Aprovado': return 'bg-emerald-500 shadow-emerald-500/50'
            case 'Programado': return 'bg-primary shadow-primary/50'
            default: return 'bg-zinc-400 shadow-zinc-400/50'
        }
    }

    return (
        <div className="flex flex-col gap-2 min-w-[300px] h-full">
            <div className="flex items-center justify-between px-4 py-3 bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl mb-2 shadow-sm group/column">
                <div className="flex items-center gap-3">
                    <div className={cn("w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.2)]", getStatusColor(column.title))} />
                    <h3 className="font-bold text-[11px] uppercase tracking-widest text-white/80">{column.title}</h3>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                    {tasks.length}
                </span>
            </div>

            <div
                ref={setNodeRef}
                className={cn(
                    "flex-1 bg-white/[0.02] rounded-2xl p-3 flex flex-col gap-4 min-h-[500px] border border-transparent transition-all duration-200 outline-none ring-0",
                    isOver ? "bg-white/[0.05] border-primary/20 scale-[0.99] shadow-inner" : "shadow-inner shadow-black/20"
                )}
            >
                {tasks.map((task) => (
                    <KanbanCard key={task.id} task={task} />
                ))}
                {tasks.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl opacity-30 gap-3 py-12">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
                        </div>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Vazio</p>
                    </div>
                )}
            </div>
        </div>
    )
}
