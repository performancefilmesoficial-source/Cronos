"use client"

import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Shield, Settings } from "lucide-react"

export default function AdminPage() {
    return (
        <div className="flex h-screen w-full bg-[#0a0a0a] text-foreground overflow-hidden font-sans">
            <SidebarNav />

            <main className="flex-1 overflow-y-auto bg-transparent p-8 relative z-10">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Administração</h1>
                            <p className="text-muted-foreground">Ferramentas avançadas e manutenção do sistema.</p>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-12">
                        {/* Configurações do Sistema */}
                        <div className="md:col-span-7">
                            <Card className="bg-[#111] border-white/5 shadow-2xl">
                                <CardHeader>
                                    <CardTitle>Configurações Globais</CardTitle>
                                    <CardDescription>Gerencie as configurações fundamentais do sistema.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-zinc-400">
                                        Use a aba de configurações para gerenciar usuários, integrações de WhatsApp e preferências do sistema.
                                    </p>
                                    <Button variant="outline" className="mt-4 gap-2 border-white/10 hover:bg-white/5" onClick={() => window.location.href = '/settings'}>
                                        <Settings className="h-4 w-4" />
                                        Ir para Configurações
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Danger Zone */}
                        <div className="md:col-span-5">
                            <Card className="bg-red-500/5 border-red-500/20 backdrop-blur-xl">
                                <CardHeader>
                                    <CardTitle className="text-red-400 flex items-center gap-2 text-sm">
                                        <Shield className="h-4 w-4" />
                                        Zona de Perigo
                                    </CardTitle>
                                    <CardDescription className="text-[10px] text-red-400/60">
                                        Ações irreversíveis para o sistema.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <p className="text-[11px] text-zinc-500">
                                            Se deseja limpar todos os dados e voltar ao estado inicial, utilize o botão abaixo. Isso removerá dados locais e sincronizados.
                                        </p>
                                        <Button
                                            variant="destructive"
                                            className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 text-xs h-9"
                                            onClick={() => {
                                                if (confirm("TEM CERTEZA? Isso fará logout e limpará dados locais.")) {
                                                    localStorage.clear()
                                                    window.location.href = '/login'
                                                }
                                            }}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Resetar Local Data
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
