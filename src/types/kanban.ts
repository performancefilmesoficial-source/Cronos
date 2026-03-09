import { DemandStatus } from "@/lib/data"

export type Status = DemandStatus

export type Task = {
    id: string
    title: string
    client: string
    status: Status
    priority: 'Baixa' | 'Média' | 'Alta'
    dueDate?: string
    assignee?: string // URL avatar or name
}

export type Column = {
    id: Status
    title: string
}

export const KANBAN_COLUMNS: Column[] = [
    { id: 'Em andamento', title: 'Em Andamento' },
    { id: 'Aguardando aprovação', title: 'Aguardando Aprovação' },
    { id: 'Aguardando ajuste', title: 'Ajustes' },
    { id: 'Aprovado', title: 'Aprovado' },
    { id: 'Programado', title: 'Programado' },
]
