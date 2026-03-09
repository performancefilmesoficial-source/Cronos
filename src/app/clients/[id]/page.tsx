"use client"

import { useParams } from "next/navigation"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Plus, Settings, Users, Link as LinkIcon, Send, Sparkles, Filter, ChevronLeft, ChevronRight, Calendar as CalendarIcon, FileText, LayoutGrid, Palette, GripVertical, Inbox, Pencil, Rocket } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DataService, Demand } from "@/lib/data"
import { NewDemandDialog } from "@/components/demands/new-demand-dialog"
import { NewClientDialog } from "@/components/clients/new-client-dialog"
import { DemandDetailPopup } from "@/components/dashboard/demand-detail-popup"
import { useEffect, useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { getServiceColor, SERVICE_TYPES } from "@/lib/services"
import { ClientDemandCard } from "@/components/demands/client-demand-card"
import { BrandingTab } from "@/components/clients/branding-tab"
import { CompetitorsTab } from "@/components/clients/competitors-tab"

const MONTH_NAMES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

function getCalendarDays(year: number, month: number) {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    const cells: { day: number; currentMonth: boolean }[] = []

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        cells.push({ day: daysInPrevMonth - i, currentMonth: false })
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        cells.push({ day: i, currentMonth: true })
    }
    // Next month days to fill the grid (always 6 rows = 42 cells)
    const remaining = 42 - cells.length
    for (let i = 1; i <= remaining; i++) {
        cells.push({ day: i, currentMonth: false })
    }
    return cells
}

function getWeekDays(year: number, month: number, referenceDay: number) {
    const date = new Date(year, month, referenceDay)
    const dayOfWeek = date.getDay()
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - dayOfWeek)

    const days: { day: number; month: number; year: number; currentMonth: boolean }[] = []
    for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek)
        d.setDate(startOfWeek.getDate() + i)
        days.push({
            day: d.getDate(),
            month: d.getMonth(),
            year: d.getFullYear(),
            currentMonth: d.getMonth() === month
        })
    }
    return days
}

