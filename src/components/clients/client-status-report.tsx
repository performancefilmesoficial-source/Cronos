"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { DataService, Demand, DemandStatus } from "@/lib/data"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Instagram, Linkedin, Facebook, Youtube, Clock, CheckCircle, AlertCircle, Play, FileText, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ClientStatusReportProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    clientName: string
    status: string // "drafts" | "adjustments" | "approvals" | "approved"
}

const statusMap: Record<string, { label: string; color: string; icon: any; dbStatus: DemandStatus }> = {
    drafts: {
        label: "Em Rascunho",
        color: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20",
        icon: Clock,
        dbStatus: "Em andamento"
    },
    adjustments: {
        label: "Aguardando Ajuste",
        color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        icon: AlertCircle,
        dbStatus: "Aguardando ajuste"
    },
    approvals: {
        label: "Aguardando Aprovação",
        color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
        icon: AlertCircle,
        dbStatus: "Aguardando aprovação"
    },
    approved: {
        label: "Aprovados",
        color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
        icon: CheckCircle,
        dbStatus: "Aprovado"
    },
}

export function ClientStatusReport({ isOpen, onOpenChange, clientName, status }: ClientStatusReportProps) {
    const config = statusMap[status] || statusMap.drafts
    const [demands, setDemands] = React.useState<Demand[]>([])

    React.useEffect(() => {
        if (isOpen) {
            const allDemands = DataService.getDemands()
            const filtered = allDemands.filter(d =>
                d.client.toLowerCase() === clientName.toLowerCase() &&
                d.status === config.dbStatus
            )
            setDemands(filtered)
        }
    }, [isOpen, clientName, config.dbStatus])

    const getSocialIcon = (type: string) => {
        const t = (type || "").toLowerCase()
        if (t.includes("reels") || t.includes("stories") || t.includes("feed") || t.includes("insta")) return <Instagram className="w-3 h-3" />
        if (t.includes("linkedin")) return <Linkedin className="w-3 h-3" />
        if (t.includes("youtube") || t.includes("motion")) return <Youtube className="w-3 h-3" />
        if (t.includes("facebook")) return <Facebook className="w-3 h-3" />
        return <Instagram className="w-3 h-3" />
    }

    const StatusIcon = config.icon

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#121214] border-white/10 text-white sm:max-w-[700px] max-h-[85vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-xl", config.color)}>
                                <StatusIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold tracking-tight">
                                    Relatório: {config.label}
                                </DialogTitle>
                                <p className="text-sm text-zinc-500">{clientName}</p>
                            </div>
                        </div>
                        <Badge variant="outline" className={cn("h-6", config.color)}>
                            {demands.length} itens
                        </Badge>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 p-6">
                    {demands.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-zinc-600 space-y-4">
                            <div className="p-4 rounded-full bg-white/5">
                                <FileText className="w-8 h-8 opacity-20" />
                            </div>
                            <p className="text-sm font-medium">Nenhum conteúdo encontrado com este status.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {demands.map((demand) => (
                                <div
                                    key={demand.id}
                                    className="group p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 flex items-start gap-4"
                                >
                                    {/* Type icon */}
                                    <div className="mt-1 h-10 w-10 shrink-0 rounded-xl bg-zinc-800/50 flex items-center justify-center text-zinc-400 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                        {getSocialIcon(demand.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <h4 className="font-bold text-sm text-white truncate">{demand.title}</h4>
                                            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">{demand.date}</span>
                                        </div>
                                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed italic">
                                            {demand.caption || "Sem legenda definida."}
                                        </p>

                                        <div className="flex items-center gap-4 pt-2">
                                            <div className="flex items-center gap-1.5">
                                                <div className="h-4 w-4 rounded-md bg-white/5 flex items-center justify-center text-[9px] font-bold text-zinc-500">
                                                    {demand.type[0].toUpperCase()}
                                                </div>
                                                <span className="text-[10px] text-zinc-500 font-semibold uppercase">{demand.type}</span>
                                            </div>

                                            {demand.assignedTo && (
                                                <div className="flex items-center gap-1.5 border-l border-white/10 pl-4">

                                                    <span className="text-[10px] text-zinc-400 font-medium">Finalizado por: <span className="text-white">{demand.assignedTo}</span></span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Visual indicators */}
                                    <div className="flex flex-col gap-2 shrink-0 pt-1">
                                        {demand.mediaUrl && (
                                            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                <ImageIcon className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                <div className="p-4 bg-white/[0.01] border-t border-white/5 text-center">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold">Post Performance • Sistema de Gestão</p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
