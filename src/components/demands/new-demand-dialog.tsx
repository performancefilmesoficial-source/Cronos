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
import { Plus, Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { SERVICE_TYPES } from "@/lib/services"

interface NewDemandDialogProps {
    children?: React.ReactNode
    clientId: string
    clientName: string
    onSuccess?: () => void
    /** Se true, cria o conteúdo sem data (vai para "Conteúdos Extras") */
    unscheduled?: boolean
    /** Se passado, o modal funciona em modo de edição */
    demand?: Demand
    /** Controle externo de abertura */
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function NewDemandDialog({ children, clientId, clientName, onSuccess, unscheduled, demand, open: controlledOpen, onOpenChange: setControlledOpen }: NewDemandDialogProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
    const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen
    const setOpen = setControlledOpen || setUncontrolledOpen

    const [saving, setSaving] = useState(false)
    const [generatingCaption, setGeneratingCaption] = useState(false)

    // Form State
    const [title, setTitle] = useState(demand?.title || "")
    const [type, setType] = useState<string>(demand?.type || SERVICE_TYPES[0].value)
    const [caption, setCaption] = useState(demand?.caption || "")
    const [briefing, setBriefing] = useState(demand?.briefing || "")

    // Parse date for editing
    const initialDate = demand?.day ? `${demand.day}` : ""
    const [date, setDate] = useState(initialDate)

    // Reset external state when opening editing
    useEffect(() => {
        if (open && demand) {
            setTitle(demand.title)
            setType(demand.type)
            setCaption(demand.caption || "")
            setBriefing(demand.briefing || "")
            setDate(demand.day ? `${demand.day}` : "")
        }
    }, [open, demand])

    const handleSave = async () => {
        if (!title) return
        if (!unscheduled && !date && !demand) return

        setSaving(true)

        const existingDemands = DataService.getDemands()

        const parsedDay = date ? parseInt(date.split(" ")[0]) : undefined

        if (demand) {
            // Edit mode
            const updatedDemand: Demand = {
                ...demand,
                title,
                type,
                theme: title,
                briefing,
                caption,
                day: parsedDay && !isNaN(parsedDay) ? parsedDay : undefined,
                date: parsedDay && !isNaN(parsedDay) ? `${String(parsedDay).padStart(2, '0')} ${demand.date.split(" ")[1] || ""}`.trim() : "Sem data",
            }
            if (unscheduled) {
                updatedDemand.day = undefined
                updatedDemand.date = "Sem data"
            }
            DataService.updateDemand(updatedDemand)
        } else {
            // Create mode
            const newDemand: Demand = {
                id: Math.random().toString(36).substr(2, 9),
                client: clientName,
                title,
                type,
                status: null,
                theme: title,
                briefing,
                caption,
                date: date || "Sem data",
                day: parsedDay && !isNaN(parsedDay) ? parsedDay : undefined,
                assignedTo: null
            }
            await DataService.saveDemands([...existingDemands, newDemand])
        }

        setSaving(false)
        setOpen(false)

        if (!demand) {
            setTitle("")
            setCaption("")
            setBriefing("")
            setDate("")
        }

        if (onSuccess) onSuccess()
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
                    clientName,
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
        } catch {
            toast.error("Erro de conexão", {
                description: "Verifique se a API está configurada."
            })
        } finally {
            setGeneratingCaption(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25">
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Conteúdo
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="bg-[#121214] border-white/10 text-white sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>
                        {demand ? "Editar Conteúdo" : (unscheduled ? "Novo Conteúdo Extra" : "Novo Conteúdo")}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
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
                                <SelectTrigger className="bg-zinc-900 border-white/10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-white/10 text-white">
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
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Data de Publicação</Label>
                                <Input
                                    placeholder="Ex: 12 Mar"
                                    className="bg-zinc-900 border-white/10"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Cliente</Label>
                                <Input
                                    value={clientName}
                                    disabled
                                    className="bg-zinc-900/50 border-white/5 text-zinc-500"
                                />
                            </div>
                        </div>
                    )}

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

                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button
                        onClick={handleSave}
                        disabled={!title || (!unscheduled && !date) || saving}
                        className="bg-primary hover:bg-primary/90 text-white"
                    >
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Conteúdo
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
