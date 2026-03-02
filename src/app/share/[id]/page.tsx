"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Check, X, Image as ImageIcon, Send } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useParams } from "next/navigation"
import { DataService, Demand } from "@/lib/data"
import { MediaDB } from "@/lib/media-db"

export default function ClientPortalPage() {
    const params = useParams()
    const [demand, setDemand] = useState<Demand | null>(null)
    const [loading, setLoading] = useState(true)
    const [resolvedMediaUrl, setResolvedMediaUrl] = useState<string | undefined>(undefined)

    // Chat State
    const [message, setMessage] = useState("")

    useEffect(() => {
        if (params?.id) {
            loadDemand(params.id as string)
        }
    }, [params?.id])

    useEffect(() => {
        const handleDataChange = () => {
            if (params?.id) loadDemand(params.id as string)
        }
        window.addEventListener("sf-data-change", handleDataChange)
        return () => window.removeEventListener("sf-data-change", handleDataChange)
    }, [params?.id])

    // Load media content if it's an IDB reference
    useEffect(() => {
        if (demand?.mediaUrl?.startsWith("idb:")) {
            const mediaId = demand.mediaUrl.replace("idb:", "")
            MediaDB.getMedia(mediaId).then(content => {
                if (content) setResolvedMediaUrl(content)
            })
        } else {
            setResolvedMediaUrl(demand?.mediaUrl)
        }
    }, [demand?.mediaUrl])

    const loadDemand = (id: string) => {
        const found = DataService.getDemandById(id)
        if (found) {
            setDemand(found)
        } else {
            setDemand(null)
        }
        setLoading(false)
    }

    const handleApprove = () => {
        if (!demand) return
        const updated = { ...demand, status: "Aprovado" as const }
        setDemand(updated)
        DataService.updateDemand(updated)
    }

    const handleAdjust = () => {
        if (!demand) return
        if (confirm("Confirmar solicitação de ajuste?")) {
            const updated = { ...demand, status: "Aguardando ajuste" as const }
            setDemand(updated)
            DataService.updateDemand(updated)
        }
    }

    const handleSendMessage = () => {
        if (!message.trim() || !demand) return

        const newComment = {
            id: Date.now(),
            user: "Você",
            text: message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: "client" as const
        }

        const updated = {
            ...demand,
            comments: [...(demand.comments || []), newComment]
        }

        // Optimistic UI Update
        setDemand(updated)
        setMessage("")
        DataService.updateDemand(updated)
    }

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Carregando...</div>
    if (!demand) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Demanda não encontrada.</div>

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col font-sans relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-900/10 via-zinc-950 to-zinc-950 pointer-events-none" />

            <div className="flex-1 flex flex-col lg:flex-row h-screen overflow-hidden relative z-10">

                {/* Left Side: Phone Preview (Centered) */}
                <div className="flex-1 flex items-center justify-center p-8 bg-black/20 relative">
                    <div className="w-full max-w-sm relative flex flex-col items-center animate-in fade-in zoom-in duration-500">
                        {/* Phone Frame */}
                        <div className="w-[360px] h-[750px] bg-black rounded-[45px] shadow-[0_0_0_8px_#1a1a1a,0_0_0_12px_#333,0_30px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden border-4 border-zinc-800 ring-1 ring-white/10 relative flex flex-col">

                            {/* Dynamic Island Mock */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-b-[18px] z-50 flex items-center justify-center">
                                <div className="w-12 h-12 bg-black rounded-full absolute -top-6 -left-4 blur-md"></div>
                                <div className="w-12 h-12 bg-black rounded-full absolute -top-6 -right-4 blur-md"></div>
                            </div>

                            {/* Status Bar */}
                            <div className="flex justify-between px-7 pt-4 pb-2 text-[10px] text-white font-medium z-40 select-none mix-blend-difference">
                                <span>9:41</span>
                                <div className="flex gap-1">
                                    <div className="w-4 h-3 bg-white rounded-sm" />
                                </div>
                            </div>

                            {/* Header: Avatar + Client Name (Social Style) */}
                            <div className="px-5 pt-2 pb-4 flex items-center gap-3 z-40 relative">
                                <Avatar className="h-8 w-8 ring-1 ring-white/20 shadow-lg">
                                    <AvatarFallback className="bg-gradient-to-tr from-yellow-400 via-red-500 to-orange-500 text-transparent bg-clip-text font-bold text-xs">
                                        {demand.client[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="font-bold text-sm text-white tracking-tight drop-shadow-md">{demand.client}</span>
                            </div>

                            {/* Media Content - Full Screen / Immersive */}
                            <div className="absolute inset-0 z-0 bg-zinc-900 flex items-center justify-center">
                                {resolvedMediaUrl ? (
                                    <>
                                        {((resolvedMediaUrl.startsWith("data:video") || resolvedMediaUrl.match(/\.(mp4|webm|mov)$/i))) ? (
                                            <video
                                                src={resolvedMediaUrl}
                                                className="absolute inset-0 w-full h-full object-cover"
                                                autoPlay
                                                loop
                                                muted
                                                playsInline
                                            />
                                        ) : (
                                            <div
                                                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                                                style={{ backgroundImage: `url(${resolvedMediaUrl})` }}
                                            />
                                        )}
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-4 text-zinc-700">
                                        <ImageIcon className="h-20 w-20 opacity-20" />
                                        <span className="text-xs uppercase tracking-widest opacity-40 font-semibold">Sem Mídia</span>
                                    </div>
                                )}
                                {/* Status Overlay Feedback */}
                                {demand.status === "Aprovado" && (
                                    <div className="absolute inset-0 z-50 bg-emerald-500/10 backdrop-blur-sm flex items-center justify-center pointer-events-none">
                                        <div className="bg-emerald-500 text-white px-6 py-2 rounded-full font-bold shadow-2xl shadow-emerald-500/20 flex items-center gap-2 animate-in zoom-in spin-in-3 duration-300">
                                            <Check className="w-5 h-5" /> Aprovado
                                        </div>
                                    </div>
                                )}
                                {demand.status === "Aguardando ajuste" && (
                                    <div className="absolute inset-0 z-50 bg-orange-500/10 backdrop-blur-sm flex items-center justify-center pointer-events-none">
                                        <div className="bg-orange-500 text-white px-6 py-2 rounded-full font-bold shadow-2xl shadow-orange-500/20 flex items-center gap-2 animate-pulse">
                                            <X className="w-5 h-5" /> Aguardando Ajuste
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Bottom Actions */}
                            <div className="mt-auto p-6 z-50 flex gap-3 pb-8 bg-gradient-to-t from-black/80 to-transparent">
                                <Button
                                    onClick={handleAdjust}
                                    disabled={demand.status === "Aprovado" || demand.status === "Aguardando ajuste"}
                                    className="flex-1 h-12 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white font-semibold shadow-xl active:scale-95 transition-all"
                                >
                                    <X className="w-5 h-5 mr-2" /> Ajustar
                                </Button>
                                <Button
                                    onClick={handleApprove}
                                    disabled={demand.status === "Aprovado"}
                                    className="flex-1 h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold shadow-lg shadow-emerald-500/30 active:scale-95 transition-all"
                                >
                                    <Check className="w-5 h-5 mr-2" /> Aprovar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Chat Panel */}
                <div className="w-full lg:w-[400px] bg-zinc-950 border-l border-white/10 flex flex-col relative z-20 shadow-2xl">
                    <div className="p-6 border-b border-white/10 bg-white/5 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500">
                            <Send className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm tracking-wide text-white">Comentários</h3>
                            <p className="text-xs text-zinc-400">Tire dúvidas ou solicite ajustes aqui.</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {!demand.comments || demand.comments.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-4 opacity-50">
                                <div className="p-4 rounded-full bg-white/5">
                                    <Send className="w-6 h-6" />
                                </div>
                                <p className="text-xs font-medium">Nenhum comentário ainda.</p>
                            </div>
                        ) : (
                            demand.comments.map((msg) => (
                                <div key={msg.id} className={cn("flex flex-col gap-1.5 max-w-[85%]", msg.type === "client" ? "ml-auto items-end" : "mr-auto items-start")}>
                                    <div className="flex items-center gap-2 px-1">
                                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">{msg.user}</span>
                                        <span className="text-[9px] text-white/30">{msg.time}</span>
                                    </div>
                                    <div className={cn(
                                        "p-4 rounded-2xl text-xs leading-relaxed shadow-sm",
                                        msg.type === "client"
                                            ? "bg-orange-600 text-white rounded-tr-none shadow-orange-900/20"
                                            : "bg-zinc-800 text-zinc-200 rounded-tl-none border border-white/5"
                                    )}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-6 border-t border-white/10 bg-zinc-900/50">
                        <div className="relative">
                            <Input
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault()
                                        handleSendMessage()
                                    }
                                }}
                                placeholder="Digite sua mensagem..."
                                className="bg-zinc-900 border-white/10 rounded-xl pr-12 h-12 text-xs focus-visible:ring-orange-500/50 text-white placeholder:text-zinc-600"
                            />
                            <Button
                                size="icon"
                                className="absolute right-2 top-2 h-8 w-8 rounded-lg bg-orange-600 hover:bg-orange-500 text-white transition-all shadow-lg shadow-orange-600/20"
                                onClick={handleSendMessage}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
