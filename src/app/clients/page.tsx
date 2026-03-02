"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, MoreHorizontal, Link as LinkIcon, Users, Rocket, Loader2 } from "lucide-react"
import { MOCK_CLIENTS, Client } from "@/types/client"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { NewClientDialog } from "@/components/clients/new-client-dialog"
import { ClientCard } from "@/components/clients/client-card"
import { toast } from "sonner"

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS)
    const [editingClient, setEditingClient] = useState<Client | null>(null)
    const [editDialogOpen, setEditDialogOpen] = useState(false)

    useEffect(() => {
        const savedClients = localStorage.getItem("sf-clients")
        if (savedClients) {
            try {
                const parsed = JSON.parse(savedClients)
                if (Array.isArray(parsed) && parsed.every((c: any) => c.stats)) {
                    setClients(parsed)
                }
            } catch (error) {
                console.error("Failed to parse clients from local storage", error)
            }
        }
    }, [])

    const handleCreateClient = (newClient: Client) => {
        const updatedClients = [...clients, newClient]
        setClients(updatedClients)
        localStorage.setItem("sf-clients", JSON.stringify(updatedClients))
    }

    const handleSaveClient = (updatedClient: Client) => {
        // Se editando, atualizar o existente; se novo, adicionar
        const exists = clients.find(c => c.id === updatedClient.id)
        let updatedClients: Client[]

        if (exists) {
            updatedClients = clients.map(c => c.id === updatedClient.id ? updatedClient : c)
            toast.success("Cliente atualizado", {
                description: `"${updatedClient.name}" foi atualizado com sucesso.`
            })
        } else {
            updatedClients = [...clients, updatedClient]
        }

        setClients(updatedClients)
        localStorage.setItem("sf-clients", JSON.stringify(updatedClients))
        setEditingClient(null)
        setEditDialogOpen(false)
    }

    const handleDeleteClient = (clientId: string) => {
        const client = clients.find(c => c.id === clientId)
        const updatedClients = clients.filter(c => c.id !== clientId)
        setClients(updatedClients)
        localStorage.setItem("sf-clients", JSON.stringify(updatedClients))
        toast.success("Cliente excluído", {
            description: `"${client?.name}" foi removido com sucesso.`
        })
    }

    const handleEditClient = (client: Client) => {
        setEditingClient(client)
        setEditDialogOpen(true)
    }

    return (
        <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
            <div className="absolute right-0 bottom-0 -z-10 h-[500px] w-[500px] bg-primary/10 opacity-20 blur-[120px] rounded-full" />

            <SidebarNav />
            <main className="flex-1 overflow-y-auto bg-transparent p-8 relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-2">
                            Clientes
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 align-top ml-1">
                                {clients.length}
                            </Badge>
                        </h1>
                        <p className="text-muted-foreground text-sm">Gerencie seus clientes e áreas de trabalho.</p>
                    </div>
                    <NewClientDialog onClientCreate={handleCreateClient} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                    {clients.map((client) => (
                        <ClientCard
                            key={client.id}
                            client={client}
                            onEdit={handleEditClient}
                            onDelete={handleDeleteClient}
                        />
                    ))}
                </div>
            </main>

            {/* Dialog de edição - controlado externamente */}
            <NewClientDialog
                onClientCreate={handleSaveClient}
                editClient={editingClient}
                externalOpen={editDialogOpen}
                onExternalOpenChange={(open) => {
                    setEditDialogOpen(open)
                    if (!open) setEditingClient(null)
                }}
            />
        </div>
    )
}
