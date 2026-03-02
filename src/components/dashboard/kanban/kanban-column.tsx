"use client"

import { useDroppable } from "@dnd-kit/core"
import { Column, Task } from "@/types/kanban"
import { KanbanCard } from "./kanban-card"

interface KanbanColumnProps {
    column: Column
    tasks: Task[]
}

export function KanbanColumn({ column, tasks }: KanbanColumnProps) {
    const { setNodeRef } = useDroppable({
        id: column.id,
    })

    return (
        <div className="flex flex-col gap-2 min-w-[280px] h-full">
            <div className="flex items-center justify-between px-4 py-3 bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl mb-2 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.2)] ${column.title === 'Ideia' ? 'bg-zinc-400 shadow-zinc-400/50' :
                        column.title === 'Aprovação' ? 'bg-amber-400 shadow-amber-400/50' :
                            column.title === 'Agendado' ? 'bg-emerald-500 shadow-emerald-500/50' :
                                'bg-primary shadow-primary/50'
                        }`} />
                    <h3 className="font-bold text-sm tracking-wide text-white/90">{column.title}</h3>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                    {tasks.length}
                </span>
            </div>

            <div
                ref={setNodeRef}
                className="flex-1 bg-white/[0.02] rounded-2xl p-2 flex flex-col gap-3 min-h-[500px] border border-transparent transition-colors shadow-inner shadow-black/20"
            >
                {tasks.map((task) => (
                    <KanbanCard key={task.id} task={task} />
                ))}
                {tasks.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-xl opacity-50 gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">Sem tarefas</p>
                    </div>
                )}
            </div>
        </div>
    )
}
