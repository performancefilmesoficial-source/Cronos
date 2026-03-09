"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Client } from "@/types/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronUp, Image as ImageIcon, CheckCircle, Clock, AlertCircle } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

interface ClientAccordionItemProps {
    client: Client
}

type ClientStatus = "Em andamento" | "Aguardando aprovação" | "Aprovado"

export function ClientAccordionItem({ client }: ClientAccordionItemProps) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(true)
    const [status, setStatus] = useState<ClientStatus>("Em andamento")

    const getStatusColor = (s: ClientStatus) => {
        switch (s) {
            case "Em andamento": return "text-blue-500 bg-blue-500/10 border-blue-500/20"
            case "Aguardando aprovação": return "text-amber-500 bg-amber-500/10 border-amber-500/20"
            case "Aprovado": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
        }
    }

    const getStatusIcon = (s: ClientStatus) => {
        switch (s) {
            case "Em andamento": return <Clock className="h-3 w-3 mr-1" />
            case "Aguardando aprovação": return <AlertCircle className="h-3 w-3 mr-1" />
            case "Aprovado": return <CheckCircle className="h-3 w-3 mr-1" />
        }
    }

    return (
        <Card className="bg-background/40 backdrop-blur-xl border-white/5 overflow-hidden transition-all duration-200">
            <div
                onClick={() => router.push(`/clients/${client.id}`)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center font-bold text-white/80">
                        {client.name[0]}
                    </div>
                    <div>
                        <h3 className="font-bold text-base">{client.name}</h3>
                        <p className="text-xs text-muted-foreground">{client.industry}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Badge variant="outline" className={`border ${getStatusColor(status)}`}>
                        {getStatusIcon(status)}
                        {status}
                    </Badge>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        onClick={(e) => {
                            e.stopPropagation()
                            setIsOpen(!isOpen)
                        }}
                    >
                        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            {isOpen && (
                <div className="p-4 pt-0 animate-in slide-in-from-top-2 duration-200">
                    <div className="h-px w-full bg-white/5 mb-4" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/60">Informações Gerais</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground block text-xs">Contrato</span>
                                    <span className={client.activeContract ? "text-emerald-500" : "text-zinc-500"}>
                                        {client.activeContract ? "Ativo" : "Inativo"}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-xs">Equipe</span>
                                    <span>3 membros</span>
                                </div>
                            </div>
                            <Button variant="link" className="p-0 h-auto text-primary text-xs" asChild>
                                <Link href={`/clients/${client.id}`}>
                                    Ver detalhes completos &rarr;
                                </Link>
                            </Button>
                        </div>

                        <div className="flex flex-col items-end gap-3 justify-center">
                            <div className="flex gap-2 w-full md:w-auto">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 flex-1">
                                            Alterar Status
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-[#1c1c1e] border-white/10 text-white">
                                        <DropdownMenuItem onClick={() => setStatus("Em andamento")}>
                                            <Clock className="w-4 h-4 mr-2 text-blue-500" /> Em andamento
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setStatus("Aguardando aprovação")}>
                                            <AlertCircle className="w-4 h-4 mr-2 text-amber-500" /> Aguardando aprovação
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setStatus("Aprovado")}>
                                            <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" /> Aprovado
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    )
}
