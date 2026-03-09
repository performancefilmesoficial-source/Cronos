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
import { Image as ImageIcon, Clock, CheckCircle, AlertCircle, Play, FileText, Share2, UserMinus, UserPlus, Link, Send, X, Calendar, Globe, Rocket, Instagram, Twitter, Facebook, Youtube, Monitor, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DataService, User, Demand, DemandStatus } from "@/lib/data"
import { MediaDB } from "@/lib/media-db"

// Removed local definitions to avoid mismatch

interface DemandDetailPopupProps {
    demand: Demand
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onUpdate: (updated: Demand) => void
    showScheduler?: boolean
    initialTab?: "details" | "scheduler"
}

export function DemandDetailPopup({ isOpen, onOpenChange, demand: initialDemand, onUpdate, showScheduler = true, initialTab = "details" }: DemandDetailPopupProps) {
    const [localDemand, setLocalDemand] = React.useState(initialDemand)
    const [users, setUsers] = React.useState<User[]>([])
    const [resolvedMediaUrl, setResolvedMediaUrl] = React.useState<string | null>(null)
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
            ...initialDemand,
            status: initialDemand.assignedTo ? initialDemand.status : null
        })
    }, [initialDemand])

    // Resolve Media URL (IndexedDB support)
    React.useEffect(() => {
        const resolve = async () => {
            const url = localDemand.mediaUrl
            if (!url) {
                setResolvedMediaUrl(null)
                return
            }

            if (url.startsWith("idb:")) {
                const mediaId = url.replace("idb:", "")
                try {
                    const data = await MediaDB.getMedia(mediaId)
                    setResolvedMediaUrl(data)
                } catch (e) {
                    console.error("Error resolving IDB media", e)
                    setResolvedMediaUrl(null)
                }
            } else {
                setResolvedMediaUrl(url)
            }
        }
        resolve()
    }, [localDemand.mediaUrl])

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

    const [publishTab, setPublishTab] = React.useState<"details" | "scheduler">(initialTab)

    // Reset tab when closing/reopening with new demand
    React.useEffect(() => {
        if (isOpen) {
            setPublishTab(initialTab)
        }
    }, [isOpen, initialTab])

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

        onUpdate(updatedDemand)
    }

    const [scheduledDate, setScheduledDate] = React.useState(localDemand.date)
    const [scheduledTime, setScheduledTime] = React.useState("10:00")
    const [selectedPlatforms, setSelectedPlatforms] = React.useState<string[]>([])
    const [isPublishing, setIsPublishing] = React.useState(false)

    const togglePlatform = (p: string) => {
        setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
    }

    const handleDirectPost = async () => {
        if (selectedPlatforms.length === 0) {
            toast.error("Selecione ao menos uma rede social")
            return
        }
        setIsPublishing(true)
        const toastId = toast.loading("Enviando para o middleware de postagem...", { id: "publishing" })

        try {
            const response = await fetch("/api/social/publish", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    platforms: selectedPlatforms,
                    content: localDemand.briefing || localDemand.title,
                    mediaUrl: localDemand.mediaUrl,
                    scheduledDate: `${scheduledDate} ${scheduledTime}`,
                    clientId: localDemand.client
                })
            })

            const data = await response.json()

            if (data.success) {
                toast.success("Conteúdo programado via middleware!", {
                    id: toastId,
                    description: `Fila de postagem: ${selectedPlatforms.join(", ")}`
                })
                const updated = { ...localDemand, status: "Programado" as const }
                setLocalDemand(updated)
                onUpdate(updated)
            } else {
                throw new Error(data.error)
            }
        } catch (error) {
            toast.error("Erro ao conectar com o middleware", { id: toastId })
            console.error(error)
        } finally {
            setIsPublishing(false)
        }
    }

    const handleOpenPlatform = (platform: string) => {
        const urls: Record<string, string> = {
            "Instagram": "https://business.facebook.com/creatorstudio",
            "TikTok": "https://www.tiktok.com/p/upload",
            "YouTube": "https://studio.youtube.com",
            "Facebook": "https://business.facebook.com/latest/home"
        }
        window.open(urls[platform] || "https://google.com", "_blank")
        toast.info(`Direcionando para ${platform}...`, {
            description: "Use os acessos salvos no cadastro do cliente."
        })
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
                            {!showScheduler && (["Em andamento", "Aguardando aprovação", "Aguardando ajuste", "Aprovado"] as DemandStatus[]).map((s) => (
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

                        {showScheduler && (
                            <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn("h-7 px-3 text-[10px] font-bold uppercase", publishTab === "details" ? "bg-white/10 text-white" : "text-zinc-500")}
                                    onClick={() => setPublishTab("details")}
                                >
                                    <FileText className="w-3 h-3 mr-1.5" />
                                    Detalhes
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn("h-7 px-3 text-[10px] font-bold uppercase", publishTab === "scheduler" ? "bg-white/10 text-white" : "text-zinc-500")}
                                    onClick={() => setPublishTab("scheduler")}
                                >
                                    <Calendar className="w-3 h-3 mr-1.5" />
                                    Agendar
                                </Button>
                            </div>
                        )}


                    </div>

                    <div className="p-6 space-y-6 relative z-10 flex-1 overflow-y-auto max-h-[70vh]">
                        {publishTab === "details" ? (
                            <div className="space-y-4 animate-in fade-in duration-300">
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

                                {/* Media Section */}
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold font-sans">Mídia do Conteúdo</Label>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={handleFileChange}
                                        accept="image/*,video/*,application/pdf"
                                    />
                                    <div
                                        onClick={handleMediaClick}
                                        className="aspect-video bg-zinc-900 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-3 group hover:border-primary/50 transition-colors cursor-pointer overflow-hidden relative"
                                    >
                                        {resolvedMediaUrl ? (
                                            <>
                                                {resolvedMediaUrl.startsWith("data:video") || resolvedMediaUrl.endsWith(".mp4") ? (
                                                    <video src={resolvedMediaUrl} className="absolute inset-0 w-full h-full object-cover opacity-60" autoPlay muted loop />
                                                ) : (
                                                    <div className="absolute inset-0 bg-cover bg-center opacity-40 blur-sm" style={{ backgroundImage: `url(${resolvedMediaUrl})` }} />
                                                )}

                                                {resolvedMediaUrl.startsWith("data:image") || !resolvedMediaUrl.includes("video") ? (
                                                    <img src={resolvedMediaUrl} alt="" className="relative z-10 max-h-full object-contain shadow-2xl rounded-lg" />
                                                ) : (
                                                    <div className="relative z-10 flex flex-col items-center gap-2">
                                                        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                                                            <Play className="h-6 w-6 text-primary" />
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                                                    <p className="text-xs font-bold text-white bg-black/60 px-3 py-1.5 rounded-full border border-white/10">Alterar Mídia</p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                                    <ImageIcon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">Inserir Mídia</p>
                                                    <p className="text-[10px] text-zinc-600">Arraste ou clique para enviar</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <Rocket className="h-6 w-6 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Publicação Profissional</h4>
                                        <p className="text-xs text-zinc-400">Configure o agendamento e a postagem direta via API.</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">1. Escolha as redes</Label>
                                    <div className="grid grid-cols-4 gap-3">
                                        {[
                                            { id: "Instagram", icon: Instagram, color: "text-pink-500" },
                                            { id: "TikTok", icon: Monitor, color: "text-cyan-400" },
                                            { id: "YouTube", icon: Youtube, color: "text-red-500" },
                                            { id: "Facebook", icon: Facebook, color: "text-blue-500" }
                                        ].map(plat => (
                                            <button
                                                key={plat.id}
                                                onClick={() => togglePlatform(plat.id)}
                                                className={cn(
                                                    "flex flex-col items-center justify-center p-4 rounded-2xl border transition-all",
                                                    selectedPlatforms.includes(plat.id)
                                                        ? "bg-white/10 border-primary/50 shadow-lg shadow-primary/10"
                                                        : "bg-white/5 border-white/5 hover:border-white/10"
                                                )}
                                            >
                                                <plat.icon className={cn("h-6 w-6 mb-2", plat.color)} />
                                                <span className="text-[10px] font-bold text-white">{plat.id}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">2. Data Programada</Label>
                                        <Input
                                            type="date"
                                            className="bg-white/5 border-white/5 h-11 rounded-xl text-sm"
                                            value={scheduledDate}
                                            onChange={(e) => setScheduledDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">3. Horário</Label>
                                        <Input
                                            type="time"
                                            className="bg-white/5 border-white/5 h-11 rounded-xl text-sm"
                                            value={scheduledTime}
                                            onChange={(e) => setScheduledTime(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="p-1.5 bg-black/40 rounded-2xl border border-white/5 space-y-1">
                                    <div className="p-3">
                                        <h5 className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-2 mb-3">
                                            <Globe className="h-3 w-3" />
                                            Ações de Postagem
                                        </h5>
                                        <div className="grid grid-cols-1 gap-2">
                                            <Button
                                                variant="outline"
                                                className="justify-between h-12 bg-white/5 border-white/5 hover:bg-white/10 group rounded-xl"
                                                onClick={handleDirectPost}
                                                disabled={isPublishing}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Rocket className="h-4 w-4 text-emerald-400" />
                                                    <span className="text-xs font-bold text-white">POSTAR DIRETAMENTE AGORA (API)</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge className="bg-emerald-500/10 text-emerald-500 text-[9px] font-black border-none">SEGURO</Badge>
                                                    <Lock className="h-3 w-3 text-zinc-600" />
                                                </div>
                                            </Button>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" className="justify-between h-12 bg-white/5 border-white/5 hover:bg-white/10 group rounded-xl">
                                                        <div className="flex items-center gap-3">
                                                            <Monitor className="h-4 w-4 text-primary" />
                                                            <span className="text-xs font-bold text-white uppercase">Abrir Programador da Rede</span>
                                                        </div>
                                                        <Share2 className="h-4 w-4 text-zinc-600" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-[#121214] border-white/10 text-white min-w-[200px]">
                                                    {["Instagram", "TikTok", "YouTube", "Facebook"].map(p => (
                                                        <DropdownMenuItem
                                                            key={p}
                                                            className="text-xs py-2.5 cursor-pointer hover:bg-primary/20"
                                                            onClick={() => handleOpenPlatform(p)}
                                                        >
                                                            Abrir {p} Business Suite
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
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
