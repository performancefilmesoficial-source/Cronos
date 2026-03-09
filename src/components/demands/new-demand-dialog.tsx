"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { DataService, Demand } from "@/lib/data"
import { MediaDB } from "@/lib/media-db"
import { Plus, Loader2, Sparkles, Calendar as CalendarIcon, Upload, X, ImageIcon, FileIcon, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { SERVICE_TYPES } from "@/lib/services"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface NewDemandDialogProps {
    children?: React.ReactNode
    clientId?: string
    clientName?: string
    initialClients?: any[]
    onSuccess?: () => void
    /** Se true, cria o conteúdo sem data (vai para "Conteúdos Extras") */
    unscheduled?: boolean
    /** Se passado, o modal funciona em modo de edição */
    demand?: Demand
    /** Controle externo de abertura */
    open?: boolean
    onOpenChange?: (open: boolean) => void
    /** Data padrão ao abrir (para quando clica no + do calendário) */
    defaultDay?: number
    defaultMonth?: number
    defaultYear?: number
}

export function NewDemandDialog({
    children,
    clientId: initialClientId,
    clientName: initialClientName,
    initialClients,
    onSuccess,
    unscheduled,
    demand,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    defaultDay,
    defaultMonth,
    defaultYear
}: NewDemandDialogProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
    const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen
    const setOpen = setControlledOpen || setUncontrolledOpen

    const [saving, setSaving] = useState(false)
    const [generatingCaption, setGeneratingCaption] = useState(false)

    // Form State
    const [title, setTitle] = useState("")
    const [type, setType] = useState<string>(SERVICE_TYPES[0].value)
    const [caption, setCaption] = useState("")
    const [briefing, setBriefing] = useState("")
    const [mediaFile, setMediaFile] = useState<File | null>(null)
    const [mediaPreview, setMediaPreview] = useState<string | null>(null)
    const [resolvedMediaUrl, setResolvedMediaUrl] = useState<string | null>(null)
    const [selectedClientId, setSelectedClientId] = useState(initialClientId || "")
    const [selectedClientName, setSelectedClientName] = useState(initialClientName || "")

    // Update selected client if props change
    useEffect(() => {
        if (initialClientId) setSelectedClientId(initialClientId)
        if (initialClientName) setSelectedClientName(initialClientName)
    }, [initialClientId, initialClientName])

    // Calendar state
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
    const [showCalendar, setShowCalendar] = useState(false)

    // Resolve Media URL
    useEffect(() => {
        const resolve = async () => {
            if (!mediaPreview) {
                setResolvedMediaUrl(null)
                return
            }

            if (mediaPreview.startsWith("idb:")) {
                const mediaId = mediaPreview.replace("idb:", "")
                try {
                    const data = await MediaDB.getMedia(mediaId)
                    setResolvedMediaUrl(data)
                } catch (e) {
                    console.error("Error resolving IDB media", e)
                    setResolvedMediaUrl(null)
                }
            } else {
                setResolvedMediaUrl(mediaPreview)
            }
        }
        resolve()
    }, [mediaPreview])

    // Sync state when opening
    useEffect(() => {
        if (open) {
            if (demand) {
                setTitle(demand.title)
                setType(demand.type)
                setCaption(demand.caption || "")
                setBriefing(demand.briefing || "")
                setMediaPreview(demand.mediaUrl || null)
                if (demand.day) {
                    const d = new Date()
                    d.setDate(demand.day)
                    setSelectedDate(d)
                } else {
                    setSelectedDate(undefined)
                }
            } else if (defaultDay !== undefined) {
                const d = new Date(defaultYear || new Date().getFullYear(), defaultMonth || new Date().getMonth(), defaultDay)
                setSelectedDate(d)
                setTitle("")
                setType(SERVICE_TYPES[0].value)
                setCaption("")
                setBriefing("")
                setMediaFile(null)
                setMediaPreview(null)
            } else {
                setTitle("")
                setType(SERVICE_TYPES[0].value)
                setCaption("")
                setBriefing("")
                setMediaFile(null)
                setMediaPreview(null)
                setSelectedDate(undefined)
            }
        }
    }, [open, demand, defaultDay, defaultMonth, defaultYear])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setMediaFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setMediaPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleDelete = async () => {
        if (!demand) return
        if (!confirm("Tem certeza que deseja excluir este conteúdo?")) return

        try {
            const demands = DataService.getDemands()
            const updatedDemands = demands.filter(d => d.id !== demand.id)
            await DataService.saveDemands(updatedDemands)
            setOpen(false)
            if (onSuccess) onSuccess()
            toast.success("Conteúdo excluído com sucesso")
        } catch (error) {
            console.error("Delete error:", error)
            toast.error("Erro ao excluir conteúdo")
        }
    }

    const handleSave = async () => {
        if (!title) return
        if (!unscheduled && !selectedDate && !demand) return

        setSaving(true)
        try {
            const existingDemands = DataService.getDemands()
            const day = selectedDate?.getDate()
            const month = selectedDate ? selectedDate.toLocaleString('pt-BR', { month: 'short' }).replace('.', '') : ""
            const dateString = selectedDate ? `${String(day).padStart(2, '0')} ${month}` : "Sem data"

            if (demand) {
                const updatedDemand: Demand = {
                    ...demand,
                    title,
                    type,
                    theme: title,
                    briefing,
                    caption,
                    day: unscheduled ? undefined : day,
                    date: unscheduled ? "Sem data" : dateString,
                    mediaUrl: mediaPreview || demand.mediaUrl
                }
                DataService.updateDemand(updatedDemand)
            } else {
                const newDemand: Demand = {
                    id: Math.random().toString(36).substr(2, 9),
                    client: selectedClientName,
                    title,
                    type,
                    status: null,
                    theme: title,
                    briefing,
                    caption,
                    date: unscheduled ? "Sem data" : dateString,
                    day: unscheduled ? undefined : day,
                    assignedTo: null,
                    mediaUrl: mediaPreview || undefined,
                    clientId: selectedClientId
                }
                await DataService.addDemand(newDemand)
            }

            setOpen(false)
            if (onSuccess) onSuccess()
        } catch (error) {
            console.error("Save error:", error)
            toast.error("Erro ao salvar conteúdo")
        } finally {
            setSaving(false)
        }
    }

    const handleGenerateCaption = async () => {
        if (!title) {
            toast.warning("Preencha o nome do conteúdo primeiro")
            return
        }

        setGeneratingCaption(true)
        try {
            const res = await fetch("/api/ai/generate-caption", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    type,
                    clientName: selectedClientName,
                    briefing,
                    currentCaption: caption,
                })
            })

            const data = await res.json()
            if (data.caption) {
                setCaption(data.caption)
                toast.success("Legenda gerada!", {
                    description: "Revise e ajuste conforme necessário."
                })
            } else {
                toast.error("Erro ao gerar", {
                    description: data.error || "Tente novamente."
                })
            }
        } catch (error) {
            toast.error("Erro de conexão", {
                description: "Verifique se a API está configurada."
            })
        } finally {
            setGeneratingCaption(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {children ? (
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>
            ) : !open ? (
                <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25">
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Conteúdo
                    </Button>
                </DialogTrigger>
            ) : null}
            <DialogContent className="bg-[#121214] border-white/10 text-white sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {demand ? "Editar Conteúdo" : (unscheduled ? "Novo Conteúdo Extra" : "Novo Conteúdo")}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nome do Conteúdo</Label>
                            <Input
                                placeholder="Ex: Reels Lançamento"
                                className="bg-zinc-900 border-white/10"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Formato</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger className="bg-zinc-900 border-white/10 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-white/10 text-white border-white/10">
                                    {SERVICE_TYPES.map((service) => (
                                        <SelectItem key={service.value} value={service.value}>
                                            <div className="flex items-center gap-2">
                                                <div className={`h-2 w-2 rounded-full ${service.dotClass}`} />
                                                {service.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {!unscheduled && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2 relative">
                                <Label>Data de Publicação</Label>
                                <div className="relative">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal bg-zinc-900 border-white/10 hover:bg-zinc-800",
                                            !selectedDate && "text-muted-foreground"
                                        )}
                                        onClick={() => setShowCalendar(!showCalendar)}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                                    </Button>

                                    {showCalendar && (
                                        <div className="absolute top-full left-0 z-50 mt-2 p-2 bg-zinc-950 border border-white/10 rounded-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                                            <Calendar
                                                mode="single"
                                                selected={selectedDate}
                                                onSelect={(d) => {
                                                    setSelectedDate(d)
                                                    setShowCalendar(false)
                                                }}
                                                initialFocus
                                                locale={ptBR}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Cliente</Label>
                                {initialClients && !initialClientId ? (
                                    <Select
                                        value={selectedClientId}
                                        onValueChange={(val) => {
                                            setSelectedClientId(val)
                                            const client = initialClients.find(c => c.id === val)
                                            if (client) setSelectedClientName(client.name)
                                        }}
                                    >
                                        <SelectTrigger className="bg-zinc-900 border-white/10 text-white">
                                            <SelectValue placeholder="Selecione um cliente" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                            {initialClients.map((client) => (
                                                <SelectItem key={client.id} value={client.id}>
                                                    {client.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Input
                                        value={selectedClientName}
                                        disabled
                                        className="bg-zinc-900/50 border-white/5 text-zinc-500"
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Mídia (Foto, Card, Arquivo)</Label>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-4">
                                <Label
                                    htmlFor="media-upload"
                                    className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-white/10 rounded-lg cursor-pointer bg-zinc-900 hover:bg-zinc-800 transition-colors"
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-6 h-6 mb-2 text-zinc-500" />
                                        <p className="text-xs text-zinc-500">Clique para enviar ou arraste</p>
                                    </div>
                                    <input
                                        id="media-upload"
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        accept="image/*,application/pdf,video/*"
                                    />
                                </Label>
                            </div>

                            {resolvedMediaUrl && (
                                <div className="relative w-full h-40 rounded-lg overflow-hidden border border-white/10 bg-zinc-900 group">
                                    {(resolvedMediaUrl.startsWith("data:image") || resolvedMediaUrl.startsWith("idb:")) ? (
                                        <img src={resolvedMediaUrl} alt="Preview" className="w-full h-full object-cover" />
                                    ) : resolvedMediaUrl.startsWith("data:video") ? (
                                        <video src={resolvedMediaUrl} className="w-full h-full object-cover" autoPlay muted loop />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500">
                                            {mediaFile?.type.includes("pdf") ? (
                                                <FileIcon className="w-12 h-12 mb-2" />
                                            ) : (
                                                <ImageIcon className="w-12 h-12 mb-2" />
                                            )}
                                            <p className="text-[10px]">{mediaFile?.name || "Arquivo anexado"}</p>
                                        </div>
                                    )}
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => {
                                            setMediaFile(null)
                                            setMediaPreview(null)
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Legenda</Label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 text-[11px] gap-1.5 text-primary hover:text-primary hover:bg-primary/10 font-medium"
                                onClick={handleGenerateCaption}
                                disabled={generatingCaption}
                            >
                                {generatingCaption ? (
                                    <>
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        Gerando...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-3 w-3" />
                                        Gerar com IA
                                    </>
                                )}
                            </Button>
                        </div>
                        <Textarea
                            placeholder="Escreva a legenda do post..."
                            className="bg-zinc-900 border-white/10 min-h-[100px]"
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Briefing / Observações</Label>
                        <Textarea
                            placeholder="Instruções para o time criativo..."
                            className="bg-zinc-900 border-white/10 min-h-[80px]"
                            value={briefing}
                            onChange={(e) => setBriefing(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-2 flex-col sm:flex-row">
                    <div className="flex-1">
                        {demand && (
                            <Button
                                variant="ghost"
                                className="text-red-500 hover:text-red-400 hover:bg-red-500/10 h-9 px-3 w-full sm:w-auto"
                                onClick={handleDelete}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button variant="ghost" onClick={() => setOpen(false)} className="flex-1 sm:flex-none">Cancelar</Button>
                        <Button
                            onClick={handleSave}
                            disabled={!title || (!unscheduled && !selectedDate) || !selectedClientId || saving}
                            className="bg-primary hover:bg-primary/90 text-white flex-1 sm:flex-none"
                        >
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {demand ? "Salvar Alterações" : "Criar Conteúdo"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
