"use client"

import * as React from "react"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Sparkles, Image as ImageIcon, Send, Save, Smartphone, Hash, AlignLeft, Type, Loader2, Check } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function PostEditorPage() {
    const [generating, setGenerating] = React.useState(false)
    const [saving, setSaving] = React.useState(false)
    const [saved, setSaved] = React.useState(false)
    const [idea, setIdea] = React.useState("")
    const [caption, setCaption] = React.useState("")
    const [mediaFile, setMediaFile] = React.useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handleGenerate = () => {
        if (!idea) return
        setGenerating(true)
        // Simulate AI generation
        setTimeout(() => {
            setCaption(`Aqui está uma legenda incrível baseada na sua ideia: "${idea}". 🚀\n\n#socialmedia #marketing #conteudo`)
            setGenerating(false)
        }, 1500)
    }

    const handleSave = () => {
        setSaving(true)
        setTimeout(() => {
            setSaving(false)
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        }, 1000)
    }

    const handleMediaClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setMediaFile(file)
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
        }
    }

    // Clean up URL on unmount
    React.useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl)
        }
    }, [previewUrl])

    return (
        <div className="flex h-screen w-full bg-[#0a0a0a] text-foreground overflow-hidden font-sans">

            <SidebarNav />
            <main className="flex-1 overflow-y-auto bg-transparent p-6 flex flex-col relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 sticky top-0 z-50 p-2 -mx-2 bg-background/0 backdrop-blur-sm rounded-xl">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-white" asChild>
                            <Link href="/clients/1">
                                <ArrowLeft className="h-5 w-5" />
                                <span className="font-medium">Voltar</span>
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                                Novo Post
                                <Badge variant="outline" className="font-normal text-[10px] px-2 py-0.5 border-primary/20 bg-primary/5 text-primary uppercase tracking-widest">Rascunho</Badge>
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            className={cn(
                                "gap-2 border-white/10 hover:bg-white/5 hover:text-primary transition-all",
                                saved && "border-green-500/50 text-green-500 hover:text-green-500 bg-green-500/5"
                            )}
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                            {saving ? "Salvando..." : saved ? "Salvo" : "Salvar"}
                        </Button>
                        <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
                            <Send className="h-4 w-4" />
                            Enviar
                        </Button>
                    </div>
                </div>

                {/* Editor Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full pb-10 max-w-7xl mx-auto w-full">
                    {/* Left: Inputs */}
                    <div className="flex flex-col gap-6">
                        <div className="space-y-4 p-6 rounded-2xl border border-white/5 bg-background/40 backdrop-blur-md shadow-sm">
                            <div className="flex items-center gap-2 text-primary/80 mb-2">
                                <Type className="h-4 w-4" />
                                <h3 className="font-semibold text-sm uppercase tracking-wider">Informações Básicas</h3>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-muted-foreground ml-1">Título Interno</Label>
                                <Input
                                    placeholder="Ex: Reels Lançamento Nike Air"
                                    className="bg-black/20 border-white/10 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-muted-foreground ml-1">Mídia</Label>
                                <input
                                    type="file"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*,video/*"
                                />
                                <Card
                                    className={cn(
                                        "border-dashed border-2 border-white/10 bg-black/20 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group shadow-none",
                                        mediaFile && "border-primary/50 bg-primary/5"
                                    )}
                                    onClick={handleMediaClick}
                                >
                                    <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center min-h-[180px] gap-3 text-muted-foreground group-hover:text-primary transition-colors">
                                        <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden relative">
                                            {previewUrl ? (
                                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon className="h-8 w-8 opacity-50 group-hover:opacity-100 transition-opacity" />
                                            )}
                                        </div>
                                        <div className="text-center space-y-1">
                                            <p className="text-sm font-medium">{mediaFile ? mediaFile.name : "Arraste sua mídia aqui"}</p>
                                            <p className="text-xs opacity-60">{mediaFile ? "Clique para alterar" : "PNG, JPG ou MP4"}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        <div className="space-y-4 p-6 rounded-2xl border border-white/5 bg-background/40 backdrop-blur-md shadow-sm flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-primary/80">
                                    <AlignLeft className="h-4 w-4" />
                                    <h3 className="font-semibold text-sm uppercase tracking-wider">Conteúdo</h3>
                                </div>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="h-7 text-xs gap-1.5 bg-gradient-to-r from-orange-600 to-amber-600 text-white border-0 hover:from-orange-500 hover:to-amber-500 shadow-md shadow-amber-500/20 transition-all hover:scale-105"
                                    onClick={handleGenerate}
                                    disabled={generating}
                                >
                                    <Sparkles className="h-3 w-3" />
                                    {generating ? "Criando mágica..." : "Gerar com IA"}
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-muted-foreground ml-1">Ideia / Briefing</Label>
                                <Textarea
                                    placeholder="Descreva sobre o que é o post para a IA te ajudar..."
                                    className="resize-none h-24 bg-black/20 border-white/10 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all"
                                    value={idea}
                                    onChange={(e) => setIdea(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2 flex-1 flex flex-col">
                                <Label className="text-xs font-medium text-muted-foreground ml-1">Legenda</Label>
                                <Textarea
                                    placeholder="Escreva a legenda aqui..."
                                    className="resize-none flex-1 min-h-[200px] bg-black/20 border-white/10 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all font-medium leading-relaxed"
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right: Preview */}
                    <div className="flex items-start justify-center pt-8 h-full">
                        <div className="relative w-[340px] h-[680px] bg-black rounded-[45px] shadow-[0_0_0_8px_#1a1a1a,0_0_0_10px_#333,0_20px_50px_-10px_rgba(0,0,0,0.5)] overflow-hidden border-4 border-zinc-800 ring-1 ring-white/10">
                            {/* Dynamic Island */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-b-[18px] z-50 flex items-center justify-center">
                                <div className="w-12 h-12 bg-black rounded-full absolute -top-6 -left-4 blur-md"></div>
                                <div className="w-12 h-12 bg-black rounded-full absolute -top-6 -right-4 blur-md"></div>
                            </div>

                            <Tabs defaultValue="instagram" className="w-full h-full flex flex-col">
                                <div className="absolute top-12 left-0 right-0 z-40 px-6 flex justify-center">
                                    <TabsList className="bg-black/50 backdrop-blur-md border border-white/10 h-8 p-0.5 rounded-full">
                                        <TabsTrigger value="instagram" className="rounded-full text-[10px] h-7 px-4 data-[state=active]:bg-white data-[state=active]:text-black">Instagram</TabsTrigger>
                                        <TabsTrigger value="tiktok" className="rounded-full text-[10px] h-7 px-4 data-[state=active]:bg-white data-[state=active]:text-black">TikTok</TabsTrigger>
                                    </TabsList>
                                </div>

                                <TabsContent value="instagram" className="flex-1 h-full w-full data-[state=inactive]:hidden mt-0">
                                    <div className="h-full bg-black flex flex-col pt-10 text-white font-sans">
                                        {/* Insta Header */}
                                        <div className="mt-8 px-4 flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-orange-500 p-[2px]">
                                                    <div className="h-full w-full rounded-full bg-black border-2 border-black" />
                                                </div>
                                                <span className="text-sm font-semibold">nike</span>
                                            </div>
                                            <div className="h-4 w-4 bg-transparent border-t-2 border-r-2 border-white rotate-45 transform skew-x-12 opacity-0"></div>
                                        </div>

                                        {/* Image Placeholder */}
                                        <div className="aspect-[4/5] w-full bg-zinc-900 flex items-center justify-center relative overflow-hidden group">
                                            {previewUrl ? (
                                                <img src={previewUrl} alt="Post Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon className="h-12 w-12 text-zinc-700" />
                                            )}
                                            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>

                                        {/* Actions */}
                                        <div className="px-4 py-3 flex justify-between items-center">
                                            <div className="flex gap-4">
                                                <div className="w-5 h-5 bg-transparent border-2 border-white rounded-full opacity-0"></div> {/* Like Mock */}
                                                <div className="w-5 h-5 bg-transparent border-2 border-white rounded-full opacity-0"></div> {/* Comment Mock */}
                                            </div>
                                        </div>

                                        {/* Caption */}
                                        <div className="px-4 text-sm">
                                            <div className="font-semibold mb-1">2.453 curtidas</div>
                                            <p className="opacity-90 leading-tight">
                                                <span className="font-semibold mr-2">nike</span>
                                                {caption || <span className="text-zinc-500 italic">Sua legenda aparecerá aqui...</span>}
                                            </p>
                                            <div className="text-[10px] text-zinc-500 mt-2 uppercase">Há 2 horas</div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="tiktok" className="flex-1 h-full w-full data-[state=inactive]:hidden mt-0">
                                    <div className="h-full bg-zinc-900 flex items-end relative overflow-hidden">
                                        {/* TikTok UI Overlay */}
                                        {previewUrl && (
                                            <div className="absolute inset-0">
                                                <img src={previewUrl} alt="TikTok Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}

                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-700 -z-10">
                                            {/* Fallback if no image */}
                                            {!previewUrl && <ImageIcon className="h-16 w-16 opacity-20" />}
                                        </div>

                                        <div className="w-full p-4 pb-12 z-10 text-white bg-gradient-to-t from-black/80 via-black/20 to-transparent pt-32">
                                            <div className="mb-4">
                                                <h4 className="font-bold text-sm shadow-black drop-shadow-md">@nike</h4>
                                                <p className="text-xs opacity-90 leading-tight drop-shadow-md mt-1">
                                                    {caption || "Legenda do TikTok..."}
                                                </p>
                                                <div className="flex items-center gap-2 mt-3 opacity-80">
                                                    <div className="w-3 h-3 rounded-full bg-white/20 animate-spin-slow" />
                                                    <span className="text-[10px] font-medium">Som Original - Nike</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Side Actions */}
                                        <div className="absolute right-2 bottom-24 flex flex-col gap-6 items-center z-20">
                                            <div className="w-10 h-10 bg-zinc-800 rounded-full border border-white flex items-center justify-center">
                                                <div className="w-9 h-9 bg-zinc-700 rounded-full" />
                                            </div>
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                                                    <div className="w-4 h-4 bg-white rounded-sm opacity-50" />
                                                </div>
                                                <span className="text-[10px] font-bold">85K</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                                                    <div className="w-4 h-4 bg-white rounded-sm opacity-50" />
                                                </div>
                                                <span className="text-[10px] font-bold">1024</span>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
