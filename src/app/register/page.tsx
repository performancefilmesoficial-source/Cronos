"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Phone, ArrowLeft, ArrowRight } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { toast } from "sonner"

export default function RegisterPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(false)
    const [formData, setFormData] = React.useState({
        name: "",
        email: "",
        whatsapp: ""
    })

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                body: JSON.stringify(formData),
                headers: { "Content-Type": "application/json" }
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.error || "Erro ao solicitar cadastro")
            } else {
                toast.success("Solicitação enviada!", {
                    description: "Seu cadastro foi realizado. Agora você já pode criar sua senha no primeiro acesso."
                })
                router.push("/login")
            }
        } catch (error) {
            toast.error("Erro interno", {
                description: "Tente novamente mais tarde."
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background">
            <div className="absolute inset-0 z-0 bg-background">
                <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-muted/20" />
                <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            </div>

            <div className="absolute top-8 right-8 z-20">
                <ThemeToggle />
            </div>

            <div className="relative z-10 w-full max-w-md px-4 animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black tracking-tight text-foreground mb-2">
                        CRONOS <span className="text-primary">MEDIA</span>
                    </h1>
                </div>

                <Card className="bg-card/50 backdrop-blur-2xl border-border shadow-2xl overflow-hidden rounded-[2rem]">
                    <form onSubmit={handleRegister}>
                        <CardHeader className="space-y-1 pb-4 pt-8">
                            <CardTitle className="text-2xl text-foreground font-bold text-center">Cadastrar</CardTitle>
                            <CardDescription className="text-muted-foreground/60 text-xs text-center">
                                Crie sua conta para começar a gerenciar suas demandas.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 px-8">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-muted-foreground/80 text-[10px] uppercase tracking-[0.2em] font-bold">Nome Completo</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30" />
                                    <Input
                                        id="name"
                                        placeholder="Seu nome"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="pl-10 h-12 bg-background/50 border-border rounded-xl"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-muted-foreground/80 text-[10px] uppercase tracking-[0.2em] font-bold">E-mail Corporativo</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30" />
                                    <Input
                                        id="email"
                                        placeholder="seu@email.com"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="pl-10 h-12 bg-background/50 border-border rounded-xl"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-muted-foreground/80 text-[10px] uppercase tracking-[0.2em] font-bold">WhatsApp</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30" />
                                    <Input
                                        id="phone"
                                        placeholder="(xx) xxxxx-xxxx"
                                        required
                                        value={formData.whatsapp}
                                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                        className="pl-10 h-12 bg-background/50 border-border rounded-xl"
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-6 pt-6 pb-12 px-8">
                            <Button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 rounded-xl"
                                disabled={isLoading}
                            >
                                {isLoading ? "Enviando..." : (
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="uppercase tracking-widest text-[11px]">Solicitar Cadastro</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </div>
                                )}
                            </Button>

                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.push("/login")}
                                className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground hover:text-foreground"
                            >
                                <ArrowLeft className="h-3 w-3 mr-2" />
                                Voltar para o Login
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    )
}
