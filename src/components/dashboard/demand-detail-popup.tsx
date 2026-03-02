"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Image as ImageIcon, Clock, CheckCircle, AlertCircle, Play, FileText, Share2, UserMinus, UserPlus, Link, Send, X } from "lucide-react"
import { cn } from "@/lib/utils"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DataService, User, Demand, DemandStatus } from "@/lib/data"

// Removed local definitions to avoid mismatch

interface DemandDetailPopupProps {
    demand: Demand
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onUpdate: (updatedDemand: Demand) => void
}

export function DemandDetailPopup({ demand, isOpen, onOpenChange, onUpdate }: DemandDetailPopupProps) {
    const [localDemand, setLocalDemand] = React.useState<Demand>(demand)
    const [users, setUsers] = React.useState<User[]>([])
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
        setUsers(DataService.getUsers())
        const handleDataChange = () => setUsers(DataService.getUsers())
        window.addEventListener("sf-data-change", handleDataChange)
        return () => window.removeEventListener("sf-data-change", handleDataChange)
    }, [])


    // Sync local state when demand prop changes (when opening for a new post)
    React.useEffect(() => {
        setLocalDemand({
            ...demand,
            status: demand.assignedTo ? demand.status : null
        })
    }, [demand])

    const handleSave = () => {
        onUpdate(localDemand)
        onOpenChange(false)
    }

    const handleMediaClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setLocalDemand(prev => ({
                    ...prev,
                    mediaUrl: reader.result as string
                }))
            }
            reader.readAsDataURL(file)
        }
    }

    const [message, setMessage] = React.useState("")

    const handleSendMessage = () => {
        if (!message.trim()) return

        const newComment = {
            id: Date.now(),
            user: "Equipe", // Or dynamic user name
            text: message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: "internal" as const
        }

        const updatedDemand = {
            ...localDemand,
            comments: [...(localDemand.comments || []), newComment]
        }

        setLocalDemand(updatedDemand)
        setMessage("")

        // Immediate save for chat
        onUpdate(updatedDemand)
    }

    const isAlert = !localDemand.assignedTo || !localDemand.status

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className={cn(
                "bg-[#0A0A0B] text-white overflow-hidden p-0 gap-0 transition-all duration-300 border-white/10 flex",
                localDemand.assignedTo ? "sm:max-w-[1000px]" : "sm:max-w-[700px]"
            )} showCloseButton={!localDemand.assignedTo}>
                {/* Main Content Column */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#0A0A0B] relative z-20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32 pointer-events-none" />

                    <DialogHeader className="p-6 pb-4 relative z-10">
                        <div className="absolute right-6 top-6 z-20">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    {localDemand.assignedTo ? (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 text-[10px] text-white/70 hover:text-white hover:bg-white/5 gap-2 font-bold uppercase tracking-wider"
                                        >
                                            <Avatar className="h-5 w-5">
                                                <AvatarFallback className="bg-primary/20 text-primary text-[9px] uppercase">{localDemand.assignedTo[0]}</AvatarFallback>
                                                {users.find(u => u.name === localDemand.assignedTo)?.avatar && <AvatarImage src={users.find(u => u.name === localDemand.assignedTo)?.avatar || ""} />}
                                            </Avatar>
                                            {localDemand.assignedTo}
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 px-3 text-[9px] text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 gap-1.5 font-bold uppercase tracking-wider animate-pulse border border-emerald-500/20 rounded-full"
                                        >
                                            <UserPlus className="w-3 h-3" />
                                            Atribuir
                                        </Button>
                                    )}
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-[#121214] border-white/10 text-white min-w-[160px] z-[100]">
                                    <div className="p-2 text-[10px] uppercase font-bold text-muted-foreground/60 tracking-widest px-3 py-2 border-b border-white/5">Membros</div>
                                    {users.map(user => (
                                        <DropdownMenuItem
                                            key={user.id}
                                            className="text-[11px] py-2 focus:bg-primary/20 focus:text-white cursor-pointer gap-2"
                                            onClick={() => {
                                                const updated = {
                                                    ...localDemand,
                                                    assignedTo: user.name,
                                                    status: localDemand.status || "Em andamento"
                                                }
                                                setLocalDemand(updated)
                                                onUpdate(updated)
                                            }}
                                        >
                                            <Avatar className="h-4 w-4">
                                                <AvatarFallback className="bg-white/10 text-[8px] uppercase">{user.name[0]}</AvatarFallback>
                                                {user.avatar && <AvatarImage src={user.avatar} />}
                                            </Avatar>
                                            {user.name}
                                        </DropdownMenuItem>
                                    ))}
                                    {localDemand.assignedTo && (
                                        <>
                                            <div className="h-px bg-white/5 my-1" />
                                            <DropdownMenuItem
                                                className="text-[11px] py-2 text-red-500 focus:bg-red-500/20 focus:text-red-400 cursor-pointer gap-2"
                                                onClick={() => {
                                                    const updated = { ...localDemand, assignedTo: null, status: null }
                                                    setLocalDemand(updated)
                                                    onUpdate(updated)
                                                }}
                                            >
                                                <UserMinus className="w-4 h-4" />
                                                Remover Atribuição
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 uppercase text-[10px] tracking-widest font-bold">
                                {localDemand.client}
                            </Badge>
                            <Badge variant="secondary" className="bg-white/5 text-muted-foreground border-white/5 text-[10px]">
                                {localDemand.type}
                            </Badge>
                        </div>
                        <DialogTitle className="text-2xl font-bold tracking-tight">{localDemand.title}</DialogTitle>
                    </DialogHeader>

                    <div className="px-6 py-2 flex items-center justify-between relative z-10 border-b border-white/5">
                        <div className="flex gap-2">
                            {(["Em andamento", "Aguardando aprovação", "Aguardando ajuste", "Aprovado"] as DemandStatus[]).map((s) => (
                                <Button
                                    key={s}
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                        "h-8 text-[11px] font-medium border-white/5 transition-all outline-none ring-0 focus-visible:ring-0",
                                        localDemand.status === s
                                            ? s === "Aprovado" ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/30"
                                                : s === "Aguardando aprovação" ? "bg-amber-500/20 text-amber-500 border-amber-500/30"
                                                    : s === "Aguardando ajuste" ? "bg-orange-500/20 text-orange-500 border-orange-500/30 animate-pulse duration-75" // Fast blink
                                                        : "bg-blue-500/20 text-blue-500 border-blue-500/30"
                                            : "bg-white/5 text-muted-foreground hover:bg-white/10"
                                    )}
                                    disabled={!localDemand.assignedTo}
                                    onClick={() => {
                                        const updated = { ...localDemand, status: s }
                                        setLocalDemand(updated)
                                        // Auto-save status change
                                        onUpdate(updated)
                                    }}
                                >
                                    {s === "Aprovado" && <CheckCircle className="w-3 h-3 mr-1.5" />}
                                    {s === "Aguardando aprovação" && <AlertCircle className="w-3 h-3 mr-1.5" />}
                                    {s === "Aguardando ajuste" && <AlertCircle className="w-3 h-3 mr-1.5" />}
                                    {s === "Em andamento" && <Clock className="w-3 h-3 mr-1.5" />}
                                    {s}
                                </Button>
                            ))}
                        </div>


                    </div>

                    <div className="p-6 space-y-6 relative z-10 flex-1 overflow-y-auto max-h-[70vh]">
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Tema do Conteúdo</Label>
                                    <Input
                                        value={localDemand.theme || ""}
                                        onChange={(e) => setLocalDemand({ ...localDemand, theme: e.target.value })}
                                        className="bg-white/5 border-white/5 focus-visible:ring-primary/50 text-sm h-10 rounded-xl"
                                        placeholder="Defina o tema..."
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Briefing / Descrição</Label>
                                    <Textarea
                                        value={localDemand.briefing || ""}
                                        onChange={(e) => setLocalDemand({ ...localDemand, briefing: e.target.value })}
                                        className="bg-white/5 border-white/5 focus-visible:ring-primary/50 text-sm min-h-[200px] rounded-xl resize-none"
                                        placeholder="Escreva as instruções..."
                                    />
                                </div>
                            </div>

                            {/* Conditional Media Field */}
                            {(localDemand.status === "Aguardando aprovação" || localDemand.status === "Aprovado" || localDemand.status === "Aguardando ajuste") && (
                                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold font-sans">Mídia Final</Label>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={handleFileChange}
                                        accept="image/*,video/*"
                                    />
                                    <div
                                        onClick={handleMediaClick}
                                        className="aspect-video bg-zinc-900 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-3 group hover:border-primary/50 transition-colors cursor-pointer overflow-hidden relative"
                                    >
                                        {localDemand.mediaUrl ? (
                                            <>
                                                <div className="absolute inset-0 bg-cover bg-center opacity-40 blur-sm" style={{ backgroundImage: `url(${localDemand.mediaUrl})` }} />
                                                <div className="relative z-10 flex flex-col items-center gap-2">
                                                    <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                                        <CheckCircle className="h-6 w-6 text-emerald-500" />
                                                    </div>
                                                    <p className="text-xs font-bold text-emerald-500">Mídia Selecionada</p>
                                                    <p className="text-[10px] text-muted-foreground">Clique para alterar</p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                                    <ImageIcon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">Inserir Mídia Final</p>
                                                    <p className="text-[10px] text-zinc-600">Arraste ou clique para enviar</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-6 pt-4 border-t border-white/5 flex items-center justify-between bg-[#0A0A0B] sticky bottom-0 z-20">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Prazo: {localDemand.date}</span>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs text-muted-foreground hover:text-white"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                size="sm"
                                className={cn(
                                    "h-8 text-xs font-bold px-6 transition-all bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                                )}
                                onClick={handleSave}
                            >
                                Salvar
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Chat Sidebar */}
                {localDemand.assignedTo && (
                    <div className="w-[320px] bg-zinc-900/50 border-l border-white/5 flex flex-col shrink-0 animate-in slide-in-from-right-5 duration-300">
                        <div className="p-4 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-white/70">Observações</h4>
                                <Badge variant="secondary" className="bg-white/5 text-[9px] h-5">Chat</Badge>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-white/50 hover:text-white"
                                onClick={() => onOpenChange(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto space-y-4">
                            {!localDemand.comments || localDemand.comments.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-2">
                                    <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <p className="text-xs">Nenhuma observação ainda.</p>
                                </div>
                            ) : (
                                localDemand.comments.map(msg => (
                                    <div key={msg.id} className={cn("flex flex-col gap-1 max-w-[90%]", msg.user === "Eu" || msg.type === "internal" ? "ml-auto items-end" : "mr-auto items-start")}>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-white/50">{msg.user}</span>
                                            <span className="text-[9px] text-white/30">{msg.time}</span>
                                        </div>
                                        <div className={cn(
                                            "p-3 rounded-2xl text-xs leading-relaxed",
                                            msg.user === "Eu" || msg.type === "internal"
                                                ? "bg-primary text-white rounded-tr-none"
                                                : "bg-[#1A1A1C] text-zinc-300 rounded-tl-none border border-white/5"
                                        )}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-3 border-t border-white/5 bg-zinc-900/80 space-y-3">
                            <Button
                                size="sm"
                                variant="secondary"
                                className="w-full h-8 text-[10px] uppercase font-bold tracking-wider bg-white/5 hover:bg-white/10 gap-2 border border-white/5 transition-all"
                                onClick={() => {
                                    const url = `${window.location.origin}/share/${localDemand.id}`
                                    navigator.clipboard.writeText(url)
                                    alert("Link copiado: " + url)
                                }}
                            >
                                <Link className="w-3 h-3" />
                                GERAR LINK EXTERNO
                            </Button>

                            <div className="relative">
                                <Input
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Escreva uma observação..."
                                    className="bg-[#0A0A0B] border-white/10 text-xs pr-10 focus-visible:ring-primary/20 h-10 rounded-xl"
                                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                                />
                                <Button
                                    size="icon"
                                    className="absolute right-1 top-1 h-8 w-8 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all shadow-lg shadow-orange-500/20"
                                    onClick={handleSendMessage}
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
