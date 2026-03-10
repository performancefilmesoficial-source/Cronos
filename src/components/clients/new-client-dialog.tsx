"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Loader2, Info, Users, FileText, Upload, Download, Image as ImageIcon, FolderPlus } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { jsPDF } from "jspdf"
import { toast } from "sonner"
import { Client } from "@/types/client"

interface NewClientDialogProps {
    onClientCreate: (client: Client) => void
    children?: React.ReactNode
    editClient?: Client | null
    externalOpen?: boolean
    onExternalOpenChange?: (open: boolean) => void
}

export function NewClientDialog({ onClientCreate, children, editClient, externalOpen, onExternalOpenChange }: NewClientDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const isControlled = externalOpen !== undefined
    const open = isControlled ? externalOpen : internalOpen
    const setOpen = (v: boolean) => {
        if (isControlled) onExternalOpenChange?.(v)
        else setInternalOpen(v)
    }
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState("")
    const [industry, setIndustry] = useState("Geral")
    const [handle, setHandle] = useState("")
    const [notes, setNotes] = useState("")
    const [status, setStatus] = useState("Ativo")
    const [primaryColor, setPrimaryColor] = useState("#ec4899")
    const [secondaryColor, setSecondaryColor] = useState("#8b5cf6")
    const [accentColor, setAccentColor] = useState("#f59e0b")
    const [palette, setPalette] = useState<string[]>([])
    const [credentials, setCredentials] = useState<any[]>([])

    // Social state for current entry
    const [socialPlatform, setSocialPlatform] = useState("")
    const [socialLogin, setSocialLogin] = useState("")
    const [socialPassword, setSocialPassword] = useState("")

    const isEditing = !!editClient

    // Pre-fill form when editing
    useEffect(() => {
        if (editClient && open) {
            setName(editClient.name || "")
            setIndustry(editClient.industry || "Geral")
            setHandle(editClient.handle || "")
            setNotes(editClient.notes || "")
            setStatus(editClient.status || "Ativo")
            setPrimaryColor(editClient.primaryColor || "#ec4899")
            setSecondaryColor(editClient.secondaryColor || "#8b5cf6")
            setAccentColor(editClient.accentColor || "#f59e0b")
            setPalette(editClient.palette || [])
            setCredentials(editClient.credentials || [])
        } else if (!open) {
            // Reset on close
            setName("")
            setIndustry("Geral")
            setHandle("")
            setNotes("")
            setStatus("Ativo")
            setPrimaryColor("#ec4899")
            setSecondaryColor("#8b5cf6")
            setAccentColor("#f59e0b")
            setPalette([])
            setCredentials([])
        }
    }, [editClient, open])
    const logoInputRef = useRef<HTMLInputElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleCreateFolder = async () => {
        if (!name) {
            toast.warning("Nome Obrigatório", {
                description: "Por favor, digite o nome do cliente antes de criar a pasta."
            })
            return
        }
        try {
            const response = await fetch('/api/clients/create-folder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientName: name }),
            });
            const data = await response.json();
            if (data.success) {
                toast.success("Pasta Criada", {
                    description: `Estrutura de pastas para "${name}" criada com sucesso.`
                })
            } else {
                toast.error("Erro na Criação", {
                    description: data.error
                })
            }
        } catch (error) {
            toast.error("Conexão Falhou", {
                description: "Não foi possível conectar com o servidor local."
            })
        }
    }

    const handleGeneratePDF = async () => {
        if (!name) {
            toast.warning("Nome Necessário", {
                description: "Por favor, digite o nome do cliente antes de gerar o PDF."
            })
            return
        }

        const toastId = toast.loading("Gerando PDF...")

        try {
            const doc = new jsPDF()

            // Título
            doc.setFontSize(22)
            doc.setTextColor(0, 0, 0)
            doc.text("Manual de Identidade Visual", 20, 20)

            doc.setFontSize(16)
            doc.text(`Cliente: ${name}`, 20, 35)

            // Swatches de Cores
            const colors = [
                { label: "Cor Primaria", hex: primaryColor, y: 50 },
                { label: "Cor Secundaria", hex: secondaryColor, y: 90 },
                { label: "Cor de Acento", hex: accentColor, y: 130 }
            ]

            colors.forEach((c) => {
                doc.setFontSize(14)
                doc.text(c.label, 20, c.y)

                // Desenhar o quadrado da cor
                doc.setFillColor(c.hex)
                doc.rect(20, c.y + 5, 40, 20, "F")

                doc.setFontSize(12)
                doc.text(`HEX: ${c.hex.toUpperCase()}`, 70, c.y + 17)
            })

            // Converter para Base64
            const pdfOutput = doc.output('datauristring')
            const base64Data = pdfOutput.split(',')[1]

            // Enviar para o servidor para salvar
            const response = await fetch('/api/clients/save-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientName: name,
                    pdfBase64: base64Data
                }),
            });

            const data = await response.json();
            if (data.success) {
                toast.success("PDF Gerado", {
                    id: toastId,
                    description: `O manual da marca de "${name}" foi salvo na pasta Branding.`
                })
            } else {
                toast.error("Erro ao Salvar", {
                    id: toastId,
                    description: data.error
                })
            }

        } catch (error) {
            console.error("Erro na geração do PDF:", error)
            toast.error("Erro na Geração", {
                id: toastId,
                description: "Não foi possível gerar ou salvar o arquivo PDF."
            })
        }
    }

    const triggerLogoUpload = () => logoInputRef.current?.click()
    const triggerFileUpload = () => fileInputRef.current?.click()

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!name) {
            toast.warning("Nome Faltando", {
                description: `Por favor, digite o nome do cliente antes de enviar o arquivo de ${type}.`
            })
            return
        }

        const toastId = toast.loading(`Enviando ${file.name}...`)

        try {
            const reader = new FileReader()
            reader.onload = async (event) => {
                const base64 = event.target?.result as string
                const base64Data = base64.split(',')[1]

                const response = await fetch('/api/clients/upload-file', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        clientName: name,
                        fileName: file.name,
                        fileBase64: base64Data
                    }),
                });

                const data = await response.json();
                if (data.success) {
                    toast.success("Upload Concluído", {
                        id: toastId,
                        description: `O arquivo "${file.name}" foi salvo na pasta Branding.`
                    })
                } else {
                    toast.error("Erro no Upload", {
                        id: toastId,
                        description: data.error
                    })
                }
            }
            reader.readAsDataURL(file)
        } catch (error) {
            console.error(`Erro no upload de ${type}:`, error)
            toast.error("Erro de Processamento", {
                id: toastId,
                description: "Ocorreu um erro ao processar o arquivo."
            })
        }
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            const clientPayload = {
                id: editClient?.id,
                name: name || "Novo Cliente",
                industry: industry,
                activeContract: true,
                primaryColor: primaryColor,
                secondaryColor: secondaryColor,
                handle: handle,
                status: status,
                logo: editClient?.logo || "https://github.com/shadcn.png",
                accentColor: accentColor,
                palette: palette,
                credentials: credentials,
                notes: notes,
            }

            const response = await fetch('/api/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clientPayload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Erro ao salvar cliente");
            }

            const savedClient = await response.json();
            toast.success(isEditing ? "Cliente Atualizado" : "Cliente Criado", {
                description: `O cliente "${savedClient.name}" foi salvo com sucesso.`
            });

            onClientCreate(savedClient)
            setOpen(false)
        } catch (error: any) {
            toast.error("Erro ao Salvar", {
                description: error.message
            });
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!isControlled && (
                <DialogTrigger asChild>
                    {children || (
                        <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all hover:scale-105">
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Cliente
                        </Button>
                    )}
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[700px] bg-[#09090b] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">{isEditing ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
                    <DialogDescription className="text-zinc-500">
                        {isEditing ? "Atualize as informações do cliente abaixo." : "Preencha as informações abaixo para cadastrar um novo cliente."}
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="basico" className="w-full mt-4">
                    <TabsList className="w-full justify-start bg-white/5 border border-white/5 rounded-lg p-1">
                        <TabsTrigger value="basico" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">Básico</TabsTrigger>
                        <TabsTrigger value="redes" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">Redes</TabsTrigger>
                        <TabsTrigger value="contrato" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">Contrato</TabsTrigger>
                        <TabsTrigger value="visualizacao" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">Visualização</TabsTrigger>
                        <TabsTrigger value="paleta" className="hidden">Paleta de Cores</TabsTrigger>
                        <TabsTrigger value="branding" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">Branding</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basico" className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nome">Nome *</Label>
                                <Input
                                    id="nome"
                                    placeholder="Ex: Empresa XYZ"
                                    className="bg-black/20 border-white/10 focus-visible:ring-primary/50"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="social">@ da principal rede social</Label>
                                <Input
                                    id="social"
                                    placeholder="@username"
                                    className="bg-black/20 border-white/10 focus-visible:ring-primary/50"
                                    value={handle}
                                    onChange={(e) => setHandle(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="segmento">Segmento / Nicho</Label>
                                <Input
                                    id="segmento"
                                    placeholder="Ex: Saúde e Bem-estar"
                                    className="bg-black/20 border-white/10 focus-visible:ring-primary/50"
                                    value={industry}
                                    onChange={(e) => setIndustry(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger id="status" className="bg-black/20 border-white/10 focus:ring-primary/50">
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1c1c1e] border-white/10 text-white">
                                        <SelectItem value="Ativo">Ativo</SelectItem>
                                        <SelectItem value="Inativo">Inativo</SelectItem>
                                        <SelectItem value="Prospect">Prospect</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="whatsapp">WhatsApp</Label>
                                <Input id="whatsapp" placeholder="(11) 99999-9999" className="bg-black/20 border-white/10 focus-visible:ring-primary/50" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input id="email" placeholder="contato@empresa.com" className="bg-black/20 border-white/10 focus-visible:ring-primary/50" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="cidade">Estado / Cidade</Label>
                                <Input id="cidade" placeholder="SP / São Paulo" className="bg-black/20 border-white/10 focus-visible:ring-primary/50" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="origem">Origem</Label>
                                <Select>
                                    <SelectTrigger id="origem" className="bg-black/20 border-white/10 focus:ring-primary/50">
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1c1c1e] border-white/10 text-white">
                                        <SelectItem value="indicacao">Indicação</SelectItem>
                                        <SelectItem value="marketing">Marketing</SelectItem>
                                        <SelectItem value="outros">Outros</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fuso">Fuso Horário</Label>
                            <Select defaultValue="brasilia">
                                <SelectTrigger id="fuso" className="bg-black/20 border-white/10 focus:ring-primary/50">
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1c1c1e] border-white/10 text-white">
                                    <SelectItem value="brasilia">Brasília (GMT-3)</SelectItem>
                                    <SelectItem value="manaus">Manaus (GMT-4)</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-[10px] text-zinc-500">Estados: SP, RJ, MG, PR, SC, RS, GO, DF, ES, BA, SE, AL, PE, PB, RN, CE, PI, MA</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="aprovacao" className="flex items-center gap-2">
                                Modo de Aprovação Padrão
                                <Info className="h-3 w-3 text-zinc-500" />
                            </Label>
                            <Select defaultValue="content-flow">
                                <SelectTrigger id="aprovacao" className="bg-black/20 border-white/10 focus:ring-primary/50">
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1c1c1e] border-white/10 text-white">
                                    <SelectItem value="content-flow">Content Flow (4 etapas)</SelectItem>
                                    <SelectItem value="simple">Simples (2 etapas)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notas">Notas Internas</Label>
                            <div className="relative group">
                                <Textarea
                                    id="notas"
                                    placeholder="Observações importantes sobre o cliente..."
                                    className="bg-black/20 border-white/10 focus-visible:ring-primary/50 min-h-[100px] resize-none"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                                <div className="absolute bottom-2 right-2 text-[10px] text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Esc para sair
                                </div>
                            </div>
                        </div>

                    </TabsContent>

                    <TabsContent value="redes" className="space-y-4 mt-4">
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                            <div className="bg-white/[0.03] border border-white/5 p-4 rounded-xl space-y-4">
                                <Label className="text-sm font-bold">Adicionar Novo Acesso</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] uppercase tracking-wider text-zinc-500">Plataforma</Label>
                                        <Select value={socialPlatform} onValueChange={setSocialPlatform}>
                                            <SelectTrigger className="h-9 bg-black/40 border-white/5 text-xs">
                                                <SelectValue placeholder="Selecione" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#1c1c1e] border-white/10 text-white">
                                                <SelectItem value="Instagram">Instagram</SelectItem>
                                                <SelectItem value="TikTok">TikTok</SelectItem>
                                                <SelectItem value="YouTube">YouTube</SelectItem>
                                                <SelectItem value="Facebook">Facebook</SelectItem>
                                                <SelectItem value="Meta">Meta</SelectItem>
                                                <SelectItem value="Site">Site</SelectItem>
                                                <SelectItem value="Outros">Outros</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] uppercase tracking-wider text-zinc-500">Login / E-mail</Label>
                                        <Input
                                            value={socialLogin}
                                            onChange={(e) => setSocialLogin(e.target.value)}
                                            placeholder="@usuario"
                                            className="h-9 bg-black/40 border-white/5 text-xs"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] uppercase tracking-wider text-zinc-500">Senha</Label>
                                    <Input
                                        value={socialPassword}
                                        onChange={(e) => setSocialPassword(e.target.value)}
                                        type="password"
                                        placeholder="••••••••"
                                        className="h-9 bg-black/40 border-white/5 text-xs"
                                    />
                                </div>
                                <Button
                                    className="w-full h-9 bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 text-xs font-bold"
                                    onClick={() => {
                                        if (!socialPlatform || !socialLogin) return
                                        setCredentials([...credentials, { platform: socialPlatform, login: socialLogin, password: socialPassword }])
                                        setSocialPlatform("")
                                        setSocialLogin("")
                                        setSocialPassword("")
                                    }}
                                >
                                    Adicionar à Lista
                                </Button>
                            </div>

                            {credentials.length > 0 && (
                                <div className="space-y-2 pt-2">
                                    <Label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Acessos Adicionados</Label>
                                    {credentials.map((cred, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-bold text-primary">{cred.platform}</span>
                                                <span className="text-[10px] text-zinc-400">{cred.login}</span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-red-500 hover:bg-red-500/10"
                                                onClick={() => setCredentials(credentials.filter((_, idx) => idx !== i))}
                                            >
                                                <Plus className="h-3 w-3 rotate-45" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="contrato" className="space-y-4 mt-4">
                        <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm">Contrato 1</span>
                                    <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-medium border border-emerald-500/20">Ativo</div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"><path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" transform="rotate(180 7.5 8.25)"></path></svg>
                                </Button>
                            </div>

                            <div className="p-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="titulo-contrato">Título do Contrato</Label>
                                        <Input id="titulo-contrato" defaultValue="Contrato - Cliente" className="bg-black/20 border-white/10" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="status-contrato">Status do Contrato</Label>
                                        <Select defaultValue="ativo">
                                            <SelectTrigger id="status-contrato" className="bg-black/20 border-white/10">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#1c1c1e] border-white/10 text-white">
                                                <SelectItem value="ativo">Ativo</SelectItem>
                                                <SelectItem value="inativo">Inativo</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="flex gap-2 items-center">Data de Início <Info className="w-3 h-3 text-muted-foreground" /></Label>
                                        <div className="relative">
                                            <Input type="date" className="bg-black/20 border-white/10 pl-10 block w-full text-left" />
                                            <div className="absolute left-3 top-2.5 pointer-events-none text-muted-foreground">
                                                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"><path d="M10 1C10 0.447715 10.4477 0 11 0C11.5523 0 12 0.447715 12 1V2H3V1C3 0.447715 3.44772 0 4 0C4.55228 0 5 0.447715 5 1V2H10V1ZM5.9 2H9.1V1H5.9V2ZM2 3V14C2 14.5523 2.44772 15 3 15H12C12.5523 15 13 14.5523 13 14V3H2ZM2.5 4H12.5C12.7761 4 13 4.22386 13 4.5V13.5C13 13.7761 12.7761 14 12.5 14H2.5C2.22386 14 2 13.7761 2 13.5V4.5C2 4.22386 2.22386 4 2.5 4Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Arquivo do Contrato</Label>
                                        <Input placeholder="URL do arquivo" className="bg-black/20 border-white/10" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Serviço Contratado</Label>
                                    <Textarea placeholder='Ex: "12 posts/mês + 1 vídeo" ou "Pacote Premium"' className="bg-black/20 border-white/10 min-h-[80px]" />
                                </div>
                                <p className="text-[10px] text-muted-foreground">Preencha os dados do contrato para gerar entradas financeiras automaticamente.</p>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Valor Mensal (R$)</Label>
                                        <Input defaultValue="2500.00" className="bg-black/20 border-white/10" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Qtd. Meses</Label>
                                        <Input defaultValue="12" className="bg-black/20 border-white/10" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Forma de Pagamento</Label>
                                        <Select defaultValue="pix">
                                            <SelectTrigger className="bg-black/20 border-white/10">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#1c1c1e] border-white/10 text-white">
                                                <SelectItem value="pix">PIX</SelectItem>
                                                <SelectItem value="boleto">Boleto</SelectItem>
                                                <SelectItem value="cartao">Cartão de Crédito</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex gap-2 items-center">Primeira Cobrança em <Info className="w-3 h-3 text-muted-foreground" /></Label>
                                        <div className="relative">
                                            <Input type="date" className="bg-black/20 border-white/10 pl-10 block w-full text-left" />
                                            <div className="absolute left-3 top-2.5 pointer-events-none text-muted-foreground">
                                                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"><path d="M10 1C10 0.447715 10.4477 0 11 0C11.5523 0 12 0.447715 12 1V2H3V1C3 0.447715 3.44772 0 4 0C4.55228 0 5 0.447715 5 1V2H10V1ZM5.9 2H9.1V1H5.9V2ZM2 3V14C2 14.5523 2.44772 15 3 15H12C12.5523 15 13 14.5523 13 14V3H2ZM2.5 4H12.5C12.7761 4 13 4.22386 13 4.5V13.5C13 13.7761 12.7761 14 12.5 14H2.5C2.22386 14 2 13.7761 2 13.5V4.5C2 4.22386 2.22386 4 2.5 4Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button variant="outline" className="w-full border-dashed border-white/10 hover:bg-white/5 py-4 h-auto text-muted-foreground">
                            <Plus className="mr-2 h-4 w-4" />
                            Adicionar outro contrato
                        </Button>
                    </TabsContent>

                    <TabsContent value="visualizacao" className="space-y-4 mt-4">
                        <div className="bg-white/5 border border-white/5 rounded-lg p-3 text-sm text-zinc-300">
                            <strong>Controle de visibilidade:</strong> Defina quais membros da sua equipe podem visualizar este cliente no sistema.
                        </div>

                        <div className="space-y-3">
                            <Label className="text-base">Quem pode visualizar este cliente?</Label>

                            <div className="relative">
                                <label className="flex items-start gap-4 p-4 rounded-xl border border-primary/50 bg-primary/5 cursor-pointer transition-all hover:bg-primary/10">
                                    <div className="mt-1">
                                        <input type="radio" name="visibility" className="accent-primary h-4 w-4" defaultChecked />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="font-semibold flex items-center gap-2">
                                            <Users className="h-4 w-4" />
                                            Todos os membros do workspace
                                        </div>
                                        <p className="text-sm text-zinc-400">Qualquer pessoa com acesso ao workspace e permissão de visualizar clientes pode ver este cliente.</p>
                                    </div>
                                </label>
                            </div>

                            <div className="relative">
                                <label className="flex items-start gap-4 p-4 rounded-xl border border-white/10 bg-white/5 cursor-pointer transition-all hover:border-white/20 hover:bg-white/10">
                                    <div className="mt-1">
                                        <input type="radio" name="visibility" className="accent-primary h-4 w-4" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="font-semibold flex items-center gap-2">
                                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"><path d="M7.5 11C4.80285 11 2.52952 9.62184 1.09622 7.50001C2.52952 5.37816 4.80285 4 7.5 4C10.1971 4 12.4705 5.37816 13.9038 7.50001C12.4705 9.62183 10.1971 11 7.5 11ZM7.5 3C4.30786 3 1.65639 4.70638 0.244848 7.23873L0.244842 7.23874C0.171708 7.3699 0.171708 7.63009 0.244848 7.76126C1.65639 10.2936 4.30786 12 7.5 12C10.6921 12 13.3436 10.2936 14.7552 7.76126C14.8283 7.63009 14.8283 7.36991 14.7552 7.23874C13.3436 4.70638 10.6921 3 7.5 3ZM7.5 9.5C8.60457 9.5 9.5 8.60457 9.5 7.5C9.5 6.39543 8.60457 5.5 7.5 5.5C6.39543 5.5 5.5 6.39543 5.5 7.5C5.5 8.60457 6.39543 9.5 7.5 9.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                            Personalizado
                                        </div>
                                        <p className="text-sm text-zinc-400">Apenas membros selecionados podem visualizar este cliente.</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="branding" className="space-y-6 mt-4">
                        <div className="flex flex-wrap items-center gap-2 bg-white/5 border border-white/5 rounded-lg p-3">
                            <div className="text-sm text-zinc-300 flex-1">
                                <strong>Manual da Marca:</strong> Defina as cores principais e gerencie os arquivos da identidade visual.
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCreateFolder}
                                    className="h-8 gap-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/20 transition-all font-bold"
                                >
                                    <FolderPlus className="h-3.5 w-3.5" />
                                    Nova Pasta
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleGeneratePDF}
                                    className="h-8 gap-2 border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                                >
                                    <FileText className="h-3.5 w-3.5" />
                                    Gerar PDF Branding
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-3">
                                <Label>Cor Primária</Label>
                                <div className="flex items-center gap-3">
                                    <div className="relative group">
                                        <div className="h-12 w-12 rounded-full border-2 border-white/20 overflow-hidden shadow-lg shadow-black/50 transition-transform group-hover:scale-110" style={{ backgroundColor: primaryColor }}>
                                            <input
                                                type="color"
                                                className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer p-0 border-0 opacity-0"
                                                value={primaryColor}
                                                onChange={(e) => setPrimaryColor(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <Input
                                            value={primaryColor}
                                            onChange={(e) => setPrimaryColor(e.target.value)}
                                            className="font-mono bg-black/20 border-white/10 uppercase"
                                            maxLength={7}
                                        />
                                    </div>
                                </div>
                                <p className="text-[10px] text-zinc-500">Usada em botões, destaques e badges.</p>
                            </div>

                            <div className="space-y-3">
                                <Label>Cor Secundária</Label>
                                <div className="flex items-center gap-3">
                                    <div className="relative group">
                                        <div className="h-12 w-12 rounded-full border-2 border-white/20 overflow-hidden shadow-lg shadow-black/50 transition-transform group-hover:scale-110" style={{ backgroundColor: secondaryColor }}>
                                            <input
                                                type="color"
                                                className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer p-0 border-0 opacity-0"
                                                value={secondaryColor}
                                                onChange={(e) => setSecondaryColor(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <Input
                                            value={secondaryColor}
                                            onChange={(e) => setSecondaryColor(e.target.value)}
                                            className="font-mono bg-black/20 border-white/10 uppercase"
                                            maxLength={7}
                                        />
                                    </div>
                                </div>
                                <p className="text-[10px] text-zinc-500">Usada em elementos de apoio.</p>
                            </div>

                            <div className="space-y-3">
                                <Label>Cor de Acento</Label>
                                <div className="flex items-center gap-3">
                                    <div className="relative group">
                                        <div className="h-12 w-12 rounded-full border-2 border-white/20 overflow-hidden shadow-lg shadow-black/50 transition-transform group-hover:scale-110" style={{ backgroundColor: accentColor }}>
                                            <input
                                                type="color"
                                                className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer p-0 border-0 opacity-0"
                                                value={accentColor}
                                                onChange={(e) => setAccentColor(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <Input
                                            value={accentColor}
                                            onChange={(e) => setAccentColor(e.target.value)}
                                            className="font-mono bg-black/20 border-white/10 uppercase"
                                            maxLength={7}
                                        />
                                    </div>
                                </div>
                                <p className="text-[10px] text-zinc-500">Usada em alertas e notificações.</p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <Label className="text-base">Paleta de Cores Estendida</Label>
                            <div className="flex flex-wrap gap-2">
                                {palette.map((color, i) => (
                                    <div key={i} className="group relative">
                                        <div className="h-10 w-10 rounded-lg border border-white/10" style={{ backgroundColor: color }} />
                                        <button
                                            className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => setPalette(palette.filter((_, idx) => idx !== i))}
                                        >
                                            <Plus className="h-2.5 w-2.5 rotate-45 text-white" />
                                        </button>
                                    </div>
                                ))}
                                <div className="relative h-10 w-10 rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center hover:border-primary/50 transition-colors group">
                                    <Plus className="h-4 w-4 text-zinc-600 group-hover:text-primary" />
                                    <input
                                        type="color"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => {
                                            setPalette([...palette, e.target.value])
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <Label className="text-base">Arquivos do Cliente</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="file"
                                    ref={logoInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, "Logo")}
                                />
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={(e) => handleFileChange(e, "Arquivos")}
                                />

                                <Button
                                    variant="outline"
                                    onClick={triggerLogoUpload}
                                    className="h-24 border-dashed border-white/10 bg-white/5 hover:bg-white/10 flex flex-col gap-2 group transition-all hover:border-primary/50"
                                >
                                    <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                        <ImageIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                                    </div>
                                    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">Upload de Logomarca</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={triggerFileUpload}
                                    className="h-24 border-dashed border-white/10 bg-white/5 hover:bg-white/10 flex flex-col gap-2 group transition-all hover:border-primary/50"
                                >
                                    <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                        <Upload className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                                    </div>
                                    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">Outros Arquivos</span>
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter>
                    <Button
                        className="bg-primary hover:bg-primary/90 text-white"
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            isEditing ? "Salvar Alterações" : "Salvar"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
