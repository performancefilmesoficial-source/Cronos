"use client"

import * as React from "react"
import { BigCalendar } from "@/components/dashboard/big-calendar"
import { PriorityList } from "@/components/dashboard/priority-list"
import { KanbanBoard } from "@/components/dashboard/kanban/kanban-board"
import { NewDemandDialog } from "@/components/demands/new-demand-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Calendar as CalendarIcon, LayoutPanelLeft, ListTodo, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Demand, DemandStatus, DataService } from "@/lib/data"

interface DashboardViewClientProps {
    initialDemands: any[]
    initialUsers: any[]
    initialClients: any[]
}

const REVERSE_STATUS_MAP: Record<string, string> = {
    "Em andamento": "EM_ANDAMENTO",
    "Aguardando aprovação": "AGUARDANDO_APROVACAO",
    "Aprovado": "APROVADO",
    "Aguardando ajuste": "AGUARDANDO_AJUSTE",
    "Programado": "PROGRAMADO"
}

const STATUS_MAP: Record<string, DemandStatus> = {
    "EM_ANDAMENTO": "Em andamento",
    "AGUARDANDO_APROVACAO": "Aguardando aprovação",
    "APROVADO": "Aprovado",
    "AGUARDANDO_AJUSTE": "Aguardando ajuste",
    "PROGRAMADO": "Programado"
}

export function DashboardViewClient({ initialDemands, initialUsers, initialClients }: DashboardViewClientProps) {
    React.useEffect(() => {
        if (initialUsers) {
            DataService.setUsers(initialUsers)
        }
    }, [initialUsers])

    const [demands, setDemands] = React.useState<Demand[]>(initialDemands.map(d => ({
        id: d.id,
        client: d.client?.name || "Sem Cliente",
        title: d.title,
        type: d.type,
        status: STATUS_MAP[d.status] || "Em andamento",
        date: new Date(d.date).toISOString().split('T')[0],
        day: new Date(d.date).getDate(),
        assignedTo: d.assignedTo?.name || null
    })))
    const [searchTerm, setSearchTerm] = React.useState("")

    const filteredDemands = demands.filter(d =>
        d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.client.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleUpdateDemand = async (updated: Demand) => {
        setDemands(prev => prev.map(d => d.id === updated.id ? updated : d))

        // Find user by name to get correct ID
        const matchedUser = initialUsers.find(u => u.name === updated.assignedTo)

        // Convert data back for the API
        const apiPayload = {
            id: updated.id,
            status: REVERSE_STATUS_MAP[updated.status as string] || updated.status,
            assignedToId: matchedUser?.id || null,
            // Keep other fields if they changed in a popup
            theme: updated.theme,
            briefing: updated.briefing,
            mediaUrl: updated.mediaUrl
        }

        try {
            await DataService.updateDemand(apiPayload as any)
        } catch (error) {
            console.error("Failed to update demand:", error)
        }
    }

    return (
        <div className="flex flex-1 h-screen overflow-hidden">
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Header with Search and Tabs */}
                <div className="p-8 pb-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">Task Geral</h1>
                            <p className="text-muted-foreground text-sm mt-1">Gerencie seu fluxo de trabalho multidisciplinar.</p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar demandas..."
                                    className="pl-9 bg-white/[0.03] border-white/5 focus:border-primary/50 rounded-xl h-10 transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <Tabs defaultValue="calendar" className="w-full">
                        <div className="flex items-center justify-between pb-4">
                            <TabsList className="bg-transparent h-auto p-0 gap-3 rounded-none border-none">
                                <TabsTrigger
                                    value="calendar"
                                    className="data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-600/20 bg-white/[0.03] text-muted-foreground hover:bg-white/[0.08] hover:text-white rounded-xl h-9 px-6 text-[10px] font-bold uppercase tracking-widest transition-all gap-2 border-0 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:outline-none"
                                >
                                    <CalendarIcon className="h-3.5 w-3.5" />
                                    Calendário
                                </TabsTrigger>
                                <TabsTrigger
                                    value="kanban"
                                    className="data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-600/20 bg-white/[0.03] text-muted-foreground hover:bg-white/[0.08] hover:text-white rounded-xl h-9 px-6 text-[10px] font-bold uppercase tracking-widest transition-all gap-2 border-0 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:outline-none"
                                >
                                    <LayoutPanelLeft className="h-3.5 w-3.5" />
                                    Kanban
                                </TabsTrigger>
                                <TabsTrigger
                                    value="priority"
                                    className="xl:hidden data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-600/20 bg-white/[0.03] text-muted-foreground hover:bg-white/[0.08] hover:text-white rounded-xl h-9 px-6 text-[10px] font-bold uppercase tracking-widest transition-all gap-2 border-0 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:outline-none"
                                >
                                    <ListTodo className="h-3.5 w-3.5" />
                                    Prioridades
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 mt-6 overflow-hidden">
                            <TabsContent value="calendar" className="mt-0 h-[calc(100vh-280px)] focus-visible:ring-0">
                                <div className="h-full bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden">
                                    <BigCalendar
                                        demands={filteredDemands}
                                        onUpdateDemand={handleUpdateDemand}
                                        initialClients={initialClients}
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="kanban" className="mt-0 h-[calc(100vh-280px)] focus-visible:ring-0">
                                <div className="h-full bg-white/[0.02] rounded-2xl border border-white/5 p-6 overflow-y-auto">
                                    <KanbanBoard
                                        demands={filteredDemands}
                                        onUpdateDemand={handleUpdateDemand}
                                        initialClients={initialClients}
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="priority" className="xl:hidden mt-0 h-[calc(100vh-280px)] focus-visible:ring-0">
                                <div className="h-full bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden">
                                    <PriorityList demands={filteredDemands} onUpdate={handleUpdateDemand} />
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </main>

            {/* Aside for Priority List (Desktop) */}
            <aside className="hidden xl:block w-[350px] h-screen shrink-0 border-l border-white/5 bg-black/20 backdrop-blur-xl">
                <PriorityList demands={filteredDemands} onUpdate={handleUpdateDemand} />
            </aside>
        </div>
    )
}
