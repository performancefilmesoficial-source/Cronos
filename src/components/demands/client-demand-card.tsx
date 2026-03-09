"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Instagram, Linkedin, Facebook, Youtube, UserPlus, ChevronDown, ChevronUp, Pencil } from "lucide-react"
import { cn } from "@/lib/utils"
import { NewDemandDialog } from "@/components/demands/new-demand-dialog"
import { DemandDetailPopup } from "@/components/dashboard/demand-detail-popup"
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
import { getServiceColor } from "@/lib/services"

interface ClientDemandCardProps {
    demand: Demand
    onUpdate?: (updated: Demand) => void
    draggable?: boolean
    onDragStart?: (e: React.DragEvent) => void
    onDragEnd?: (e: React.DragEvent) => void
}

export function ClientDemandCard({ demand: initialDemand, onUpdate, draggable, onDragStart, onDragEnd }: ClientDemandCardProps) {
    const [localDemand, setLocalDemand] = React.useState(initialDemand)
    const [isDetailOpen, setIsDetailOpen] = React.useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
    const [publishTab, setPublishTab] = React.useState<"details" | "scheduler">("details")
    const [isExpanded, setIsExpanded] = React.useState(false)
    const [users, setUsers] = React.useState<User[]>([])

    // Update local state if prop changes
    React.useEffect(() => {
        setLocalDemand(initialDemand)
    }, [initialDemand])

    React.useEffect(() => {
        setUsers(DataService.getUsers())
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

    const getSocialIcon = (type: string) => {
        const t = (type || "").toLowerCase()
        if (t.includes("reels") || t.includes("stories") || t.includes("feed") || t.includes("insta")) return <Instagram className="w-3 h-3 text-white/70" />
        if (t.includes("linkedin")) return <Linkedin className="w-3 h-3 text-white/70" />
        if (t.includes("youtube") || t.includes("motion")) return <Youtube className="w-3 h-3 text-white/70" />
        if (t.includes("facebook")) return <Facebook className="w-3 h-3 text-white/70" />
        return <Instagram className="w-3 h-3 text-white/70" />
    }

    const svc = getServiceColor(localDemand.type)

    return (
        <>
            <ContextMenu>
                <ContextMenuTrigger>
                    <div
                        onClick={() => setIsDetailOpen(true)}
                        draggable={draggable}
                        onDragStart={onDragStart as any}
                        onDragEnd={onDragEnd as any}
                        className={cn(
                            "group relative p-2.5 rounded-xl border transition-all duration-300 cursor-grab active:cursor-grabbing overflow-hidden flex flex-col gap-2",
                            isExpanded ? "min-h-[110px]" : "min-h-0",
                            "hover:border-white/30 hover:shadow-lg active:scale-[0.99]",
                            svc.borderClass,
                            svc.bgClass,
                            "backdrop-blur-md"
                        )}
                    >
                        {/* Header: Client + Type + Icon + Toggle */}
                        <div className="flex justify-between items-center relative z-10 w-full">
                            <div className="flex flex-col">
                                <h3 className="font-bold text-[10px] uppercase tracking-wider text-white truncate max-w-[100px]">{localDemand.client}</h3>
                                {!isExpanded && (
                                    <span className="text-[8px] font-medium text-white/60 uppercase tracking-tighter truncate max-w-[80px]">
                                        {localDemand.type}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                                {isExpanded && (
                                    <Badge variant="outline" className="h-4 px-1 text-[7px] font-medium bg-black/40 border-white/5 text-white/70 uppercase tracking-tighter">
                                        {localDemand.type}
                                    </Badge>
                                )}
                                <div className="bg-black/20 p-0.5 rounded-full">
                                    {getSocialIcon(localDemand.type)}
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsEditDialogOpen(true) }}
                                    className="p-0.5 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <Pencil className="w-3 h-3 text-white/70" />
                                </button>
                                <button
                                    onClick={toggleExpand}
                                    className="p-0.5 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    {isExpanded ? (
                                        <ChevronUp className="w-3 h-3 text-white/70" />
                                    ) : (
                                        <ChevronDown className="w-3 h-3 text-white/70" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {isExpanded && (
                            <>
                                {/* Body: Title */}
                                <div className="relative z-10 flex-1">
                                    <p className="font-semibold text-[11px] text-white transition-colors leading-tight line-clamp-2">
                                        {localDemand.title}
                                    </p>
                                </div>

                                {/* Footer: User + Status */}
                                <div className="flex items-center justify-between mt-auto relative z-10 border-t border-white/10 pt-2">
                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                        {localDemand.assignedTo ? (
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[9px] text-white/70 truncate max-w-[60px]">{localDemand.assignedTo}</span>
                                            </div>
                                        ) : (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <div
                                                        role="button"
                                                        className="h-5 px-2 flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 animate-pulse hover:bg-emerald-500/10 transition-colors cursor-pointer"
                                                    >
                                                        <UserPlus className="w-2.5 h-2.5" />
                                                        <span className="text-[8px] font-bold uppercase tracking-wider">Atribuir</span>
                                                    </div>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="start" className="bg-[#121214] border-white/10 text-white min-w-[140px] z-50">
                                                    <div className="p-2 text-[10px] uppercase font-bold text-muted-foreground/60 tracking-widest px-3 py-2 border-b border-white/5">Membros</div>
                                                    {users.map(user => (
                                                        <DropdownMenuItem
                                                            key={user.id}
                                                            className="text-[11px] py-2 focus:bg-primary/20 focus:text-white cursor-pointer gap-2"
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
                                        "flex items-center gap-1 text-[8px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded-md whitespace-nowrap text-white",
                                        localDemand.status === "Programado" ? "bg-primary" : "bg-black/30"
                                    )}>
                                        {localDemand.status}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </ContextMenuTrigger>
                <ContextMenuContent className="bg-[#121214] border-white/10 text-white w-56">
                    <ContextMenuItem
                        className="text-xs gap-2 py-2 cursor-pointer focus:bg-primary focus:text-white"
                        onClick={() => {
                            setPublishTab("scheduler")
                            setIsDetailOpen(true)
                        }}
                    >
                        <Rocket className="w-4 h-4 text-primary group-focus:text-white" />
                        Programar Conteúdo
                    </ContextMenuItem>
                    <ContextMenuItem
                        className="text-xs gap-2 py-2 cursor-pointer focus:bg-primary focus:text-white"
                        onClick={() => {
                            setPublishTab("scheduler")
                            setIsDetailOpen(true)
                        }}
                    >
                        <Send className="w-4 h-4 text-emerald-400 group-focus:text-white" />
                        Postar agora (API)
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>

            <DemandDetailPopup
                demand={localDemand}
                isOpen={isDetailOpen}
                onOpenChange={(open) => {
                    setIsDetailOpen(open)
                    if (!open) setPublishTab("details") // Reset for next simple click
                }}
                onUpdate={(updated) => {
                    setLocalDemand(updated)
                    onUpdate?.(updated)
                }}
                showScheduler={publishTab === "scheduler"}
                initialTab={publishTab}
            />

            <NewDemandDialog
                demand={localDemand}
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                clientId={""}
                clientName={localDemand.client}
                onSuccess={() => {
                    setIsEditDialogOpen(false)
                    onUpdate?.(localDemand)
                }}
            >
                <div />
            </NewDemandDialog>
        </>
    )
}
