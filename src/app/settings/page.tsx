"use client"

import { useState, useEffect, useRef } from "react"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Shield, Mail, User as UserIcon, Users as UsersIcon, Upload, Briefcase, DollarSign, PenTool, Share2, Pencil, X, Phone, Settings as SettingsIcon, Loader2 } from "lucide-react"

import { User, UserRole, DataService } from "@/lib/data"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

const ROLE_LABELS: Record<UserRole, string> = {
    ADMIN: "Administrador",
    EDITOR: "Editor",
    SOCIAL_MEDIA: "Social Media",
    DESIGNER: "Designer",
    MANAGER: "Gestão",
    FINANCIAL: "Financeiro",
    CLIENT: "Cliente"
}

const ROLE_STYLES: Record<UserRole, string> = {
    ADMIN: "bg-primary/10 text-primary hover:bg-primary/20",
    EDITOR: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
    SOCIAL_MEDIA: "bg-pink-500/10 text-pink-500 hover:bg-pink-500/20",
    DESIGNER: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20",
    MANAGER: "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20",
    FINANCIAL: "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20",
    CLIENT: "bg-zinc-500/10 text-zinc-500 hover:bg-zinc-500/20"
}

export default function SettingsPage() {
    const [users, setUsers] = useState<User[]>([])
    const [newUser, setNewUser] = useState<{ name: string, email: string, whatsapp: string, role: UserRole, avatar: string | null }>({
        name: "",
        email: "",
        whatsapp: "",
        role: "EDITOR",
        avatar: null
    })
    const [loading, setLoading] = useState(false)
    const [scale, setScale] = useState(1)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [showResetConfirm, setShowResetConfirm] = useState(false)
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showFinalResetConfirm, setShowFinalResetConfirm] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean, userId: string | null }>({ open: false, userId: null })
    const [whatsappSettings, setWhatsappSettings] = useState<any>({
        whatsapp_api_url: "",
        whatsapp_token: "",
        whatsapp_group_id: "",
        notifications_enabled: false,
        whatsapp_engine: "EVOLUTION",
        meta_phone_id: "",
        meta_token: "",
        meta_recipient_id: ""
    })
    const fileInputRef = useRef<HTMLInputElement>(null)

    const nameInputRef = useRef<HTMLInputElement>(null)
    const formRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setUsers(DataService.getUsers())
        setWhatsappSettings(DataService.getSettings())
    }, [])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setNewUser(prev => ({ ...prev, avatar: reader.result as string }))
                setScale(1) // Reset scale on new image
            }
            reader.readAsDataURL(file)
        }
    }

    const processAvatar = async (imageSrc: string, zoom: number): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image()
            img.src = imageSrc
            img.crossOrigin = "anonymous"
            img.onload = () => {
                const canvas = document.createElement('canvas')
                const size = 300 // Output size
                canvas.width = size
                canvas.height = size
                const ctx = canvas.getContext('2d')

                if (!ctx) {
                    resolve(imageSrc)
                    return
                }

                const coverScale = Math.max(canvas.width / img.width, canvas.height / img.height)
                const finalScale = coverScale * zoom
                const newWidth = img.width * finalScale
                const newHeight = img.height * finalScale
                const x = (canvas.width - newWidth) / 2
                const y = (canvas.height - newHeight) / 2

                ctx.drawImage(img, x, y, newWidth, newHeight)
                resolve(canvas.toDataURL('image/jpeg', 0.9))
            }
        })
    }

    const handleSaveUser = async () => {
        if (!newUser.name || !newUser.email) return

        setLoading(true)

        let finalAvatar = newUser.avatar
        if (newUser.avatar && scale !== 1) {
            finalAvatar = await processAvatar(newUser.avatar, scale)
        }

        setTimeout(() => {
            let updatedUsers = [...users]

            if (editingId) {
                updatedUsers = users.map(user => {
                    if (user.id === editingId) {
                        return {
                            ...user,
                            name: newUser.name,
                            email: newUser.email,
                            whatsapp: newUser.whatsapp,
                            role: newUser.role,
                            avatar: finalAvatar || user.avatar
                        }
                    }
                    return user
                })
            } else {
                const user: User = {
                    id: crypto.randomUUID(),
                    name: newUser.name,
                    email: newUser.email,
                    whatsapp: newUser.whatsapp,
                    role: newUser.role,
                    avatar: finalAvatar,
                    createdAt: new Date().toISOString()
                }
                updatedUsers.push(user)
            }

            setUsers(updatedUsers)
            DataService.saveUsers(updatedUsers)

            // Reset form
            setNewUser({ name: "", email: "", whatsapp: "", role: "EDITOR", avatar: null })
            setEditingId(null)
            setScale(1)
            if (fileInputRef.current) fileInputRef.current.value = ""
            setLoading(false)
        }, 600)
    }

    const handleEditUser = (user: User) => {
        setNewUser({
            name: user.name,
            email: user.email,
            whatsapp: user.whatsapp || "",
            role: user.role,
            avatar: user.avatar || null
        })
        setEditingId(user.id)
        setScale(1)

        // Visual feedback
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        setTimeout(() => nameInputRef.current?.focus(), 500)
    }

    const handleCancelEdit = () => {
        setNewUser({ name: "", email: "", whatsapp: "", role: "EDITOR", avatar: null })
        setEditingId(null)
        setScale(1)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const handleDeleteUser = (id: string) => {
        setDeleteConfirm({ open: true, userId: id })
    }

    const confirmDeleteUser = () => {
        if (deleteConfirm.userId) {
            const updatedUsers = users.filter(u => u.id !== deleteConfirm.userId)
            setUsers(updatedUsers)
            DataService.saveUsers(updatedUsers)
            toast.success("Usuário removido com sucesso")

            if (editingId === deleteConfirm.userId) {
                handleCancelEdit()
            }
        }
        setDeleteConfirm({ open: false, userId: null })
    }

    const handleResetSystem = () => {
        if (confirmPassword === "admin123") {
            setShowFinalResetConfirm(true)
        } else {
            toast.error("Senha de administrador incorreta")
            setConfirmPassword("")
        }
    }

    const confirmFinalReset = () => {
        localStorage.clear()
        window.location.reload()
    }

    const handleSaveSettings = () => {
        DataService.saveSettings(whatsappSettings)
        toast.success("Configurações salvas com sucesso!")
    }

    return (
        <div className="flex h-screen w-full bg-[#0a0a0a] text-foreground overflow-hidden font-sans">


            <SidebarNav />

            <main className="flex-1 overflow-y-auto bg-transparent p-8 relative z-10">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
                            <p className="text-muted-foreground">Gerencie os usuários e preferências do sistema.</p>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-12">
                        {/* User Form */}
                        <Card className="md:col-span-5 bg-[#0A0A0A]/80 backdrop-blur-xl border-white/5 h-fit" ref={formRef}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div>
                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                        <UsersIcon className="h-4 w-4 text-primary" />
                                        {editingId ? "Editar Usuário" : "Novo Usuário"}
                                    </CardTitle>
                                    <CardDescription className="text-[10px]">{editingId ? "Atualize os dados do membro." : "Adicione um novo membro ao time."}</CardDescription>
                                </div>
                                {editingId && (
                                    <Button variant="ghost" size="icon" onClick={handleCancelEdit} title="Cancelar Edição">
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-20 h-20 relative overflow-hidden rounded-full border-2 border-dashed border-white/20 group hover:border-primary/50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                        {newUser.avatar ? (
                                            <div className="w-full h-full relative overflow-hidden">
                                                <img
                                                    src={newUser.avatar}
                                                    className="w-full h-full object-cover transition-transform duration-100 ease-out origin-center"
                                                    style={{ transform: `scale(${scale})` }}
                                                    alt="Preview"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-white/5">
                                                <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </div>

                                    {newUser.avatar && (
                                        <div className="w-full max-w-[160px] space-y-2">
                                            <input
                                                type="range"
                                                min="1"
                                                max="3"
                                                step="0.1"
                                                value={scale}
                                                onChange={(e) => setScale(parseFloat(e.target.value))}
                                                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase font-bold text-zinc-500">Nome Completo</Label>
                                        <Input
                                            ref={nameInputRef}
                                            placeholder="João Silva"
                                            className="h-9 bg-white/5 border-white/10 text-sm"
                                            value={newUser.name}
                                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase font-bold text-zinc-500">Email</Label>
                                        <Input
                                            placeholder="joao@empresa.com"
                                            className="h-9 bg-white/5 border-white/10 text-sm"
                                            value={newUser.email}
                                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase font-bold text-zinc-500">WhatsApp</Label>
                                        <Input
                                            placeholder="11 99999-9999"
                                            className="h-9 bg-white/5 border-white/10 text-sm"
                                            value={newUser.whatsapp}
                                            onChange={(e) => setNewUser({ ...newUser, whatsapp: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase font-bold text-zinc-500">Função</Label>
                                        <Select
                                            value={newUser.role}
                                            onValueChange={(val) => setNewUser({ ...newUser, role: val as UserRole })}
                                        >
                                            <SelectTrigger className="h-9 bg-white/5 border-white/10 text-sm">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#1c1c1e] border-white/10">
                                                <SelectItem value="admin">Administrador</SelectItem>
                                                <SelectItem value="manager">Gestão</SelectItem>
                                                <SelectItem value="financial">Financeiro</SelectItem>
                                                <SelectItem value="social_media">Social Media</SelectItem>
                                                <SelectItem value="editor">Editor</SelectItem>
                                                <SelectItem value="designer">Designer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Button
                                    className="w-full bg-primary hover:bg-primary/90 h-9 font-bold uppercase text-[10px] tracking-widest mt-4"
                                    onClick={handleSaveUser}
                                    disabled={loading || !newUser.name || !newUser.email}
                                >
                                    {loading ? <Loader2 className="animate-spin h-4 w-4" /> : (editingId ? "Atualizar Membro" : "Cadastrar Membro")}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* User List */}
                        <Card className="md:col-span-7 bg-[#0A0A0A]/80 backdrop-blur-xl border-white/5">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-primary" />
                                    Membros da Equipe
                                </CardTitle>
                                <CardDescription className="text-[10px]">{users.length} usuários no sistema.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {users.map((user) => (
                                        <div key={user.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${editingId === user.id ? 'border-primary/50 bg-primary/5' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center">
                                                    <UserIcon className="h-4 w-4 text-zinc-600" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-xs text-white">{user.name}</p>
                                                    <p className="text-[10px] text-zinc-500">{user.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge variant="secondary" className={`${ROLE_STYLES[user.role]} border-none h-5 text-[9px] uppercase font-bold tracking-tight`}>
                                                    {ROLE_LABELS[user.role]}
                                                </Badge>
                                                <div className="flex gap-1 border-l border-white/10 pl-3">
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-white" onClick={() => handleEditUser(user)}>
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-red-500" onClick={() => handleDeleteUser(user.id)}>
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* WhatsApp Integration */}
                    <Card className="bg-[#0A0A0A]/80 backdrop-blur-xl border-white/5">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Phone className="h-4 w-4 text-[#25D366]" />
                                Integração WhatsApp (Notificações)
                            </CardTitle>
                            <CardDescription className="text-[10px]">Escolha o método de conexão e configure os alertas.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <div className="space-y-1 max-w-xs">
                                    <Label className="text-[10px] uppercase font-bold text-zinc-500">Motor de Envio</Label>
                                    <Select
                                        value={whatsappSettings.whatsapp_engine}
                                        onValueChange={(val) => setWhatsappSettings({ ...whatsappSettings, whatsapp_engine: val as "evolution" | "meta" })}
                                    >
                                        <SelectTrigger className="h-9 bg-white/5 border-white/10 text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1c1c1e] border-white/10">
                                            <SelectItem value="evolution">Evolution API / Z-API (QR Code)</SelectItem>
                                            <SelectItem value="meta">WhatsApp Cloud API (Meta Oficial)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-200/80 flex gap-3">
                                    <Shield className="h-4 w-4 text-amber-500 shrink-0" />
                                    <p>
                                        <b>DICA DE SEGURANÇA:</b> Para maior proteção, utilize variáveis de ambiente (.env.local) no servidor.
                                        Os tokens inseridos aqui são usados como fallback através de um Proxy Seguro para evitar exposição.
                                    </p>
                                </div>

                                {whatsappSettings.whatsapp_engine === "meta" ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase font-bold text-zinc-500">Phone Number ID</Label>
                                            <Input
                                                placeholder="Ex: 109283746554321"
                                                className="h-9 bg-white/5 border-white/10 text-sm"
                                                value={whatsappSettings.meta_phone_id || ""}
                                                onChange={(e) => setWhatsappSettings({ ...whatsappSettings, meta_phone_id: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase font-bold text-zinc-500">Meta Access Token</Label>
                                            <Input
                                                type="password"
                                                placeholder="Token Permanente da Meta"
                                                className="h-9 bg-white/5 border-white/10 text-sm"
                                                value={whatsappSettings.meta_token || ""}
                                                onChange={(e) => setWhatsappSettings({ ...whatsappSettings, meta_token: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase font-bold text-zinc-500">Recipient Phone (Seu WhatsApp)</Label>
                                            <Input
                                                placeholder="Ex: 5511999999999"
                                                className="h-9 bg-white/5 border-white/10 text-sm"
                                                value={whatsappSettings.meta_recipient_id || ""}
                                                onChange={(e) => setWhatsappSettings({ ...whatsappSettings, meta_recipient_id: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase font-bold text-zinc-500">API URL</Label>
                                            <Input
                                                placeholder="https://sua-api.com/message/sendText/instancia"
                                                className="h-9 bg-white/5 border-white/10 text-sm"
                                                value={whatsappSettings.whatsapp_api_url}
                                                onChange={(e) => setWhatsappSettings({ ...whatsappSettings, whatsapp_api_url: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase font-bold text-zinc-500">API Token / key</Label>
                                            <Input
                                                type="password"
                                                placeholder="Seu token secreto"
                                                className="h-9 bg-white/5 border-white/10 text-sm"
                                                value={whatsappSettings.whatsapp_token}
                                                onChange={(e) => setWhatsappSettings({ ...whatsappSettings, whatsapp_token: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase font-bold text-zinc-500">Group ID / JID</Label>
                                            <Input
                                                placeholder="1203630239483@g.us"
                                                className="h-9 bg-white/5 border-white/10 text-sm"
                                                value={whatsappSettings.whatsapp_group_id}
                                                onChange={(e) => setWhatsappSettings({ ...whatsappSettings, whatsapp_group_id: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="notifications_enabled"
                                        className="h-4 w-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/50"
                                        checked={whatsappSettings.notifications_enabled}
                                        onChange={(e) => setWhatsappSettings({ ...whatsappSettings, notifications_enabled: e.target.checked })}
                                    />
                                    <Label htmlFor="notifications_enabled" className="text-xs font-medium cursor-pointer">Habilitar notificações automáticas</Label>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    className="flex-1 bg-[#25D366] hover:bg-[#25D366]/80 text-black h-9 font-bold uppercase text-[10px] tracking-widest"
                                    onClick={handleSaveSettings}
                                >
                                    Salvar Configurações
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-9 border-white/10 text-[10px] font-bold uppercase"
                                    onClick={async () => {
                                        DataService.saveSettings(whatsappSettings)
                                        const { WhatsAppService } = await import("@/lib/whatsapp-service")
                                        await WhatsAppService.sendNotification("🚀 *Teste de Conexão*\n\nA integração com o Post Performance está funcionando perfeitamente!")
                                        toast.success("Mensagem de teste enviada!")
                                    }}
                                >
                                    Testar Conexão
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* App Settings */}

                    <Card className="bg-[#0A0A0A]/80 backdrop-blur-xl border-white/5">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <SettingsIcon className="h-4 w-4 text-primary" />
                                Geral do Sistema
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                                    <h4 className="text-xs font-bold text-zinc-300">Backup dos Dados</h4>
                                    <p className="text-[10px] text-zinc-500">Todos os dados são salvos localmente no seu navegador.</p>
                                    <Button variant="outline" size="sm" className="h-8 border-white/10 text-[10px] font-bold uppercase transition-all hover:bg-white/5" onClick={() => {
                                        const data = localStorage.getItem("sf-demands")
                                        const blob = new Blob([data || ""], { type: "application/json" })
                                        const url = URL.createObjectURL(blob)
                                        const a = document.createElement("a")
                                        a.href = url
                                        a.download = `backup-post-performance-${new Date().toISOString().split('T')[0]}.json`
                                        a.click()
                                    }}>Exportar JSON</Button>
                                </div>
                                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 space-y-4">
                                    <div className="space-y-1">
                                        <h4 className="text-xs font-bold text-red-500">Resetar Sistema</h4>
                                        <p className="text-[10px] text-red-500/60">Isso apagará permanentemente todos os dados criados.</p>
                                    </div>

                                    {showResetConfirm ? (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <Input
                                                type="password"
                                                placeholder="Senha de Admin"
                                                className="h-8 bg-red-500/10 border-red-500/20 text-xs text-red-200 placeholder:text-red-500/30"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                autoFocus
                                            />
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="flex-1 h-7 text-[10px] uppercase font-bold text-red-400 hover:bg-red-500/10"
                                                    onClick={() => {
                                                        setShowResetConfirm(false)
                                                        setConfirmPassword("")
                                                    }}
                                                >
                                                    Cancelar
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="flex-1 h-7 text-[10px] uppercase font-bold bg-red-600 hover:bg-red-700"
                                                    onClick={handleResetSystem}
                                                >
                                                    Confirmar
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full h-8 text-red-500 hover:bg-red-500/10 text-[10px] font-bold uppercase border border-red-500/10"
                                            onClick={() => setShowResetConfirm(true)}
                                        >
                                            Limpar Tudo
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="pt-4 pb-20">
                        {/* Importação do Trello removida */}
                    </div>

                    {/* Delete Confirmation Dialog */}
                    <Dialog open={deleteConfirm.open} onOpenChange={(open) => !open && setDeleteConfirm({ open: false, userId: null })}>
                        <DialogContent className="bg-[#1c1c1e] border-white/10 text-white max-w-[400px]">
                            <DialogHeader>
                                <DialogTitle className="text-lg font-bold">Remover Usuário</DialogTitle>
                                <DialogDescription className="text-zinc-400 text-sm">
                                    Tem certeza que deseja remover este usuário? Esta ação não pode ser desfeita.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="flex gap-2 pt-4">
                                <Button
                                    variant="ghost"
                                    className="flex-1 border-white/10 hover:bg-white/5 text-zinc-400"
                                    onClick={() => setDeleteConfirm({ open: false, userId: null })}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="flex-1 bg-red-500 hover:bg-red-600 font-bold"
                                    onClick={confirmDeleteUser}
                                >
                                    Confirmar Exclusão
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Final Reset Confirmation Dialog */}
                    <Dialog open={showFinalResetConfirm} onOpenChange={setShowFinalResetConfirm}>
                        <DialogContent className="bg-[#1c1c1e] border-white/10 text-white max-w-[400px]">
                            <DialogHeader>
                                <DialogTitle className="text-lg font-bold text-red-500">Ação Irreversível</DialogTitle>
                                <DialogDescription className="text-zinc-400 text-sm font-medium">
                                    TEM CERTEZA ABSOLUTA? Isso apagará todos os dados de clientes, posts, usuários e arquivos.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="flex gap-2 pt-4">
                                <Button
                                    variant="ghost"
                                    className="flex-1 border-white/10 hover:bg-white/5 text-zinc-400"
                                    onClick={() => setShowFinalResetConfirm(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="flex-1 bg-red-600 hover:bg-red-700 font-bold"
                                    onClick={confirmFinalReset}
                                >
                                    Limpar Tudo Agora
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </main>
        </div>
    )
}

