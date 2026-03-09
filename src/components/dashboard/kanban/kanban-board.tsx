"use client"

import { DndContext, DragEndEvent } from "@dnd-kit/core"
import { KANBAN_COLUMNS, Status } from "@/types/kanban"
import { KanbanColumn } from "./kanban-column"
import { Demand } from "@/lib/data"

import { NewDemandDialog } from "@/components/demands/new-demand-dialog"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface KanbanBoardProps {
    demands: Demand[]
    onUpdateDemand: (updated: Demand) => void
    initialClients?: any[]
}

export function KanbanBoard({ demands, onUpdateDemand, initialClients }: KanbanBoardProps) {
    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const taskId = active.id
            const newStatus = over.id as Status

            const task = demands.find(d => d.id === taskId)
            if (task) {
                onUpdateDemand({ ...task, status: newStatus as any })
            }
        }
    }

    // Adaptar Demand para o formato do Kanban se necessário, 
    // ou apenas garantir que os subcomponentes usem Demand
    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="flex h-full gap-4 overflow-x-auto pb-4">
                {KANBAN_COLUMNS.map((column) => (
                    <KanbanColumn
                        key={column.id}
                        column={column}
                        initialClients={initialClients}
                        tasks={demands.filter((t) => t.status === column.id).map(d => ({
                            id: d.id,
                            title: d.title,
                            client: d.client,
                            status: d.status as any,
                            priority: 'Média', // Padronizado por enquanto
                            dueDate: d.date,
                            assignee: d.assignedTo || undefined
                        }))}
                    />
                ))}
            </div>
        </DndContext>
    )
}
