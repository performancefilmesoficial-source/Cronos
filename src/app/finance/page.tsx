import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { DollarSign, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import prisma from "@/lib/prisma/client"

export default async function FinancePage() {
    const session = await auth()

    if (!session) {
        redirect("/login")
    }

    // Buscando dados reais do banco profissional
    const transactions = await prisma.transaction.findMany({
        orderBy: { date: 'desc' },
        include: { client: true }
    })

    const totalIncome = transactions.filter((t: typeof transactions[0]) => t.type === 'INCOME').reduce((acc: number, t: typeof transactions[0]) => acc + t.value, 0)
    const totalExpense = transactions.filter((t: typeof transactions[0]) => t.type === 'EXPENSE').reduce((acc: number, t: typeof transactions[0]) => acc + t.value, 0)
    const balance = totalIncome - totalExpense

    return (
        <div className="flex h-screen w-full bg-[#0a0a0a] text-foreground overflow-hidden font-sans">
            <SidebarNav />
            <main className="flex-1 overflow-y-auto bg-transparent p-6 md:p-8 relative z-10">
                <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                                <DollarSign className="h-8 w-8 text-emerald-500 bg-emerald-500/10 p-1.5 rounded-xl" />
                                Financeiro
                            </h1>
                            <p className="text-muted-foreground text-sm mt-1">Gestão de fluxo de caixa e planejamento profissional</p>
                        </div>
                        <Button variant="outline" className="h-10 gap-2 bg-black/40 border-white/10 text-xs font-bold uppercase text-zinc-300 hover:bg-white/5 disabled:opacity-50" disabled>
                            <Download className="h-4 w-4" />
                            Exportar Relatório
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-card p-6 rounded-2xl border border-white/10">
                            <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-2">Entradas</p>
                            <h3 className="text-3xl font-bold text-emerald-500">R$ {totalIncome.toLocaleString('pt-BR')}</h3>
                        </div>
                        <div className="glass-card p-6 rounded-2xl border border-white/10">
                            <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-2">Saídas</p>
                            <h3 className="text-3xl font-bold text-red-500">R$ {totalExpense.toLocaleString('pt-BR')}</h3>
                        </div>
                        <div className="glass-card p-6 rounded-2xl border border-white/10">
                            <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-2">Saldo Geral</p>
                            <h3 className={`text-3xl font-bold ${balance >= 0 ? "text-emerald-500" : "text-red-500"}`}>R$ {balance.toLocaleString('pt-BR')}</h3>
                        </div>
                    </div>

                    <div className="flex items-center justify-center h-64 border-2 border-dashed border-white/5 rounded-3xl">
                        <div className="text-center">
                            <p className="text-zinc-500 font-medium">Nenhum lançamento encontrado.</p>
                            <p className="text-zinc-600 text-xs mt-1">Clique em "Novo Lançamento" para começar.</p>
                            <Button className="mt-4 bg-primary text-white font-bold uppercase text-[10px] px-8 py-2 rounded-xl">
                                Novo Lançamento
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
