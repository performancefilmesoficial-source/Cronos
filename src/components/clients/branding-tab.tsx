"use client"

import * as React from "react"
import { BrandingFile, Client } from "@/types/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Plus,
    Upload,
    FileText,
    ImageIcon,
    Play,
    MoreVertical,
    Download,
    Trash2,
    Grid,
    List as ListIcon,
    Key,
    Eye,
    EyeOff,
    Lock,
    Search,
    Folder,
    Palette as PaletteIcon,
    Instagram,
    Youtube,
    Music2,
    Globe,
    Facebook,
    Chrome
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface BrandingTabProps {
    client: Client
    onUpdate: (client: Client) => void
}

export function BrandingTab({ client, onUpdate }: BrandingTabProps) {
    const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
    const [showCredentialForm, setShowCredentialForm] = React.useState(false)
    const [showColorPicker, setShowColorPicker] = React.useState(false)
    const [newColor, setNewColor] = React.useState("#ffffff")
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const downloadFile = (url: string, fileName: string) => {
        try {
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', fileName)
            link.style.display = 'none'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (error) {
            console.error("Download error:", error)
            window.open(url, '_blank')
        }
    }

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        // In a real app we'd upload to S3/Cloudinary. Here we use base64 for demo
        const newFiles: BrandingFile[] = [...(client.brandingFiles || [])]

        Array.from(files).forEach(file => {
            const reader = new FileReader()
            reader.onloadend = () => {
                newFiles.push({
                    id: Math.random().toString(36).substr(2, 9),
                    name: file.name,
                    url: reader.result as string,
                    type: file.type.startsWith('image/') ? 'image' :
                        file.type.startsWith('video/') ? 'video' :
                            file.type === 'application/pdf' ? 'pdf' : 'doc',
                    thumbnail: file.type.startsWith('image/') ? reader.result as string : undefined
                })
                onUpdate({ ...client, brandingFiles: newFiles })
            }
            reader.readAsDataURL(file)
        })
    }

    const removeFile = (id: string) => {
        const updatedFiles = (client.brandingFiles || []).filter(f => f.id !== id)
        onUpdate({ ...client, brandingFiles: updatedFiles })
    }

    const addColorToPalette = () => {
        if (!newColor) return
        const palette = [...(client.palette || []), newColor]
        onUpdate({ ...client, palette })
        setShowColorPicker(false)
        toast.success("Cor adicionada à paleta")
    }

    const removeColor = (color: string) => {
        const palette = (client.palette || []).filter(c => c !== color)
        onUpdate({ ...client, palette })
    }

    const [platform, setPlatform] = React.useState("")
    const [login, setLogin] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [showPassword, setShowPassword] = React.useState(false)
    const [showPass, setShowPass] = React.useState<Record<string, boolean>>({})

    const AVAILABLE_PLATFORMS = [
        { id: "Instagram", name: "Instagram", icon: Instagram },
        { id: "TikTok", name: "TikTok", icon: Music2 },
        { id: "YouTube", name: "YouTube", icon: Youtube },
        { id: "Facebook", name: "Facebook", icon: Facebook },
        { id: "Site", name: "Site", icon: Globe },
        { id: "Meta", name: "Meta", icon: Chrome },
        { id: "Outros", name: "Outros", icon: Key },
    ]

    const handleAddCredential = () => {
        if (!platform || !login || !password) return
        const currentCreds = client.credentials || []
        const newCredential = { platform, login, password }
        onUpdate({
            ...client,
            credentials: [...currentCreds, newCredential]
        })
        setPlatform("")
        setLogin("")
        setPassword("")
        setShowCredentialForm(false)
        setShowPassword(false)
    }

    const togglePass = (id: string) => {
        setShowPass(prev => ({ ...prev, [id]: !prev[id] }))
    }

    const removeCredential = (index: number) => {
        if (!confirm("Tem certeza que deseja excluir este acesso?")) return
        const credentials = (client.credentials || []).filter((_, i) => i !== index)
        onUpdate({ ...client, credentials })
        toast.success("Acesso removido")
    }

    const getPlatformIcon = (platform: string) => {
        const p = platform.toLowerCase()
        if (p.includes('instagram')) return <Instagram className="h-4 w-4" />
        if (p.includes('tiktok')) return <Music2 className="h-4 w-4" />
        if (p.includes('youtube')) return <Youtube className="h-4 w-4" />
        if (p.includes('facebook')) return <Facebook className="h-4 w-4" />
        if (p.includes('site') || p.includes('web')) return <Globe className="h-4 w-4" />
        if (p.includes('meta')) return <Chrome className="h-4 w-4" />
        return <Key className="h-4 w-4" />
    }

    return (
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
            {/* Header / Toolbar */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 max-w-xl">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                        <Input
                            placeholder="Buscar arquivos..."
                            className="pl-9 h-9 bg-[#0A0A0A] border-white/5 text-xs focus:ring-primary/20"
                        />
                    </div>
                    <div className="flex bg-[#0A0A0A] rounded-md border border-white/5 p-0.5 shrink-0">
                        <Button
                            size="icon-xs"
                            variant="ghost"
                            className={cn("h-7 w-7 rounded-sm", viewMode === "grid" ? "bg-white/10 text-white" : "text-zinc-500")}
                            onClick={() => setViewMode("grid")}
                        >
                            <Grid className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            size="icon-xs"
                            variant="ghost"
                            className={cn("h-7 w-7 rounded-sm", viewMode === "list" ? "bg-white/10 text-white" : "text-zinc-500")}
                            onClick={() => setViewMode("list")}
                        >
                            <ListIcon className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        multiple
                        onChange={handleUpload}
                    />
                    <Button
                        size="sm"
                        className="h-9 bg-primary hover:bg-primary/90 text-white font-bold"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="h-3.5 w-3.5 mr-2" />
                        Fazer Upload
                    </Button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6 overflow-hidden">
                {/* Files Grid */}
                <div className="bg-[#0A0A0A] rounded-xl border border-white/5 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Folder className="h-4 w-4 text-primary" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Arquivos do Cliente</h3>
                        </div>
                        <Badge variant="outline" className="text-[10px] text-zinc-500 border-white/10">
                            {(client.brandingFiles || []).length} itens
                        </Badge>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 content-start">
                        {(client.brandingFiles || []).length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-3">
                                <div className="p-4 rounded-full bg-white/5">
                                    <Upload className="h-8 w-8 opacity-20" />
                                </div>
                                <p className="text-sm font-medium">Nenhum arquivo enviado.</p>
                                <Button variant="link" className="text-primary text-xs" onClick={() => fileInputRef.current?.click()}>
                                    Clique para começar
                                </Button>
                            </div>
                        ) : (
                            <div className={cn(
                                "grid gap-4",
                                viewMode === "grid" ? "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
                            )}>
                                {(client.brandingFiles || []).map(file => (
                                    <Card
                                        key={file.id}
                                        className="group bg-white/[0.02] border-white/5 overflow-hidden hover:bg-white/[0.04] hover:border-white/10 transition-all cursor-pointer"
                                    >
                                        <div className="aspect-[4/3] relative flex items-center justify-center bg-black/40">
                                            {file.type === 'image' ? (
                                                <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                                            ) : file.type === 'video' ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                                        <Play className="h-5 w-5 fill-current" />
                                                    </div>
                                                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Vídeo</span>
                                                </div>
                                            ) : (
                                                <FileText className="h-10 w-10 text-zinc-600" />
                                            )}

                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <Button
                                                    size="icon"
                                                    className="h-10 w-10 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-md border border-white/10"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        downloadFile(file.url, file.name);
                                                    }}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    className="h-10 w-10 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl backdrop-blur-md border border-red-500/20"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (confirm("Deseja excluir este arquivo?")) removeFile(file.id);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="p-3 flex items-center justify-between gap-2 bg-white/[0.02]">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-bold text-white truncate">{file.name}</p>
                                                <p className="text-[9px] text-zinc-500 capitalize">{file.type}</p>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="icon-xs" variant="ghost" className="h-6 w-6 text-zinc-600 hover:text-white">
                                                        <MoreVertical className="h-3.5 w-3.5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-[#121214] border-white/10 text-white">
                                                    <DropdownMenuItem className="text-xs" onClick={() => downloadFile(file.url, file.name)}>Download</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-xs">Renomear</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-xs text-red-400" onClick={() => removeFile(file.id)}>Excluir</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar: Palette & Specs */}
                <div className="space-y-6 overflow-y-auto">
                    {/* Color Palette */}
                    <div className="bg-[#0A0A0A] rounded-xl border border-white/5 p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-zinc-400">
                                <PaletteIcon className="h-3.5 w-3.5" />
                                <h3 className="text-[10px] font-bold uppercase tracking-wider">Paleta de Cores</h3>
                            </div>
                            <Button
                                size="icon-xs"
                                variant="ghost"
                                className={cn("h-6 w-6 transition-all", showColorPicker ? "text-primary bg-primary/10 rotate-45" : "text-white hover:bg-white/5")}
                                onClick={() => setShowColorPicker(!showColorPicker)}
                            >
                                <Plus className="h-3.5 w-3.5" />
                            </Button>
                        </div>

                        {showColorPicker && (
                            <div className="space-y-3 bg-white/[0.03] border border-white/5 p-3 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center gap-3">
                                    <div className="relative h-10 w-10 rounded-lg border border-white/10 overflow-hidden shrink-0" style={{ backgroundColor: newColor }}>
                                        <input
                                            type="color"
                                            className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer p-0 border-0 opacity-0"
                                            value={newColor}
                                            onChange={(e) => setNewColor(e.target.value)}
                                        />
                                    </div>
                                    <Input
                                        value={newColor}
                                        onChange={(e) => setNewColor(e.target.value)}
                                        placeholder="#000000"
                                        className="h-9 bg-black/40 border-white/5 text-xs font-mono uppercase"
                                    />
                                </div>
                                <Button
                                    onClick={addColorToPalette}
                                    className="w-full h-8 bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-[9px] rounded-lg"
                                >
                                    Adicionar Cor
                                </Button>
                            </div>
                        )}

                        <div className="grid grid-cols-4 gap-2">
                            {(client.palette || []).map((color, i) => (
                                <div key={i} className="group relative">
                                    <div
                                        className="aspect-square rounded-lg border border-white/10 cursor-pointer transition-transform hover:scale-110"
                                        style={{ backgroundColor: color }}
                                        title={color}
                                    />
                                    <button
                                        className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => removeColor(color)}
                                    >
                                        <Plus className="h-2 w-2 rotate-45" />
                                    </button>
                                </div>
                            ))}
                            {(!client.palette || client.palette.length < 8) && (
                                <button
                                    className="aspect-square rounded-lg border-2 border-dashed border-white/5 flex items-center justify-center text-zinc-700 hover:text-zinc-500 hover:border-white/10 transition-colors"
                                    onClick={addColorToPalette}
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Quick Info & Credentials */}
                    <div className="bg-[#0A0A0A] rounded-2xl border border-white/5 p-5 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                    <Key className="h-3.5 w-3.5 text-blue-500" />
                                </div>
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Acessos Sociais</h3>
                            </div>
                            <Button
                                size="icon"
                                variant="ghost"
                                className={cn(
                                    "h-7 w-7 transition-all",
                                    showCredentialForm ? "text-primary bg-primary/10 rotate-45" : "text-zinc-500 hover:text-white"
                                )}
                                onClick={() => setShowCredentialForm(!showCredentialForm)}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        {showCredentialForm && (
                            <div className="space-y-4 bg-white/[0.03] border border-white/5 p-4 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="space-y-2">
                                    <Label className="text-[9px] uppercase tracking-widest text-zinc-500 font-black">Plataforma</Label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {AVAILABLE_PLATFORMS.map((p) => {
                                            const Icon = p.icon
                                            return (
                                                <button
                                                    key={p.id}
                                                    onClick={() => setPlatform(p.id)}
                                                    className={cn(
                                                        "flex items-center justify-center p-2 rounded-lg border transition-all",
                                                        platform === p.id
                                                            ? "bg-primary/20 border-primary text-primary"
                                                            : "bg-black/20 border-white/5 text-zinc-500 hover:bg-black/40"
                                                    )}
                                                    title={p.name}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-[9px] uppercase tracking-widest text-zinc-500 font-black">Login / E-mail</Label>
                                        <Input
                                            value={login}
                                            onChange={(e) => setLogin(e.target.value)}
                                            placeholder="Ex: @usuario"
                                            className="h-9 bg-black/40 border-white/5 text-xs rounded-lg"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[9px] uppercase tracking-widest text-zinc-500 font-black">Senha</Label>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="h-9 bg-black/40 border-white/5 text-xs rounded-lg pr-10"
                                            />
                                            <button
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleAddCredential}
                                    className="w-full h-9 bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-[10px] rounded-lg"
                                    disabled={!platform || !login || !password}
                                >
                                    Salvar Acesso
                                </Button>
                            </div>
                        )}

                        <div className="space-y-3">
                            {(client.credentials || []).length === 0 && !showCredentialForm && (
                                <div className="text-center py-6 bg-white/[0.01] border border-dashed border-white/5 rounded-xl">
                                    <p className="text-[10px] text-zinc-600 font-medium">Nenhum acesso cadastrado</p>
                                </div>
                            )}

                            {(client.credentials || []).map((cred, i) => (
                                <div key={i} className="group/cred bg-white/[0.02] border border-white/5 rounded-xl p-3 space-y-2 hover:bg-white/[0.04] transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded-lg bg-black/40 flex items-center justify-center text-primary border border-white/5">
                                                {getPlatformIcon(cred.platform)}
                                            </div>
                                            <span className="text-[10px] font-bold text-zinc-200 uppercase tracking-widest">{cred.platform}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-zinc-700 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover/cred:opacity-100 transition-all"
                                            onClick={() => removeCredential(i)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-zinc-400 font-medium truncate">{cred.login}</p>
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-[11px] text-zinc-600 font-mono tracking-widest truncate">
                                                {showPass[i.toString()] ? (cred.password || '••••••••') : '••••••••'}
                                            </p>
                                            <button
                                                onClick={() => togglePass(i.toString())}
                                                className="text-zinc-600 hover:text-white transition-colors"
                                            >
                                                {showPass[i.toString()] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
