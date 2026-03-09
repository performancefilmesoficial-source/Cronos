"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, ArrowRight } from "lucide-react"
import { toast } from "sonner"

import { Suspense } from "react"

function SetupPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const email = searchParams.get("email")

    const [password, setPassword] = React.useState("")
    const [confirmPassword, setConfirmPassword] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)

    if (!email) {
        return <div className="p-8 text-center text-red-500">Erro: E-mail não fornecido.</div>
    }

    const handleSavePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            return toast.error("Senhas não conferem!")
        }

        setIsLoading(true)
        try {
            const res = await fetch("/api/setup-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            })

            if (!res.ok) {
                const data = await res.json()
                toast.error(data.error || "Erro ao salvar senha")
            } else {
                toast.success("Senha cadastrada!", { description: "Agora você pode entrar no sistema." })
                router.push("/login")
            }
        } catch (error) {
            toast.error("Erro interno. Tente mais tarde.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSavePassword}>
            <CardHeader className="text-center">
                <CardTitle>Olá!</CardTitle>
                <CardDescription>Para o Sr. {email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-8">
                <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold tracking-widest">Nova Senha</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30" />
                        <Input
                            type="password"
                            autoFocus
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 h-12 bg-background/50 border-border rounded-xl"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold tracking-widest">Confirmar Senha</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30" />
                        <Input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-10 h-12 bg-background/50 border-border rounded-xl"
                        />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="px-8 pb-12">
                <Button className="w-full bg-primary h-12 rounded-xl font-bold" disabled={isLoading}>
                    {isLoading ? "Salvando..." : (
                        <div className="flex items-center gap-2">
                            <span>CRIAR MINHA SENHA</span>
                            <ArrowRight className="h-4 w-4" />
                        </div>
                    )}
                </Button>
            </CardFooter>
        </form>
    )
}

export default function SetupPasswordPage() {
    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background">
            <div className="relative z-10 w-full max-w-md px-4">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-foreground">
                        CRONOS <span className="text-primary">MEDIA</span>
                    </h1>
                    <p className="text-muted-foreground text-sm mt-2">Defina sua senha de primeiro acesso</p>
                </div>

                <Card className="bg-card/50 backdrop-blur-2xl border-border rounded-[2rem]">
                    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Carregando...</div>}>
                        <SetupPasswordForm />
                    </Suspense>
                </Card>
            </div>
        </div>
    )
}
