"use client"

import { useState } from "react"
import { Search, Plus, Filter, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { NewClientDialog } from "@/components/clients/new-client-dialog"
import { ClientAccordionItem } from "@/components/clients/client-accordion-item"

interface ClientListContentProps {
    initialClients: any[]
}

export function ClientListContent({ initialClients }: ClientListContentProps) {
    const [clients, setClients] = useState(initialClients)
    const [searchTerm, setSearchTerm] = useState("")

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.industry?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleClientUpdate = () => {
        // Refresh logic would go here, maybe window.location.reload() or re-fetch
        window.location.reload()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome ou setor..."
                        className="pl-9 bg-[#111] border-white/5 focus:border-primary/50 transition-all rounded-xl"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <NewClientDialog onClientCreate={handleClientUpdate}>
                        <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 gap-2 rounded-xl px-6">
                            <Plus className="h-4 w-4" />
                            Novo Cliente
                        </Button>
                    </NewClientDialog>
                </div>
            </div>

            {filteredClients.length > 0 ? (
                <div className="space-y-4">
                    {filteredClients.map((client) => (
                        <ClientAccordionItem key={client.id} client={client} />
                    ))}
                </div>
            ) : (
                <div className="py-24 flex flex-col items-center justify-center text-center space-y-4 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl animate-in fade-in duration-500">
                    <div className="h-20 w-20 rounded-full bg-zinc-900 flex items-center justify-center border border-white/5 shadow-inner">
                        <Users className="h-10 w-10 text-zinc-700" />
                    </div>
                    <div className="max-w-xs">
                        <h3 className="text-xl font-bold bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">Nenhum cliente</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                            Comece adicionando seu primeiro cliente para gerenciar demandas e conteúdos.
                        </p>
                    </div>
                    <NewClientDialog onClientCreate={handleClientUpdate}>
                        <Button variant="outline" className="border-white/10 hover:bg-white/5 gap-2 rounded-xl mt-4">
                            <Plus className="h-4 w-4" />
                            Criar Primeiro Cliente
                        </Button>
                    </NewClientDialog>
                </div>
            )}
        </div>
    )
}
