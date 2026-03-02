"use client"

import { useState, useEffect, useRef } from "react"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Trash2, Shield, Mail, User as UserIcon, Upload, Briefcase, DollarSign, PenTool, Share2, Pencil, X, Phone } from "lucide-react"

import { DataService, User, UserRole } from "@/lib/data"
import { TrelloImport } from "@/components/admin/trello-import"

const ROLE_LABELS: Record<UserRole, string> = {
    admin: "Administrador",
    editor: "Editor",
    social_media: "Social Media",
    designer: "Designer",
    manager: "Gestão",
    financial: "Financeiro"
}

const ROLE_STYLES: Record<UserRole, string> = {
    admin: "bg-primary/10 text-primary hover:bg-primary/20",
    editor: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
    social_media: "bg-pink-500/10 text-pink-500 hover:bg-pink-500/20",
    designer: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20",
    manager: "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20",
    financial: "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
}

export default function AdminPage() {
    const [users, setUsers] = useState<User[]>([])
    const [newUser, setNewUser] = useState<{ name: string, email: string, whatsapp: string, role: UserRole, avatar: string | null }>({
        name: "",
        email: "",
        whatsapp: "",
        role: "editor",
        avatar: null
    })
    const [loading, setLoading] = useState(false)
    const [scale, setScale] = useState(1)
    const [editingId, setEditingId] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        setUsers(DataService.getUsers())
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
            setNewUser({ name: "", email: "", whatsapp: "", role: "editor", avatar: null })
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
    }

    const handleCancelEdit = () => {
        setNewUser({ name: "", email: "", whatsapp: "", role: "editor", avatar: null })
        setEditingId(null)
        setScale(1)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const handleDeleteUser = (id: string) => {
        if (confirm("Tem certeza que deseja remover este usuário?")) {
            const updatedUsers = users.filter(u => u.id !== id)
            setUsers(updatedUsers)
            DataService.saveUsers(updatedUsers)

            if (editingId === id) {
                handleCancelEdit()
            }
        }
    }

    return (
        <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
            <div className="fixed inset-0 z-[-1]">
                <img
                    src="/app-bg.png"
                    alt="Background"
                    className="w-full h-full object-cover opacity-20"
                />
            </div>

            <SidebarNav />

            <main className="flex-1 overflow-y-auto bg-transparent p-8 relative z-10">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Administração</h1>
                            <p className="text-muted-foreground">Gerencie usuários e permissões do sistema.</p>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-12">
                        {/* Form Section */}
                        <Card className="md:col-span-5 bg-[#0A0A0A]/80 backdrop-blur-xl border-white/5 h-fit sticky top-6">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div>
                                    <CardTitle>{editingId ? "Editar Usuário" : "Novo Usuário"}</CardTitle>
                                    <CardDescription>{editingId ? "Atualize os dados do membro." : "Adicione um novo membro ao time."}</CardDescription>
                                </div>
                                {editingId && (
                                    <Button variant="ghost" size="icon" onClick={handleCancelEdit} title="Cancelar Edição">
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-24 h-24 relative overflow-hidden rounded-full border-2 border-dashed border-white/20 group hover:border-primary/50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
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
                                                <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
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
                                        <div className="w-full max-w-[200px] space-y-2">
                                            <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground">
                                                <span>Zoom -</span>
                                                <span>Zoom +</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="1"
                                                max="3"
                                                step="0.1"
                                                value={scale}
                                                onChange={(e) => setScale(parseFloat(e.target.value))}
                                                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-125"
                                            />
                                        </div>
                                    )}

                                    <span className="text-[10px] text-muted-foreground cursor-pointer hover:text-primary" onClick={() => fileInputRef.current?.click()}>
                                        {newUser.avatar ? "Alterar Imagem" : "Adicionar Avatar"}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <Label>Nome Completo</Label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Ex: João Silva"
                                            className="pl-9 bg-white/5 border-white/10"
                                            value={newUser.name}
                                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Ex: joao@empresa.com"
                                            className="pl-9 bg-white/5 border-white/10"
                                            value={newUser.email}
                                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>WhatsApp</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Ex: 11 99999-9999"
                                            className="pl-9 bg-white/5 border-white/10"
                                            value={newUser.whatsapp}
                                            onChange={(e) => setNewUser({ ...newUser, whatsapp: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Função</Label>
                                    <Select
                                        value={newUser.role}
                                        onValueChange={(val) => setNewUser({ ...newUser, role: val as UserRole })}
                                    >
                                        <SelectTrigger className="bg-white/5 border-white/10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">Administrador</SelectItem>
                                            <SelectItem value="manager">Gestão</SelectItem>
                                            <SelectItem value="financial">Financeiro</SelectItem>
                                            <SelectItem value="social_media">Social Media</SelectItem>
                                            <SelectItem value="editor">Editor</SelectItem>
                                            <SelectItem value="designer">Designer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    {editingId && (
                                        <Button
                                            variant="outline"
                                            className="flex-1 border-white/10 bg-white/5 hover:bg-white/10"
                                            onClick={handleCancelEdit}
                                        >
                                            Cancelar
                                        </Button>
                                    )}
                                    <Button
                                        className="flex-1 bg-primary hover:bg-primary/90"
                                        onClick={handleSaveUser}
                                        disabled={loading || !newUser.name || !newUser.email}
                                    >
                                        {loading ? "Salvando..." : (editingId ? "Atualizar Usuário" : "Adicionar Usuário")}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* List Section */}
                        <Card className="md:col-span-7 bg-[#0A0A0A]/80 backdrop-blur-xl border-white/5">
                            <CardHeader>
                                <CardTitle>Usuários Cadastrados</CardTitle>
                                <CardDescription>{users.length} membros ativos.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {users.map((user) => (
                                        <div key={user.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all group ${editingId === user.id ? 'border-primary/50 bg-primary/5' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'}`}>
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-10 w-10 border border-white/10">
                                                    <AvatarImage src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                                                    <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-sm leading-none text-white">{user.name}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
                                                    {user.whatsapp && (
                                                        <p className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                                                            <Phone className="h-2.5 w-2.5" />
                                                            {user.whatsapp}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className={`${ROLE_STYLES[user.role]} border-transparent`}>
                                                    {user.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                                                    {user.role === 'manager' && <Briefcase className="h-3 w-3 mr-1" />}
                                                    {user.role === 'financial' && <DollarSign className="h-3 w-3 mr-1" />}
                                                    {user.role === 'social_media' && <Share2 className="h-3 w-3 mr-1" />}
                                                    {user.role === 'designer' && <PenTool className="h-3 w-3 mr-1" />}
                                                    {ROLE_LABELS[user.role]}
                                                </Badge>

                                                <div className="flex items-center border-l border-white/10 pl-2 ml-2 gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-white"
                                                        onClick={() => handleEditUser(user)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                                        onClick={() => handleDeleteUser(user.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {users.length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground text-sm">
                                            Nenhum usuário cadastrado.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-6 md:grid-cols-12">
                        <div className="md:col-span-6">
                            <TrelloImport />
                        </div>

                        <div className="md:col-span-6">
                            <Card className="bg-red-500/5 border-red-500/20 backdrop-blur-xl">
                                <CardHeader>
                                    <CardTitle className="text-red-400 flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Zona de Perigo
                                    </CardTitle>
                                    <CardDescription className="text-red-400/60">
                                        Ações irreversíveis para o sistema.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <p className="text-sm text-muted-foreground">
                                            Se deseja limpar todos os dados importados e voltar ao estado inicial de demonstração, utilize o botão abaixo.
                                            Isso apagará todas as demandas e usuários criados.
                                        </p>
                                        <Button
                                            variant="destructive"
                                            className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20"
                                            onClick={() => {
                                                if (confirm("TEM CERTEZA? Isso apagará TODOS os dados locais e reiniciará o app para o estado zero. Essa ação não pode ser desfeita.")) {
                                                    localStorage.clear()
                                                    window.location.reload()
                                                }
                                            }}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Resetar Base de Dados (Limpar Tudo)
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
