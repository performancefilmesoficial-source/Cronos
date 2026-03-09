"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Mail, ArrowRight } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

import { signIn } from "next-auth/react"
import { toast } from "sonner"

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(false)
    const [email, setEmail] = React.useState("")
    const [password, setPassword] = React.useState("")

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                toast.error("Credenciais inválidas", {
                    description: "Verifique seu e-mail e senha e tente novamente."
                })
            } else {
                toast.success("Bem-vindo!", {
                    description: "Redirecionando para o dashboard..."
                })
                router.push("/")
                router.refresh()
            }
        } catch (error) {
            toast.error("Erro ao autenticar", {
                description: "Ocorreu um erro inesperado. Tente novamente mais tarde."
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background">
            {/* Adaptive Gradient Background */}
            <div className="absolute inset-0 z-0 bg-background">
                <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-muted/20" />
                {/* Subtle glass effect blobs */}
                <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            </div>

            {/* Theme Toggle at top-right */}
            <div className="absolute top-8 right-8 z-20">
                <ThemeToggle />
            </div>

            {/* Main Container */}
            <div className="relative z-10 w-full max-w-md px-4 animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black tracking-tight text-foreground mb-2">
                        CRONOS <span className="text-primary">MEDIA</span>
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium tracking-wide">Gestão Inteligente de Demandas</p>
                </div>

                <Card className="bg-card/50 backdrop-blur-2xl border-border shadow-2xl overflow-hidden rounded-[2rem]">
                    <form onSubmit={handleLogin}>
                        <CardHeader className="space-y-1 pb-4 pt-8">
                            <CardTitle className="text-2xl text-foreground font-bold text-center">Entrar</CardTitle>
                            <CardDescription className="text-muted-foreground/60 text-xs text-center">
                                Bem-vindo de volta! Faça login na sua conta.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 px-8">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-muted-foreground/80 text-[10px] uppercase tracking-[0.2em] font-bold">E-mail</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30" />
                                    <Input
                                        id="email"
                                        placeholder="seu@email.com"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 h-12 bg-background/50 border-border focus-visible:ring-primary/50 transition-all rounded-xl"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-muted-foreground/80 text-[10px] uppercase tracking-[0.2em] font-bold">Senha</Label>
                                    <Button variant="link" className="px-0 font-bold text-[10px] uppercase tracking-wider text-primary hover:text-primary/80 h-auto">
                                        Perdeu a senha?
                                    </Button>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30" />
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 h-12 bg-background/50 border-border focus-visible:ring-primary/50 transition-all rounded-xl"
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-6 pt-6 pb-12 px-8">
                            <Button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 rounded-xl transition-all shadow-lg shadow-primary/20 group text-sm"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                        <span>Autenticando...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="uppercase tracking-widest text-[11px]">Acessar Dashboard</span>
                                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                )}
                            </Button>

                            <div className="flex flex-col items-center gap-3">
                                <span className="text-[10px] text-muted-foreground/40 uppercase tracking-widest">Ainda não tem acesso?</span>
                                <Button variant="outline" className="h-10 border-border bg-transparent text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-accent w-full rounded-xl transition-all">
                                    Solicitar cadastro
                                </Button>
                            </div>
                        </CardFooter>
                    </form>
                </Card>

                {/* Footer info */}
                <div className="mt-12 text-center text-[10px] text-muted-foreground/30 uppercase tracking-[0.3em]">
                    &copy; {new Date().getFullYear()} Cronos Media &bull; Agency Innovation
                </div>
            </div>
        </div>
    )
}
