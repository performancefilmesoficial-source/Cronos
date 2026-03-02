
import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Clock, AlertCircle, UserPlus, Instagram, Linkedin, Facebook, Youtube } from "lucide-react"
import { DemandDetailPopup } from "./demand-detail-popup"
import { Demand, DemandStatus } from "@/lib/data"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { DataService, User } from "@/lib/data"

interface PriorityListProps {
    demands: Demand[]
    onUpdate?: (updated: Demand) => void
}

export function PriorityList({ demands, onUpdate }: PriorityListProps) {
    const [users, setUsers] = React.useState<User[]>([])
    const [delayedIds, setDelayedIds] = React.useState<string[]>([])
    const prevDemandsRef = React.useRef<Demand[]>([])
    const [selectedDemand, setSelectedDemand] = React.useState<Demand | null>(null)

    React.useEffect(() => {
        setUsers(DataService.getUsers())

        // Listen for user updates
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

    // Filter out approved demands unless they are in the delayed list
    const activeDemands = demands.filter(d => d.status !== "Aprovado" || delayedIds.includes(d.id))

    const handleAssignUser = (e: React.MouseEvent, task: Demand, user: string) => {
        e.stopPropagation() // Prevent bubbling (though no click handler exists anymore, good practice)
        onUpdate?.({
            ...task,
            assignedTo: user,
            status: task.status || "Em andamento"
        })
    }

    const getSocialIcon = (type: string) => {
        const t = type.toLowerCase()
        if (t.includes("reels") || t.includes("stories") || t.includes("feed") || t.includes("insta")) return <Instagram className="w-3 h-3 text-white/50" />
        if (t.includes("linkedin")) return <Linkedin className="w-3 h-3 text-white/50" />
        if (t.includes("youtube") || t.includes("motion")) return <Youtube className="w-3 h-3 text-white/50" />
        if (t.includes("facebook")) return <Facebook className="w-3 h-3 text-white/50" />
        return <Instagram className="w-3 h-3 text-white/50" /> // Default fallback
    }

    return (
        <div className="h-full border-l border-white/5 bg-background/40 backdrop-blur-xl w-[350px] flex flex-col">
            <div className="p-6 pb-2 border-b border-white/5 mx-2">
                <div className="flex items-center gap-2 mb-1">
                    <div className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse" />
                    <h3 className="font-bold text-sm tracking-wide uppercase text-muted-foreground/80">Prioridades</h3>
                </div>
            </div>

            <div className="flex-1 overflow-hidden p-4">
                <div className="flex flex-col gap-3">
                    {activeDemands.length > 0 ? activeDemands.map((task) => {
                        const statusStyle = {
                            "Aprovado": "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
                            "Em andamento": "border-blue-500/30 bg-blue-500/10 text-blue-400",
                            "Aguardando aprovação": "border-amber-500/30 bg-amber-500/10 text-amber-400",
                            "Aguardando ajuste": "border-orange-500/50 bg-orange-500/10 text-orange-400 animate-pulse duration-700 shadow-[0_0_10px_rgba(249,115,22,0.2)]"
                        }[task.status as string] || "border-white/10 bg-white/5 text-zinc-400"

                        const isUnassigned = !task.assignedTo

                        return (
                            <div
                                key={task.id}
                                onClick={() => setSelectedDemand(task)}
                                className={cn(
                                    "flex flex-col gap-3 p-3 rounded-xl border transition-all duration-200 relative overflow-hidden cursor-pointer hover:border-white/20 hover:bg-white/5",
                                    isUnassigned || !task.status
                                        ? "border-red-500/50 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                                        : statusStyle
                                )}
                            >
                                {/* Header: Client + Type + Icon */}
                                <div className="flex justify-between items-start relative z-10">
                                    <h4 className="font-bold text-sm uppercase tracking-wider text-white">{task.client}</h4>

                                    <div className="flex items-center gap-1.5">
                                        <Badge variant="outline" className={cn(
                                            "border-none px-1.5 py-0 text-[9px] font-semibold uppercase tracking-wider bg-white/10 text-white/70 h-5",
                                        )}>
                                            {task.type}
                                        </Badge>
                                        <div className="bg-white/10 p-1 rounded-full">
                                            {getSocialIcon(task.type)}
                                        </div>
                                    </div>
                                </div>

                                {/* Body: Title */}
                                <div className="relative z-10 -mt-1">
                                    <p className="text-xs font-medium text-white/60 leading-snug">{task.title}</p>
                                </div>

                                {/* Footer: Assign + Status + Date */}
                                <div className="flex items-center justify-between mt-1 relative z-10 border-t border-white/5 pt-2">
                                    <div className="flex items-center gap-2">
                                        {task.assignedTo ? (
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-5 w-5 ring-1 ring-white/10">
                                                    <AvatarFallback className="text-[9px] bg-primary/10 text-primary">{task.assignedTo[0]}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-[10px] text-muted-foreground">{task.assignedTo}</span>
                                            </div>
                                        ) : (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <div
                                                        role="button"
                                                        className="h-6 px-3 flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 animate-pulse hover:bg-emerald-500/10 transition-colors cursor-pointer"
                                                    >
                                                        <UserPlus className="w-3 h-3" />
                                                        <span className="text-[9px] font-bold uppercase tracking-wider">Atribuir</span>
                                                    </div>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="start" className="bg-[#121214] border-white/10 text-white min-w-[140px] z-50">
                                                    <div className="p-2 text-[10px] uppercase font-bold text-muted-foreground/60 tracking-widest px-3 py-2 border-b border-white/5">Membros</div>
                                                    {users.map(user => (
                                                        <DropdownMenuItem
                                                            key={user.id}
                                                            className="text-[11px] py-2 focus:bg-primary/20 focus:text-white cursor-pointer gap-2"
                                                            onClick={(e) => handleAssignUser(e, task, user.name)}
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

                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "flex items-center gap-1 text-[9px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded-md whitespace-nowrap",
                                            task.status === "Aprovado" ? "bg-emerald-500/10 text-emerald-400" :
                                                task.status === "Em andamento" ? "bg-blue-500/10 text-blue-400" :
                                                    task.status === "Aguardando aprovação" ? "bg-amber-500/10 text-amber-400" :
                                                        task.status === "Aguardando ajuste" ? "bg-orange-500/10 text-orange-400" :
                                                            "bg-red-500/10 text-red-500"
                                        )}>
                                            {task.status || "Novo"}
                                        </div>

                                        <span className={cn(
                                            "text-[9px] flex items-center gap-1 font-medium bg-white/5 px-1.5 py-0.5 rounded-md whitespace-nowrap shrink-0",
                                            task.date === "Hoje" ? "text-red-400" : "text-muted-foreground"
                                        )}>
                                            {task.date}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    }) : (

                        <div className="text-center p-8 text-muted-foreground text-xs italic">
                            Nenhuma prioridade pendente.
                        </div>
                    )}
                </div>
            </div>

            {selectedDemand && (
                <DemandDetailPopup
                    demand={selectedDemand}
                    isOpen={!!selectedDemand}
                    onOpenChange={(open) => !open && setSelectedDemand(null)}
                    onUpdate={(updated) => {
                        setSelectedDemand(updated) // Update local view immediately
                        onUpdate?.(updated)
                    }}
                />
            )}
        </div>
    )
}
