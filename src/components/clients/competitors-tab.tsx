"use client"

import * as React from "react"
import { Client, Competitor } from "@/types/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Plus,
    Link as LinkIcon,
    ExternalLink,
    Trash2,
    Search,
    Users,
    Instagram,
    Globe,
    Youtube,
    Music2
} from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface CompetitorsTabProps {
    client: Client
    onUpdate: (client: Client) => void
}

export function CompetitorsTab({ client, onUpdate }: CompetitorsTabProps) {
    const [name, setName] = React.useState("")
    const [url, setUrl] = React.useState("")
    const [type, setType] = React.useState<Competitor['type']>("instagram")

    const addCompetitor = () => {
        if (!name || !url) return

        const newCompetitor: Competitor = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            url,
            type
        }

        onUpdate({
            ...client,
            competitors: [...(client.competitors || []), newCompetitor]
        })

        setName("")
        setUrl("")
        setType("instagram")
    }

    const removeCompetitor = (id: string) => {
        onUpdate({
            ...client,
            competitors: (client.competitors || []).filter(c => c.id !== id)
        })
    }

    const getIcon = (type: Competitor['type']) => {
        switch (type) {
            case 'instagram': return <Instagram className="h-4 w-4" />
            case 'tiktok': return <Music2 className="h-4 w-4" />
            case 'youtube': return <Youtube className="h-4 w-4" />
            case 'site': return <Globe className="h-4 w-4" />
            default: return <LinkIcon className="h-4 w-4" />
        }
    }

    return (
        <div className="flex-1 flex flex-col gap-6 overflow-hidden max-w-5xl mx-auto w-full">
            {/* Quick Add Form */}
            <div className="bg-[#0A0A0A] rounded-xl border border-white/5 p-4 flex flex-wrap items-end gap-3 shrink-0">
                <div className="flex-1 min-w-[200px] space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Nome do Concorrente</label>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Marca X"
                        className="h-9 bg-white/[0.02] border-white/5 text-xs focus:ring-primary/20"
                    />
                </div>
                <div className="flex-[2] min-w-[250px] space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Link / URL</label>
                    <Input
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://..."
                        className="h-9 bg-white/[0.02] border-white/5 text-xs focus:ring-primary/20"
                    />
                </div>
                <div className="w-[140px] space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Tipo</label>
                    <Select value={type} onValueChange={(v: any) => setType(v)}>
                        <SelectTrigger className="h-9 bg-white/[0.02] border-white/5 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#121214] border-white/10 text-white">
                            <SelectItem value="instagram">Instagram</SelectItem>
                            <SelectItem value="tiktok">TikTok</SelectItem>
                            <SelectItem value="youtube">YouTube</SelectItem>
                            <SelectItem value="site">Site</SelectItem>
                            <SelectItem value="others">Outros</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button
                    className="h-9 bg-primary hover:bg-primary/90 text-white font-bold px-6"
                    onClick={addCompetitor}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                </Button>
            </div>

            {/* Competitors List */}
            <div className="bg-[#0A0A0A] rounded-xl border border-white/5 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Análise de Concorrência</h3>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-zinc-500 border-white/10">
                        {(client.competitors || []).length} monitorados
                    </Badge>
                </div>

                <div className="flex-1 overflow-y-auto p-4 content-start">
                    {(client.competitors || []).length === 0 ? (
                        <div className="py-20 flex flex-col items-center justify-center text-zinc-600 space-y-3">
                            <div className="p-4 rounded-full bg-white/5">
                                <Users className="h-8 w-8 opacity-20" />
                            </div>
                            <p className="text-sm font-medium">Nenhum concorrente cadastrado.</p>
                            <p className="text-xs text-zinc-700">Adicione os principais players do mercado para referência.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {(client.competitors || []).map(comp => (
                                <Card
                                    key={comp.id}
                                    className="p-4 bg-white/[0.02] border-white/5 hover:border-white/10 transition-colors flex items-center justify-between gap-4"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-10 w-10 rounded-xl bg-zinc-800/50 flex items-center justify-center text-zinc-400 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                            {getIcon(comp.type)}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-sm font-bold text-white truncate">{comp.name}</h4>
                                            <p className="text-[10px] text-zinc-500 truncate lowercase">{comp.url}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="icon-xs"
                                            variant="ghost"
                                            className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-white/5"
                                            asChild
                                        >
                                            <a href={comp.url} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="h-3.5 w-3.5" />
                                            </a>
                                        </Button>
                                        <Button
                                            size="icon-xs"
                                            variant="ghost"
                                            className="h-8 w-8 text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
                                            onClick={() => removeCompetitor(comp.id)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
