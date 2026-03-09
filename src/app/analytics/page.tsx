import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { BarChart3, TrendingUp, Users, CheckCircle2 } from "lucide-react"
import prisma from "@/lib/prisma/client"

export default async function AnalyticsPage() {
    const session = await auth()

    if (!session) {
        redirect("/login")
    }

    // Buscando estatísticas reais do banco
    const totalDemands = await prisma.demand.count()
    const totalApproved = await prisma.demand.count({ where: { status: 'APROVADO' } })
    const totalUsers = await prisma.user.count()
    const totalClients = await prisma.client.count()

    return (
        <div className="flex h-screen w-full bg-[#0a0a0a] text-foreground overflow-hidden font-sans">
            <SidebarNav />
            <main className="flex-1 overflow-y-auto bg-transparent p-8 relative z-10">
                <div className="max-w-6xl mx-auto space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Analytics & Relatórios</h1>
                        <p className="text-muted-foreground mt-1">Visão profissional do desempenho da sua agência.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                            { label: "Total de Demandas", value: totalDemands, icon: BarChart3, color: "text-blue-500", bg: "bg-blue-500/10" },
                            { label: "Aprovados", value: totalApproved, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                            { label: "Membros do Time", value: totalUsers, icon: Users, color: "text-primary", bg: "bg-primary/10" },
                            { label: "Clientes Ativos", value: totalClients, icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10" },
                        ].map((stat, i) => (
                            <div key={i} className="glass-card p-6 rounded-2xl border border-white/10 group relative overflow-hidden">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1">{stat.label}</p>
                                        <h3 className="text-2xl font-bold">{stat.value}</h3>
                                    </div>
                                    <div className={`p-3 rounded-xl ${stat.bg}`}>
                                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-center h-96 border-2 border-dashed border-white/5 rounded-3xl">
                        <div className="text-center">
                            <BarChart3 className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
                            <p className="text-zinc-500 font-medium">Os gráficos aparecerão aqui quando houver produção.</p>
                            <p className="text-zinc-600 text-xs mt-1">Sua agência está pronta para começar!</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