export default function ClientWorkflowPage() {
    const params = useParams()
    const [client, setClient] = useState<any>({ id: "", name: "Carregando...", logo: "", industry: "", activeContract: true })
    const [demands, setDemands] = useState<Demand[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [activeTab, setActiveTab] = useState("conteudo")
    const [draggedDemand, setDraggedDemand] = useState<Demand | null>(null)
    const [dragOverDay, setDragOverDay] = useState<number | null>(null)
    const [viewMode, setViewMode] = useState<"month" | "week">("month")
    const [selectedSchedulerDemand, setSelectedSchedulerDemand] = useState<Demand | null>(null)

    const now = new Date()
    const [currentMonth, setCurrentMonth] = useState(now.getMonth())
    const [currentYear, setCurrentYear] = useState(now.getFullYear())
    const [weekRef, setWeekRef] = useState(now.getDate())

    useEffect(() => {
        const savedClients = localStorage.getItem("sf-clients")
        if (savedClients) {
            try {
                const parsed = JSON.parse(savedClients)
                const found = parsed.find((c: any) => c.id === params.id)
                if (found) setClient(found)
            } catch (e) {
                console.error(e)
            }
        }

        const loadData = async () => {
            const allDemands = await DataService.getDemands()
            const clientDemands = allDemands.filter(d => d.client === client.name)
            setDemands(clientDemands)

            // Load client if not set
            if (!client.id || client.id === "") {
                const res = await fetch(`/api/clients/${params.id}`)
                if (res.ok) {
                    const data = await res.json()
                    setClient(data)
                }
            }
        }
        loadData()

        window.addEventListener("sf-data-change", loadData)
        return () => window.removeEventListener("sf-data-change", loadData)
    }, [params.id, client.name])

    const calendarDays = useMemo(() => getCalendarDays(currentYear, currentMonth), [currentYear, currentMonth])
    const weekDays = useMemo(() => getWeekDays(currentYear, currentMonth, weekRef), [currentYear, currentMonth, weekRef])

    const unscheduledDemands = demands.filter(d => !d.day)
    const scheduledDemands = demands.filter(d => d.day)

    // Navigation
    const goNextMonth = () => {
        if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
        else setCurrentMonth(m => m + 1)
    }
    const goPrevMonth = () => {
        if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
        else setCurrentMonth(m => m - 1)
    }
    const goNextWeek = () => {
        const d = new Date(currentYear, currentMonth, weekRef + 7)
        setWeekRef(d.getDate())
        setCurrentMonth(d.getMonth())
        setCurrentYear(d.getFullYear())
    }
    const goPrevWeek = () => {
        const d = new Date(currentYear, currentMonth, weekRef - 7)
        setWeekRef(d.getDate())
        setCurrentMonth(d.getMonth())
        setCurrentYear(d.getFullYear())
    }

    // Drag and Drop
    const handleDragStart = (demand: Demand) => setDraggedDemand(demand)
    const handleDragOver = (e: React.DragEvent, day: number | null) => {
        e.preventDefault()
        if (day) setDragOverDay(day)
    }
    const fetchDemands = () => {
        if (!client) return
        const allDemands = DataService.getDemands()
        const clientDemands = allDemands.filter(d => d.client === client.name)
        setDemands(clientDemands)
    }

    const updateDemand = (updated: Demand) => {
        DataService.updateDemand(updated)
        fetchDemands()
    }

    const updateClient = (updatedClient: any) => {
        setClient(updatedClient)
        // Persistence
        const savedClients = localStorage.getItem("sf-clients")
        if (savedClients) {
            try {
                const parsed = JSON.parse(savedClients)
                const index = parsed.findIndex((c: any) => c.id === updatedClient.id)
                if (index !== -1) {
                    parsed[index] = updatedClient
                    localStorage.setItem("sf-clients", JSON.stringify(parsed))
                    // Dispatch event for other components like layout/sidebar
                    window.dispatchEvent(new Event("sf-data-change"))
                }
            } catch (e) {
                console.error(e)
            }
        }
    }

    const handleDrop = (e: React.DragEvent, day: number) => {
        e.preventDefault()
        setDragOverDay(null)
        if (!draggedDemand) return
        const updated = { ...draggedDemand, day, date: `${String(day).padStart(2, '0')} ${MONTH_NAMES[currentMonth].substring(0, 3)}` }
        updateDemand(updated)
        setDraggedDemand(null)
        toast.success("Conteúdo agendado", { description: `"${updated.title}" movido para o dia ${day}.` })
    }
    const handleDragEnd = () => { setDraggedDemand(null); setDragOverDay(null) }
    const handleDropBacklog = (e: React.DragEvent) => {
        e.preventDefault()
        if (!draggedDemand) return
        const updated = { ...draggedDemand, day: undefined, date: "Sem data" }
        updateDemand(updated)
        setDraggedDemand(null)
        toast.info("Conteúdo removido do calendário", { description: `"${updated.title}" voltou para o backlog.` })
    }

    const today = now.getDate()
    const isToday = (day: number, isCurrentMonth: boolean) =>
        isCurrentMonth && day === today && currentMonth === now.getMonth() && currentYear === now.getFullYear()

    return (
        <div className="flex h-screen w-full bg-[#0a0a0a] text-foreground overflow-hidden font-sans">
            <SidebarNav />
            <main className="flex-1 overflow-hidden bg-transparent p-5 relative z-10 flex flex-col gap-3">

                {/* Header */}
                <div className="rounded-xl border border-white/5 bg-[#111] p-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                            {client.logo ? (
                                <img src={client.logo} alt={client.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold">
                                    {client.name?.[0] || "C"}
                                </div>
                            )}
                        </div>
                        <div>
                            <h1 className="text-lg font-bold leading-tight">{client.name}</h1>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span>{client.handle || "@usuario"}</span>
                                <span className="text-zinc-700">•</span>
                                <span className="text-zinc-500">{client.industry}</span>
                                <Badge className={cn("border-none h-4 text-[9px] px-1.5", client.activeContract ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400")}>
                                    {client.activeContract ? "Ativo" : "Inativo"}
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-1.5">
                        <NewClientDialog editClient={client as any} onClientCreate={updateClient}>
                            <Button variant="outline" size="sm" className="h-8 gap-2 bg-white/5 border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white transition-all">
                                <Pencil className="h-3 w-3" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Editar Perfil</span>
                            </Button>
                        </NewClientDialog>
                    </div>
                </div>

                {/* Tabs + Controls row */}
                <div className="flex items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-1.5">
                        {[
                            { id: "conteudo", icon: FileText, label: "Conteúdo" },
                            { id: "branding", icon: Palette, label: "Branding" },
                            { id: "concorrencia", icon: Users, label: "Concorrência" },
                            { id: "agendador", icon: Rocket, label: "Agendador" },
                        ].map((item) => (
                            <Button
                                key={item.id}
                                variant={activeTab === item.id ? "default" : "ghost"}
                                size="sm"
                                className={cn(
                                    "h-8 px-3 gap-1.5 rounded-lg text-[11px] font-medium",
                                    activeTab === item.id
                                        ? "bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20"
                                        : "text-zinc-500 hover:text-white hover:bg-white/5"
                                )}
                                onClick={() => setActiveTab(item.id)}
                            >
                                <item.icon className="h-3 w-3" />
                                {item.label}
                            </Button>
                        ))}
                    </div>

                    {/* Month/Week nav + stats */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon-xs" className="text-zinc-500 hover:text-white" onClick={viewMode === "month" ? goPrevMonth : goPrevWeek}>
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </Button>
                            <span className="text-xs font-bold min-w-[130px] text-center">
                                {viewMode === "month"
                                    ? `${MONTH_NAMES[currentMonth]} ${currentYear}`
                                    : (() => {
                                        const w = weekDays
                                        return `${w[0].day} - ${w[6].day} ${MONTH_NAMES[w[6].month].substring(0, 3)} ${w[6].year}`
                                    })()
                                }
                            </span>
                            <Button variant="ghost" size="icon-xs" className="text-zinc-500 hover:text-white" onClick={viewMode === "month" ? goNextMonth : goNextWeek}>
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>

                        <div className="h-5 w-px bg-white/10" />

                        <div className="flex gap-3 text-[10px] font-medium">
                            <div className="flex items-center gap-1"><span className="font-bold text-zinc-500">{demands.length}</span><span className="text-zinc-600">Total</span></div>
                            <div className="flex items-center gap-1"><span className="font-bold text-amber-500">{demands.filter(d => d.status === "Aguardando aprovação").length}</span><span className="text-zinc-600">Aprov.</span></div>
                            <div className="flex items-center gap-1"><span className="font-bold text-red-500">{demands.filter(d => d.status === "Aguardando ajuste").length}</span><span className="text-zinc-600">Ajuste</span></div>
                            <div className="flex items-center gap-1"><span className="font-bold text-emerald-500">{demands.filter(d => d.status === "Aprovado").length}</span><span className="text-zinc-600">OK</span></div>
                            <div className="flex items-center gap-1"><span className="font-bold text-primary">{demands.filter(d => d.status === "Programado").length}</span><span className="text-zinc-600">Programados</span></div>
                        </div>

                        <div className="h-5 w-px bg-white/10" />

                        <div className="flex bg-[#111] rounded-md border border-white/5 p-0.5">
                            <Button
                                size="sm"
                                variant="ghost"
                                className={cn("h-6 text-[10px] px-2.5 font-medium rounded-sm", viewMode === "week" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white")}
                                onClick={() => { setViewMode("week"); setWeekRef(today) }}
                            >
                                Semanal
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className={cn("h-6 text-[10px] px-2.5 font-medium rounded-sm", viewMode === "month" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white")}
                                onClick={() => setViewMode("month")}
                            >
                                Mensal
                            </Button>
                        </div>

                        <NewDemandDialog clientId={client.id} clientName={client.name}>
                            <Button size="sm" className="h-8 bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 text-[11px]">
                                <Plus className="mr-1 h-3 w-3" />
                                Novo Conteúdo
                            </Button>
                        </NewDemandDialog>
                    </div>
                </div>

                {/* Main content area — fills remaining height */}
                <div className="flex gap-3 flex-1 min-h-0">
                    {activeTab === "conteudo" ? (
                        <>
                            {/* Calendar */}
                            <div className="flex-1 rounded-xl border border-white/5 bg-[#111] overflow-hidden flex flex-col min-w-0">
                                {/* Day headers */}
                                <div className="grid grid-cols-7 border-b border-white/5 shrink-0">
                                    {DAY_NAMES.map(day => (
                                        <div key={day} className="py-2 text-center text-[10px] font-semibold text-zinc-500 uppercase tracking-wider bg-white/[0.02]">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar body */}
                                {viewMode === "month" ? (
                                    <div className="grid grid-cols-7 flex-1">
                                        {calendarDays.map((cell, i) => {
                                            const dayDemands = cell.currentMonth
                                                ? scheduledDemands.filter(d => d.day === cell.day && (searchTerm === "" || d.title.toLowerCase().includes(searchTerm.toLowerCase())))
                                                : []

                                            return (
                                                <div
                                                    key={i}
                                                    className={cn(
                                                        "border-b border-r border-white/5 p-1.5 relative group transition-colors flex flex-col",
                                                        !cell.currentMonth && "bg-white/[0.01]",
                                                        cell.currentMonth && "hover:bg-white/[0.02]",
                                                        dragOverDay === cell.day && cell.currentMonth && "bg-primary/10 border-primary/30"
                                                    )}
                                                    onDragOver={(e) => cell.currentMonth ? handleDragOver(e, cell.day) : undefined}
                                                    onDragLeave={() => setDragOverDay(null)}
                                                    onDrop={(e) => cell.currentMonth ? handleDrop(e, cell.day) : undefined}
                                                >
                                                    <div className="flex items-center justify-between shrink-0 mb-1">
                                                        <span className={cn(
                                                            "text-[10px] font-medium inline-flex h-5 w-5 items-center justify-center rounded-full shrink-0",
                                                            !cell.currentMonth && "text-zinc-700",
                                                            cell.currentMonth && "text-zinc-500",
                                                            isToday(cell.day, cell.currentMonth) && "bg-primary text-white font-bold"
                                                        )}>
                                                            {cell.day}
                                                        </span>
                                                        {cell.currentMonth && (
                                                            <NewDemandDialog
                                                                clientId={client.id}
                                                                clientName={client.name}
                                                                defaultDay={cell.day}
                                                                defaultMonth={currentMonth}
                                                                defaultYear={currentYear}
                                                            >
                                                                <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-primary hover:bg-primary/10 p-0">
                                                                    <Plus className="h-3 w-3" />
                                                                </Button>
                                                            </NewDemandDialog>
                                                        )}
                                                    </div>

                                                    {cell.currentMonth && (
                                                        <div className="mt-0.5 space-y-1 overflow-y-auto flex-1 min-h-0">
                                                            {dayDemands.map(demand => (
                                                                <ClientDemandCard
                                                                    key={demand.id}
                                                                    demand={demand}
                                                                    onUpdate={(updated) => updateDemand(updated)}
                                                                    draggable
                                                                    onDragStart={() => handleDragStart(demand)}
                                                                    onDragEnd={handleDragEnd}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}

                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    /* WEEK VIEW */
                                    <div className="grid grid-cols-7 flex-1">
                                        {weekDays.map((cell, i) => {
                                            const dayDemands = cell.currentMonth
                                                ? scheduledDemands.filter(d => d.day === cell.day && (searchTerm === "" || d.title.toLowerCase().includes(searchTerm.toLowerCase())))
                                                : []

                                            return (
                                                <div
                                                    key={i}
                                                    className={cn(
                                                        "border-r border-white/5 p-2 relative group transition-colors flex flex-col",
                                                        !cell.currentMonth && "bg-white/[0.01]",
                                                        cell.currentMonth && "hover:bg-white/[0.02]",
                                                        dragOverDay === cell.day && cell.currentMonth && "bg-primary/10 border-primary/30"
                                                    )}
                                                    onDragOver={(e) => cell.currentMonth ? handleDragOver(e, cell.day) : undefined}
                                                    onDragLeave={() => setDragOverDay(null)}
                                                    onDrop={(e) => cell.currentMonth ? handleDrop(e, cell.day) : undefined}
                                                >
                                                    <div className="flex items-center justify-between gap-1.5 mb-2 shrink-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className={cn(
                                                                "text-xs font-bold inline-flex h-7 w-7 items-center justify-center rounded-full",
                                                                !cell.currentMonth && "text-zinc-700",
                                                                cell.currentMonth && "text-zinc-400",
                                                                isToday(cell.day, cell.currentMonth) && "bg-primary text-white"
                                                            )}>
                                                                {cell.day}
                                                            </span>
                                                            <span className="text-[10px] text-zinc-600">{DAY_NAMES[i]}</span>
                                                        </div>
                                                        {cell.currentMonth && (
                                                            <NewDemandDialog
                                                                clientId={client.id}
                                                                clientName={client.name}
                                                                defaultDay={cell.day}
                                                                defaultMonth={cell.month}
                                                                defaultYear={cell.year}
                                                            >
                                                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-primary hover:bg-primary/10 p-0">
                                                                    <Plus className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </NewDemandDialog>
                                                        )}
                                                    </div>

                                                    <div className="flex-1 space-y-2 overflow-y-auto">
                                                        {dayDemands.map(demand => (
                                                            <ClientDemandCard
                                                                key={demand.id}
                                                                demand={demand}
                                                                onUpdate={(updated) => updateDemand(updated)}
                                                                draggable
                                                                onDragStart={() => handleDragStart(demand)}
                                                                onDragEnd={handleDragEnd}
                                                            />
                                                        ))}
                                                    </div>

                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Backlog Sidebar */}
                            <div
                                className="w-[240px] shrink-0 rounded-xl border border-white/5 bg-[#111] flex flex-col overflow-hidden"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDropBacklog}
                            >
                                <div className="p-3 border-b border-white/5 flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-2">
                                        <Inbox className="h-3.5 w-3.5 text-primary" />
                                        <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Conteúdos Extras</h3>
                                    </div>
                                    <Badge variant="secondary" className="bg-white/5 text-[10px] h-5 text-zinc-500">
                                        {unscheduledDemands.length}
                                    </Badge>
                                </div>

                                <p className="text-[9px] text-zinc-600 px-3 py-2 border-b border-white/5 shrink-0">
                                    Crie conteúdos extras e arraste para o calendário
                                </p>

                                <div className="p-2 border-b border-white/5 shrink-0">
                                    <NewDemandDialog
                                        clientId={client.id}
                                        clientName={client.name}
                                        unscheduled
                                        onSuccess={() => {
                                            // Refresh logic if needed, but DataService usually triggers event
                                        }}
                                    >
                                        <Button className="w-full h-8 text-[10px] font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-primary border border-primary/20">
                                            <Plus className="w-3 h-3 mr-1.5" />
                                            Novo Conteúdo Extra
                                        </Button>
                                    </NewDemandDialog>
                                </div>

                                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                    {unscheduledDemands.length > 0 ? (
                                        <div className="space-y-2">
                                            {unscheduledDemands.map(demand => (
                                                <ClientDemandCard
                                                    key={demand.id}
                                                    demand={demand}
                                                    onUpdate={(updated) => updateDemand(updated)}
                                                    draggable
                                                    onDragStart={() => handleDragStart(demand)}
                                                    onDragEnd={handleDragEnd}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-6 text-center">
                                            <Inbox className="h-5 w-5 text-zinc-700 mb-2" />
                                            <p className="text-[10px] text-zinc-600">Nenhum conteúdo</p>
                                            <p className="text-[9px] text-zinc-700">pendente</p>
                                        </div>
                                    )}
                                </div>

                            </div>
                        </>
                    ) : activeTab === "branding" ? (
                        <BrandingTab client={client as any} onUpdate={updateClient} />
                    ) : activeTab === "concorrencia" ? (
                        <CompetitorsTab client={client as any} onUpdate={updateClient} />
                    ) : activeTab === "agendador" ? (
                        <div className="flex-1 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-500 overflow-y-auto pr-2">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                        <Rocket className="h-5 w-5 text-primary" />
                                        Fila de Agendamento
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Selecione os conteúdos aprovados para programar nas redes sociais.
                                    </p>
                                </div>
                                <Badge variant="outline" className="h-6 bg-primary/10 text-primary border-primary/20">
                                    {demands.filter(d => d.status === "Aprovado").length} Conteúdo(s) Pronto(s)
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
                                {demands.filter(d => d.status === "Aprovado").length > 0 ? (
                                    demands.filter(d => d.status === "Aprovado").map(demand => (
                                        <div
                                            key={demand.id}
                                            className="group bg-[#111] border border-white/5 rounded-2xl p-4 hover:border-primary/30 transition-all hover:bg-[#121212] overflow-hidden relative cursor-pointer"
                                            onClick={() => setSelectedSchedulerDemand(demand)}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <Badge variant="outline" className="text-[9px] uppercase tracking-tighter bg-emerald-500/10 text-emerald-400 border-none">
                                                    {demand.status}
                                                </Badge>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-primary/20 text-primary">
                                                    <CalendarIcon className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>

                                            <div className="space-y-2">
                                                <h4 className="font-bold text-sm text-white line-clamp-2 leading-tight h-10">{demand.title}</h4>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Badge variant="secondary" className="bg-white/5 text-[9px] uppercase">{demand.type}</Badge>
                                                    <span className="text-[10px]">•</span>
                                                    <span>{demand.date || "Sem data"}</span>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex gap-2">
                                                <Button
                                                    size="sm"
                                                    className="w-full text-[10px] font-bold h-8 bg-primary hover:bg-primary/90 text-white gap-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setSelectedSchedulerDemand(demand)
                                                    }}
                                                >
                                                    <Rocket className="h-3 w-3" />
                                                    PROGRAMAR AGORA
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-16 flex flex-col items-center justify-center text-center space-y-4 bg-white/5 border border-dashed border-white/10 rounded-3xl">
                                        <div className="h-16 w-16 rounded-full bg-zinc-900 flex items-center justify-center border border-white/5">
                                            <Inbox className="h-8 w-8 text-zinc-700" />
                                        </div>
                                        <div className="max-w-xs">
                                            <h4 className="font-bold text-lg">Nenhum aprovado</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Aguarde a aprovação do cliente para que os conteúdos apareçam aqui.
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setActiveTab("conteudo")}
                                            className="text-[11px]"
                                        >
                                            Ir para Calendário
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {selectedSchedulerDemand && (
                                <DemandDetailPopup
                                    demand={selectedSchedulerDemand}
                                    isOpen={!!selectedSchedulerDemand}
                                    onOpenChange={(open: boolean) => !open && setSelectedSchedulerDemand(null)}
                                    onUpdate={(updated: Demand) => {
                                        updateDemand(updated)
                                        setSelectedSchedulerDemand(updated)
                                    }}
                                    initialTab="scheduler"
                                />
                            )}
                        </div>
                    ) : null /* Default case if no tab matches */}
                </div>
            </main>
        </div>
    )
}
