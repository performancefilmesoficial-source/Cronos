import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, CreditCard, Settings, BarChart3, Rocket } from "lucide-react"

export function SidebarNav() {
    return (
        <div className="w-72 border-r border-white/5 h-screen p-4 flex flex-col gap-6 bg-background/40 backdrop-blur-xl">
            <div className="px-2 mb-2 mt-2">
                <div className="flex items-center gap-2">
                    <img src="/logo-p.png" alt="Social Flow Logo" className="h-10 w-auto" />
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <div className="px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-2">Principal</div>
                <Button variant="ghost" className="justify-start gap-3 h-10 px-3 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-primary/10 transition-all group" asChild>
                    <Link href="/">
                        <LayoutDashboard className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        Task Geral
                    </Link>
                </Button>
                <Button variant="ghost" className="justify-start gap-3 h-10 px-3 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-primary/10 transition-all group" asChild>
                    <Link href="/clients">
                        <Users className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        Clientes
                    </Link>
                </Button>
                <Button variant="ghost" className="justify-start gap-3 h-10 px-3 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-primary/10 transition-all group" asChild>
                    <Link href="/analytics">
                        <BarChart3 className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        Analytics
                    </Link>
                </Button>
                <Button variant="ghost" className="justify-start gap-3 h-10 px-3 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-primary/10 transition-all group" asChild>
                    <Link href="/finance">
                        <CreditCard className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        Financeiro
                    </Link>
                </Button>
            </div>

            <div className="flex flex-col gap-1 mt-4">
                <div className="px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-2">Sistema</div>
                <Button variant="ghost" className="justify-start gap-3 h-10 px-3 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-primary/10 transition-all group" asChild>
                    <Link href="/settings">
                        <Settings className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        Configurações
                    </Link>
                </Button>
                <Button variant="ghost" className="justify-start gap-3 h-10 px-3 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-primary/10 transition-all group" asChild>
                    <Link href="/admin">
                        <Users className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        Admin
                    </Link>
                </Button>
            </div>

            <div className="mt-auto m-2 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <h4 className="font-semibold text-sm mb-1 relative z-10">Plano Pro</h4>
                <p className="text-xs text-muted-foreground mb-3 relative z-10">Acesso ilimitado a todas as ferramentas.</p>
                <Button size="sm" className="w-full bg-primary/90 hover:bg-primary shadow-lg shadow-primary/20 relative z-10 text-xs h-8">
                    Upgrade Agora
                </Button>
            </div>
        </div>
    )
}
