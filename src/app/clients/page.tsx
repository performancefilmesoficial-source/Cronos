import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { ClientRepository } from "@/repositories/client-repository"
import { Badge } from "@/components/ui/badge"
import { ClientListContent } from "@/components/clients/client-list-content"

export default async function ClientsPage() {
    const session = await auth()

    if (!session) {
        redirect("/login")
    }

    const clients = await ClientRepository.getAll()

    return (
        <div className="flex h-screen w-full bg-[#0a0a0a] text-foreground overflow-hidden font-sans">
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
                        <p className="text-muted-foreground text-sm">Gerencie seus clientes e áreas de trabalho de forma profissional.</p>
                    </div>
                </div>

                {/* Componente Client-Side apenas para interação de busca/filtro e dialogs */}
                <ClientListContent initialClients={clients as any} />
            </main>
        </div>
    )
}
