"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Instagram, Linkedin, Facebook, Youtube, UserPlus, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { NewDemandDialog } from "@/components/demands/new-demand-dialog"
import { Demand, DataService, User } from "@/lib/data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getServiceColor } from "@/lib/services"

interface ClientDemandCardProps {
    demand: Demand
    onUpdate?: (updated: Demand) => void
    draggable?: boolean
    onDragStart?: (e: React.DragEvent) => void
    onDragEnd?: (e: React.DragEvent) => void
}

export function ClientDemandCard({ demand: initialDemand, onUpdate, draggable, onDragStart, onDragEnd }: ClientDemandCardProps) {
    const [demand, setDemand] = React.useState(initialDemand)
    const [isDetailOpen, setIsDetailOpen] = React.useState(false)
    const [isExpanded, setIsExpanded] = React.useState(false)
    const [users, setUsers] = React.useState<User[]>([])

    // Update local state if prop changes
    React.useEffect(() => {
        setDemand(initialDemand)
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
        setDemand(updated)
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

    const svc = getServiceColor(demand.type)

    return (
        <>
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
                        <h3 className="font-bold text-[10px] uppercase tracking-wider text-white truncate max-w-[100px]">{demand.client}</h3>
                        {!isExpanded && (
                            <span className="text-[8px] font-medium text-white/60 uppercase tracking-tighter truncate max-w-[80px]">
                                {demand.type}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        {isExpanded && (
                            <Badge variant="outline" className="h-4 px-1 text-[7px] font-medium bg-black/40 border-white/5 text-white/70 uppercase tracking-tighter">
                                {demand.type}
                            </Badge>
                        )}
                        <div className="bg-black/20 p-0.5 rounded-full">
                            {getSocialIcon(demand.type)}
                        </div>
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
                                {demand.title}
                            </p>
                        </div>

                        {/* Footer: User + Status */}
                        <div className="flex items-center justify-between mt-auto relative z-10 border-t border-white/10 pt-2">
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                {demand.assignedTo ? (
                                    <div className="flex items-center gap-1.5">
                                        <Avatar className="h-4 w-4 ring-1 ring-white/10">
                                            <AvatarFallback className="text-[7px] bg-primary/10 text-primary">{demand.assignedTo[0]}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-[9px] text-white/70 truncate max-w-[60px]">{demand.assignedTo}</span>
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
                                                    onClick={(e) => handleAssignUser(e, demand, user.name)}
                                                >
                                                    <Avatar className="h-4 w-4">
                                                        <AvatarFallback className="bg-white/10 text-[8px] uppercase">{user.name[0]}</AvatarFallback>
                                                        {user.avatar && <AvatarImage src={user.avatar} />}
                                                    </Avatar>
                                                    {user.name}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>

                            <div className={cn(
                                "flex items-center gap-1 text-[8px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded-md whitespace-nowrap",
                                "bg-black/30", svc.textClass
                            )}>
                                {demand.status}
                            </div>
                        </div>
                    </>
                )}
            </div>

            <NewDemandDialog
                demand={demand}
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                clientId={""} // fallback if missing
                clientName={demand.client}
                onSuccess={() => {
                    setIsDetailOpen(false)
                    // The dialog does its own update to DataService, 
                    // we trigger onUpdate to refresh the list up to page.tsx
                    onUpdate?.(demand)
                }}
            />
        </>
    )
}
