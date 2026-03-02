"use client"

import { Client } from "@/types/client"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"

interface ClientCardProps {
    client: Client
    onEdit?: (client: Client) => void
    onDelete?: (clientId: string) => void
}

export function ClientCard({ client, onEdit, onDelete }: ClientCardProps) {
    const stats = client.stats || { drafts: 0, adjustments: 0, approvals: 0, approved: 0 }
    const [showConfirm, setShowConfirm] = useState(false)

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (showConfirm) {
            onDelete?.(client.id)
            setShowConfirm(false)
        } else {
            setShowConfirm(true)
            setTimeout(() => setShowConfirm(false), 3000)
        }
    }

    return (
        <div className="relative group">
            <Link href={`/clients/${client.id}`}>
                <Card className="bg-[#121214] border-white/5 overflow-hidden hover:border-white/10 transition-all duration-300 cursor-pointer relative">
                    {/* Compact Banner */}
                    <div
                        className="absolute top-0 left-0 right-0 h-14"
                        style={{ background: `linear-gradient(135deg, ${client.accentColor || '#8B6C58'}40, transparent)` }}
                    />

                    <div className="p-4 flex items-start gap-3 relative z-10">
                        {/* Avatar - menor */}
                        <Avatar className="h-11 w-11 rounded-lg border border-white/10 shrink-0">
                            <AvatarImage src={client.logo} alt={client.name} />
                            <AvatarFallback className="rounded-lg bg-zinc-800 text-zinc-400 text-sm font-bold">{client.name[0]}</AvatarFallback>
                        </Avatar>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <h3 className="font-bold text-sm text-white truncate">{client.name}</h3>
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                            </div>
                            <p className="text-zinc-500 text-[11px] font-medium truncate">{client.handle || "@usuario"}</p>
                        </div>
                    </div>

                    {/* Stats - mais compacto */}
                    <div className="px-4 pb-3 relative z-10">
                        <div className="flex items-center gap-1.5">
                            <div className="flex-1 flex items-center gap-1.5 bg-zinc-800/30 rounded-md px-2 py-1.5 border border-white/5">
                                <div className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                                <span className="text-[10px] font-bold text-white">{stats.drafts}</span>
                                <span className="text-[9px] text-zinc-500">Rasc.</span>
                            </div>
                            <div className="flex-1 flex items-center gap-1.5 bg-amber-900/10 rounded-md px-2 py-1.5 border border-amber-900/20">
                                <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                <span className="text-[10px] font-bold text-amber-400">{stats.adjustments}</span>
                                <span className="text-[9px] text-amber-600/70">Ajust.</span>
                            </div>
                            <div className="flex-1 flex items-center gap-1.5 bg-yellow-900/10 rounded-md px-2 py-1.5 border border-yellow-900/20">
                                <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                                <span className="text-[10px] font-bold text-yellow-400">{stats.approvals}</span>
                                <span className="text-[9px] text-yellow-600/70">Aprov.</span>
                            </div>
                            <div className="flex-1 flex items-center gap-1.5 bg-emerald-900/10 rounded-md px-2 py-1.5 border border-emerald-900/20">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                <span className="text-[10px] font-bold text-emerald-400">{stats.approved}</span>
                                <span className="text-[9px] text-emerald-600/70">OK</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </Link>

            {/* Ações - Dropdown flutuante */}
            <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            className="h-7 w-7 bg-black/60 backdrop-blur-sm border border-white/10 hover:bg-white/10 text-white/70 hover:text-white"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
                        >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#121214] border-white/10 text-white min-w-[140px] z-50">
                        <DropdownMenuItem
                            className="text-xs gap-2 cursor-pointer focus:bg-white/10 focus:text-white"
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                onEdit?.(client)
                            }}
                        >
                            <Pencil className="h-3.5 w-3.5" />
                            Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/5" />
                        <DropdownMenuItem
                            className="text-xs gap-2 cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-400"
                            onClick={handleDelete}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            {showConfirm ? "Confirmar Exclusão?" : "Excluir"}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
