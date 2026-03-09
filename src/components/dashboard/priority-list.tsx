"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Instagram, Linkedin, Facebook, Youtube, UserPlus, Rocket, Send } from "lucide-react"
import { DemandDetailPopup } from "./demand-detail-popup"
import { Demand, DataService, User } from "@/lib/data"
import { format, isToday, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"

interface PriorityListProps {
    demands: Demand[]
    onUpdate?: (updated: Demand) => void
}

export function PriorityList({ demands, onUpdate }: PriorityListProps) {
    const [users, setUsers] = React.useState<User[]>([])
    const [delayedIds, setDelayedIds] = React.useState<string[]>([])
    const prevDemandsRef = React.useRef<Demand[]>([])
    const [selectedDemand, setSelectedDemand] = React.useState<Demand | null>(null)
    const [publishTab, setPublishTab] = React.useState<"details" | "scheduler">("details")

    React.useEffect(() => {
        setUsers(DataService.getUsers())

        const handleDataChange = () => setUsers(DataService.getUsers())
        window.addEventListener("sf-data-change", handleDataChange)
        return () => window.removeEventListener("sf-data-change", handleDataChange)
    }, [])

    React.useEffect(() => {
        const prevDemands = prevDemandsRef.current
        const newApproved = demands.filter(d => d.status === "Aprovado")

        newApproved.forEach(d => {
            const prev = prevDemands.find(p => p.id === d.id)
            if (prev && prev.status !== "Aprovado") {
                setDelayedIds(prev => [...prev, d.id])
                setTimeout(() => {
                    setDelayedIds(prev => prev.filter(id => id !== d.id))
                }, 5000)
            }
        })

        prevDemandsRef.current = demands
    }, [demands])

    const activeDemands = demands.filter(d => d.status !== "Aprovado" || delayedIds.includes(d.id))

    const handleAssignUser = (e: React.MouseEvent, task: Demand, user: string) => {
        e.stopPropagation()
        onUpdate?.({
            ...task,
            assignedTo: user,
            status: task.status || "Em andamento"
        })
    }

    const getSocialIcon = (type: string) => {
        const t = (type || "").toLowerCase()
        if (t.includes("reels") || t.includes("stories") || t.includes("feed") || t.includes("insta")) return <Instagram className="w-3 h-3 text-muted-foreground/60" />
        if (t.includes("linkedin")) return <Linkedin className="w-3 h-3 text-muted-foreground/60" />
        if (t.includes("youtube") || t.includes("motion")) return <Youtube className="w-3 h-3 text-muted-foreground/60" />
        if (t.includes("facebook")) return <Facebook className="w-3 h-3 text-muted-foreground/60" />
        return <Instagram className="w-3 h-3 text-muted-foreground/60" />
    }

    const formatTaskDate = (dateStr: string) => {
        try {
            const date = parseISO(dateStr)
            if (isToday(date)) return "Hoje"
            return format(date, "dd/MM", { locale: ptBR })
        } catch (e) {
            return dateStr
        }
    }

    return (
        <div className="h-full w-full flex flex-col overflow-hidden bg-transparent">
            <div className="p-6 pb-2 border-b border-white/5 mx-2">
                <div className="flex items-center gap-2 mb-1">
                    <div className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse" />
                    <h3 className="font-bold text-sm tracking-wide uppercase text-muted-foreground/80">Prioridades</h3>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="flex flex-col gap-3">
                    {activeDemands.length > 0 ? activeDemands.map((task) => {
                        const statusConfig: Record<string, { color: string, shadow: string, border: string, bg: string }> = {
                            "Em andamento": { color: "bg-blue-500", shadow: "shadow-blue-500/50", border: "border-blue-500/40", bg: "bg-blue-500/5" },
                            "Aguardando aprovação": { color: "bg-amber-500", shadow: "shadow-amber-500/50", border: "border-amber-500/40", bg: "bg-amber-500/5" },
                            "Aprovado": { color: "bg-emerald-500", shadow: "shadow-emerald-500/50", border: "border-emerald-500/40", bg: "bg-emerald-500/5" },
                            "Aguardando ajuste": { color: "bg-rose-500", shadow: "shadow-rose-500/50", border: "border-rose-500/40", bg: "bg-rose-500/5" },
                            "Programado": { color: "bg-primary", shadow: "shadow-primary/50", border: "border-primary/40", bg: "bg-primary/5" },
                        }

                        const config = task.status && statusConfig[task.status] ? statusConfig[task.status] : {
                            color: "bg-red-500", shadow: "shadow-red-500/50", border: "border-red-500/40", bg: "bg-red-500/5"
                        }

                        const taskDateLabel = formatTaskDate(task.date)

                        return (
                            <ContextMenu key={task.id}>
                                <ContextMenuTrigger>
                                    <div
                                        onClick={() => {
                                            setPublishTab("details")
                                            setSelectedDemand(task)
                                        }}
                                        className={cn(
                                            "flex flex-col gap-3 p-3 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden relative",
                                            "hover:border-primary/30 hover:shadow-lg active:scale-[0.98]",
                                            config.border,
                                            config.bg,
                                            "backdrop-blur-md"
                                        )}
                                    >
                                        <div className="flex flex-col gap-3 relative z-10">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn("w-1.5 h-1.5 rounded-full", config.color, config.shadow)} />
                                                    <h3 className="font-bold text-[10px] uppercase tracking-wider text-white/90">{task.client}</h3>
                                                </div>
                                                <div className="bg-white/5 p-1 rounded-lg">
                                                    {getSocialIcon(task.type)}
                                                </div>
                                            </div>

                                            <p className="text-[11px] font-semibold text-white/95 leading-snug line-clamp-2">
                                                {task.title}
                                            </p>

                                            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                    {task.assignedTo ? (
                                                        <span className="text-[10px] font-bold text-white/70 uppercase tracking-tighter truncate max-w-[80px]">{task.assignedTo}</span>
                                                    ) : (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <div
                                                                    role="button"
                                                                    className="h-5 px-2 flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 animate-pulse hover:bg-emerald-500/10 transition-colors cursor-pointer"
                                                                >
                                                                    <UserPlus className="w-3 h-3" />
                                                                    <span className="text-[9px] font-bold uppercase tracking-wider">Atribuir</span>
                                                                </div>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="start" className="bg-[#1c1c1e] border-white/10 text-white min-w-[140px] z-50">
                                                                <div className="p-2 text-[10px] uppercase font-bold text-zinc-500 tracking-widest px-3 py-2 border-b border-white/5">Membros</div>
                                                                {users.map(user => (
                                                                    <DropdownMenuItem
                                                                        key={user.id}
                                                                        className="text-[11px] py-2 focus:bg-primary/10 focus:text-primary cursor-pointer gap-2"
                                                                        onClick={(e) => handleAssignUser(e, task, user.name)}
                                                                    >
                                                                        {user.name}
                                                                    </DropdownMenuItem>
                                                                ))}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "flex items-center gap-1 text-[9px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded-md whitespace-nowrap",
                                                        task.status === "Aprovado" ? "bg-emerald-500/10 text-emerald-400" :
                                                            task.status === "Em andamento" ? "bg-blue-500/10 text-blue-400" :
                                                                task.status === "Aguardando aprovação" ? "bg-amber-500/10 text-amber-400" :
                                                                    task.status === "Aguardando ajuste" ? "bg-orange-500/10 text-orange-400" :
                                                                        task.status === "Programado" ? "bg-primary/10 text-primary" :
                                                                            "bg-red-500/10 text-red-500"
                                                    )}>
                                                        {task.status || "Novo"}
                                                    </div>

                                                    <span className={cn(
                                                        "text-[9px] flex items-center gap-1 font-medium bg-white/5 px-1.5 py-0.5 rounded-md whitespace-nowrap shrink-0",
                                                        taskDateLabel === "Hoje" ? "text-red-500" : "text-zinc-500"
                                                    )}>
                                                        {taskDateLabel}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ContextMenuTrigger>
                                <ContextMenuContent className="bg-[#1c1c1e] border-white/10 text-white w-56">
                                    <ContextMenuItem
                                        className="text-xs gap-2 py-2 cursor-pointer focus:bg-primary focus:text-white"
                                        onClick={() => {
                                            setPublishTab("scheduler")
                                            setSelectedDemand(task)
                                        }}
                                    >
                                        <Rocket className="w-4 h-4 text-primary" />
                                        Programar Conteúdo
                                    </ContextMenuItem>
                                    <ContextMenuItem
                                        className="text-xs gap-2 py-2 cursor-pointer focus:bg-primary focus:text-white"
                                        onClick={() => {
                                            setPublishTab("scheduler")
                                            setSelectedDemand(task)
                                        }}
                                    >
                                        <Send className="w-4 h-4 text-emerald-500" />
                                        Postar agora (API)
                                    </ContextMenuItem>
                                </ContextMenuContent>
                            </ContextMenu>
                        )
                    }) : (
                        <div className="text-center p-8 text-zinc-500 text-xs italic">
                            Nenhuma prioridade pendente.
                        </div>
                    )}
                </div>
            </div>

            {selectedDemand && (
                <DemandDetailPopup
                    demand={selectedDemand}
                    isOpen={!!selectedDemand}
                    onOpenChange={(open) => {
                        if (!open) setSelectedDemand(null)
                        setPublishTab("details")
                    }}
                    onUpdate={(updated) => {
                        setSelectedDemand(updated)
                        onUpdate?.(updated)
                    }}
                    showScheduler={publishTab === "scheduler"}
                    initialTab={publishTab}
                />
            )}
        </div>
    )
}
