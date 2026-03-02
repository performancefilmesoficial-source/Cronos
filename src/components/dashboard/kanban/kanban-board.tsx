"use client"

import { useState } from "react"
import { DndContext, DragEndEvent } from "@dnd-kit/core"
import { KANBAN_COLUMNS, MOCK_TASKS, Task, Status } from "@/types/kanban"
import { KanbanColumn } from "./kanban-column"

export function KanbanBoard() {
    const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS)

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event

        if (over && active.id !== over.id) {
            // If dropped over a column (droppable container)
            const taskId = active.id
            const newStatus = over.id as Status

            setTasks((prev) =>
                prev.map((task) =>
                    task.id === taskId ? { ...task, status: newStatus } : task
                )
            )
        }
    }

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="flex h-full gap-4 overflow-x-auto pb-4">
                {KANBAN_COLUMNS.map((column) => (
                    <KanbanColumn
                        key={column.id}
                        column={column}
                        tasks={tasks.filter((t) => t.status === column.id)}
                    />
                ))}
            </div>
        </DndContext>
    )
}
