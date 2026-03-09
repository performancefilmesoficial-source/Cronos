"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, CreditCard, Settings, BarChart3, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"

export function SidebarNav() {
    return (
        <div className="w-72 border-r border-border h-screen p-4 flex flex-col gap-6 bg-card/40 backdrop-blur-xl">
            <div className="px-2 mb-2 flex items-center justify-center">
                <img src="/logo-cronos.png" alt="Cronos Logo" className="h-28 w-auto object-contain drop-shadow-lg" />
            </div>

            <div className="flex flex-col gap-1">
                <div className="px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Principal</div>
                <Button variant="ghost" className="justify-start gap-3 h-10 px-3 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/10 transition-all group" asChild>
                    <Link href="/">
                        <LayoutDashboard className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        Task Geral
                    </Link>
                </Button>
                <Button variant="ghost" className="justify-start gap-3 h-10 px-3 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/10 transition-all group" asChild>
                    <Link href="/clients">
                        <Users className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        Clientes
                    </Link>
                </Button>
                <Button variant="ghost" className="justify-start gap-3 h-10 px-3 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/10 transition-all group" asChild>
                    <Link href="/analytics">
                        <BarChart3 className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        Análise
                    </Link>
                </Button>
                <Button variant="ghost" className="justify-start gap-3 h-10 px-3 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/10 transition-all group" asChild>
                    <Link href="/finance">
                        <CreditCard className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        Financeiro
                    </Link>
                </Button>
            </div>

            <div className="flex flex-col gap-1">
                <div className="px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Sistema</div>
                <Button variant="ghost" className="justify-start gap-3 h-10 px-3 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/10 transition-all group" asChild>
                    <Link href="/settings">
                        <Settings className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        Configurações
                    </Link>
                </Button>
            </div>
            <div className="mt-auto pt-4 border-t border-border">
                <Button
                    variant="ghost"
                    onClick={() => signOut()}
                    className="w-full justify-center h-10 px-4 text-xs font-bold uppercase tracking-widest text-rose-500 hover:text-white hover:bg-rose-600 shadow-sm transition-all rounded-xl border border-rose-500/20"
                >
                    Sair do Sistema
                </Button>
            </div>
        </div>
    )
}
