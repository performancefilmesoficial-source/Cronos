export type Status = 'IDEIA' | 'COPY' | 'DESIGN' | 'LEGENDA' | 'APROVACAO' | 'AGENDADO'

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
    { id: 'IDEIA', title: 'Ideia' },
    { id: 'COPY', title: 'Copy' },
    { id: 'DESIGN', title: 'Design' },
    { id: 'LEGENDA', title: 'Legenda' },
    { id: 'APROVACAO', title: 'Aprovação' },
    { id: 'AGENDADO', title: 'Agendado' },
]

export const MOCK_TASKS: Task[] = [
    { id: 't1', title: 'Reels Lançamento', client: 'Nike', status: 'IDEIA', priority: 'Alta', dueDate: '10/02' },
    { id: 't2', title: 'Carrossel Dicas', client: 'Nike', status: 'COPY', priority: 'Média', dueDate: '12/02' },
    { id: 't3', title: 'Story Interativo', client: 'Nike', status: 'DESIGN', priority: 'Baixa', dueDate: '15/02' },
]
