"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Play, Instagram, Linkedin, Facebook, Youtube, UserPlus, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { DemandDetailPopup } from "./demand-detail-popup"
import { Demand, DataService, User } from "@/lib/data"
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
import { Rocket, Send } from "lucide-react"

interface DemandCardProps {
    demand: Demand
    onUpdate?: (updated: Demand) => void
}

export function DemandCard({ demand: initialDemand, onUpdate }: DemandCardProps) {
    const [localDemand, setLocalDemand] = React.useState(initialDemand)
    const [isDetailOpen, setIsDetailOpen] = React.useState(false)
    const [publishTab, setPublishTab] = React.useState<"details" | "scheduler">("details")
    const [isExpanded, setIsExpanded] = React.useState(false)
    const [users, setUsers] = React.useState<User[]>([])

    React.useEffect(() => {
        setLocalDemand(initialDemand)
    }, [initialDemand])

    React.useEffect(() => {
        const users = DataService.getUsers()
        setUsers(users)
    }, [])

    const handleAssignUser = (e: React.MouseEvent, task: Demand, user: string) => {
        e.stopPropagation()
        const updated = {
            ...task,
            assignedTo: user,
            status: task.status || "Em andamento"
        }
        setLocalDemand(updated)
        onUpdate?.(updated)
    }

    const toggleExpand = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsExpanded(!isExpanded)
    }

    const statusConfig: Record<string, { color: string, shadow: string, border: string, bg: string }> = {
        "Em andamento": { color: "bg-blue-500", shadow: "shadow-blue-500/50", border: "border-blue-500/30", bg: "bg-blue-500/5 dark:bg-blue-500/10" },
        "Aguardando aprovação": { color: "bg-amber-500", shadow: "shadow-amber-500/50", border: "border-amber-500/30", bg: "bg-amber-500/5 dark:bg-amber-500/10" },
        "Aprovado": { color: "bg-emerald-500", shadow: "shadow-emerald-500/50", border: "border-emerald-500/30", bg: "bg-emerald-500/5 dark:bg-emerald-500/10" },
        "Aguardando ajuste": { color: "bg-rose-500", shadow: "shadow-rose-500/50", border: "border-rose-500/30", bg: "bg-rose-500/5 dark:bg-rose-500/10" },
        "Programado": { color: "bg-primary", shadow: "shadow-primary/50", border: "border-primary/30", bg: "bg-primary/5 dark:bg-primary/10" },
    }

    const config = localDemand.status && statusConfig[localDemand.status] ? statusConfig[localDemand.status] : {
        color: "bg-red-500", shadow: "shadow-red-500/50", border: "border-red-500/30", bg: "bg-red-500/5 dark:bg-red-500/10"
    }

    const isUnassigned = !localDemand.assignedTo
    const activeConfig = isUnassigned ? {
        color: "bg-red-500",
        shadow: "shadow-red-500/50",
        border: "border-red-500/50",
        bg: "bg-red-500/10 dark:bg-red-500/20"
    } : config

    const getSocialIcon = (type: string) => {
        const t = (type || "").toLowerCase()
        const iconClass = "w-3 h-3 text-muted-foreground/80 dark:text-white/70"
        if (t.includes("instagram")) return <Instagram className={iconClass} />
        if (t.includes("tiktok")) return <Play className={iconClass} />
        if (t.includes("youtube")) return <Youtube className={iconClass} />
        if (t.includes("facebook")) return <Facebook className={iconClass} />
        if (t.includes("linkedin")) return <Linkedin className={iconClass} />
        return <Instagram className={iconClass} />
    }

    return (
        <>
            <ContextMenu>
                <ContextMenuTrigger>
                    <div
                        onClick={() => setIsDetailOpen(true)}
                        className={cn(
                            "group relative p-2.5 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col gap-2",
                            isExpanded ? "min-h-[110px]" : "min-h-0",
                            "hover:border-primary/50 hover:shadow-lg active:scale-[0.99]",
                            activeConfig.border,
                            activeConfig.bg,
                            "backdrop-blur-md"
                        )}
                    >
                        <div className="flex justify-between items-center relative z-10 w-full">
                            <div className="flex flex-col">
                                <h3 className="font-bold text-[10px] uppercase tracking-wider text-foreground truncate max-w-[100px]">{localDemand.client}</h3>
                                {!isExpanded && (
                                    <span className="text-[8px] font-medium text-muted-foreground uppercase tracking-tighter truncate max-w-[80px]">
                                        {localDemand.type}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                                {isExpanded && (
                                    <Badge variant="outline" className="h-4 px-1 text-[7px] font-medium bg-background/50 border-border text-muted-foreground uppercase tracking-tighter">
                                        {localDemand.type}
                                    </Badge>
                                )}
                                <div className="bg-muted p-0.5 rounded-full">
                                    {getSocialIcon(localDemand.type)}
                                </div>
                                <button
                                    onClick={toggleExpand}
                                    className="p-0.5 hover:bg-muted rounded-full transition-colors"
                                >
                                    {isExpanded ? (
                                        <ChevronUp className="w-3 h-3 text-muted-foreground/70" />
                                    ) : (
                                        <ChevronDown className="w-3 h-3 text-muted-foreground/70" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {isExpanded && (
                            <>
                                <div className="relative z-10 flex-1">
                                    <p className="font-semibold text-[11px] text-foreground transition-colors leading-tight line-clamp-2">
                                        {localDemand.title}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between mt-auto relative z-10 border-t border-border/50 pt-2">
                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                        {localDemand.assignedTo ? (
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[9px] text-muted-foreground truncate max-w-[60px]">{localDemand.assignedTo}</span>
                                            </div>
                                        ) : (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <div
                                                        role="button"
                                                        className="h-5 px-2 flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 animate-pulse hover:bg-emerald-500/10 transition-colors cursor-pointer"
                                                    >
                                                        <UserPlus className="w-2.5 h-2.5" />
                                                        <span className="text-[8px] font-bold uppercase tracking-wider">Atribuir</span>
                                                    </div>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="start" className="bg-card border-border text-foreground min-w-[140px] z-50">
                                                    <div className="p-2 text-[10px] uppercase font-bold text-muted-foreground/60 tracking-widest px-3 py-2 border-b border-border">Membros</div>
                                                    {users.map(user => (
                                                        <DropdownMenuItem
                                                            key={user.id}
                                                            className="text-[11px] py-2 focus:bg-primary/10 focus:text-primary cursor-pointer gap-2"
                                                            onClick={(e) => handleAssignUser(e, localDemand, user.name)}
                                                        >
                                                            {user.name}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>

                                    <div className={cn(
                                        "flex items-center gap-1 text-[8px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded-md whitespace-nowrap",
                                        "bg-muted/50 text-foreground/70"
                                    )}>
                                        {localDemand.status || "Novo"}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </ContextMenuTrigger>
                <ContextMenuContent className="bg-card border-border text-foreground w-56">
                    <ContextMenuItem
                        className="text-xs gap-2 py-2 cursor-pointer focus:bg-primary focus:text-white"
                        onClick={() => {
                            setPublishTab("scheduler")
                            setIsDetailOpen(true)
                        }}
                    >
                        <Rocket className="w-4 h-4 text-primary" />
                        Programar Conteúdo
                    </ContextMenuItem>
                    <ContextMenuItem
                        className="text-xs gap-2 py-2 cursor-pointer focus:bg-primary focus:text-white"
                        onClick={() => {
                            setPublishTab("scheduler")
                            setIsDetailOpen(true)
                        }}
                    >
                        <Send className="w-4 h-4 text-emerald-500" />
                        Postar agora (API)
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>

            <DemandDetailPopup
                demand={localDemand}
                isOpen={isDetailOpen}
                onOpenChange={(open) => {
                    setIsDetailOpen(open)
                    if (!open) setPublishTab("details")
                }}
                onUpdate={(updated) => {
                    setLocalDemand(updated)
                    onUpdate?.(updated)
                }}
                showScheduler={publishTab === "scheduler"}
                initialTab={publishTab}
            />
        </>
    )
}
