"use client"

import { useState } from "react"
import { Upload, FileJson, Check, AlertCircle, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DataService, Demand, User, DemandStatus } from "@/lib/data"

// Types based on Trello JSON structure
interface TrelloJson {
    name: string
    desc: string
    lists: { id: string, name: string, closed: boolean }[]
    cards: {
        id: string
        name: string
        desc: string
        idList: string
        idLabels: string[]
        due: string | null
        idMembers: string[]
        labels: { id: string, name: string, color: string }[]
        cover: { idAttachment: string | null, color: string | null } | null
    }[]
    members: {
        id: string
        fullName: string
        username: string
        avatarUrl?: string
        initials: string
    }[]
}

interface ImportSummary {
    totalCards: number
    listsFound: string[]
    membersFound: number
    labelsFound: string[]
}

export function TrelloImport() {
    const [file, setFile] = useState<File | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [isImporting, setIsImporting] = useState(false)
    const [summary, setSummary] = useState<ImportSummary | null>(null)
    const [parsedData, setParsedData] = useState<TrelloJson | null>(null)
    const [importProgress, setImportProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const [selectedClient, setSelectedClient] = useState("")

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0]
        if (selected) {
            setFile(selected)
            analyzeFile(selected)
        }
    }

    const analyzeFile = async (file: File) => {
        setIsAnalyzing(true)
        setError(null)
        setSummary(null)
        setSuccess(false)
        setImportProgress(0)

        try {
            const text = await file.text()
            const data: TrelloJson = JSON.parse(text)

            // Basic validation
            if (!data.cards || !data.lists || !data.members) {
                throw new Error("Formato de arquivo inválido. Certifique-se de que é um JSON de exportação do Trello.")
            }

            setParsedData(data)
            setSelectedClient(data.name || "Novo Cliente") // Default to board name
            setSummary({
                totalCards: data.cards.length,
                listsFound: data.lists.filter(l => !l.closed).map(l => l.name),
                membersFound: data.members.length,
                labelsFound: Array.from(new Set(data.cards.flatMap(c => c.labels.map(l => l.name || l.color))))
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao ler o arquivo")
        } finally {
            setIsAnalyzing(false)
        }
    }

    const mapStatus = (listName: string): DemandStatus => {
        const lower = listName.toLowerCase()
        if (lower.includes("aprovado") || lower.includes("pronto") || lower.includes("concluído")) return "Aprovado"
        if (lower.includes("ajuste") || lower.includes("alteração")) return "Aguardando ajuste"
        if (lower.includes("aprovação") || lower.includes("validar")) return "Aguardando aprovação"
        return "Em andamento"
    }

    const mapType = (statusText: string, labels: string[]): string => {
        const combined = [...labels, statusText].map(s => s.toLowerCase()).join(" ")

        if (combined.includes("reels")) return "Reels"
        if (combined.includes("carrossel")) return "Carrossel"
        if (combined.includes("stories")) return "Stories"
        if (combined.includes("youtube") || combined.includes("video")) return "Youtube"
        if (combined.includes("motion")) return "Motion"
        return "Feed" // Default
    }

    const parseDateFromList = (listName: string): Date | null => {
        // Formats: "JANEIRO.26", "FEV 2026", "MARÇO/26"
        const clean = listName.toLowerCase().trim()

        const months: { [key: string]: number } = {
            "janeiro": 0, "jan": 0,
            "fevereiro": 1, "fev": 1,
            "março": 2, "marco": 2, "mar": 2,
            "abril": 3, "abr": 3,
            "maio": 4, "mai": 4,
            "junho": 5, "jun": 5,
            "julho": 6, "jul": 6,
            "agosto": 7, "ago": 7,
            "setembro": 8, "set": 8,
            "outubro": 9, "out": 9,
            "novembro": 10, "nov": 10,
            "dezembro": 11, "dez": 11
        }

        // Try to find month name
        let monthIndex = -1
        for (const [month, index] of Object.entries(months)) {
            if (clean.includes(month)) {
                monthIndex = index
                break
            }
        }

        if (monthIndex === -1) return null

        // Try to find year (2026 or 26)
        let year = new Date().getFullYear()
        const yearMatch = clean.match(/20\d{2}|\.\d{2}|\/\d{2}/) // Matches 2026, .26, /26
        if (yearMatch) {
            const y = yearMatch[0].replace(/[\.\/]/, "")
            if (y.length === 2) year = 2000 + parseInt(y)
            else year = parseInt(y)
        }

        const date = new Date(year, monthIndex, 1) // Default to 1st of month
        return date
    }

    const handleImport = async () => {
        if (!parsedData || !selectedClient) return

        setIsImporting(true)
        setImportProgress(10)

        try {
            // 1. Merge Members
            const currentUsers = DataService.getUsers()
            const existingEmails = new Set(currentUsers.map(u => u.email))
            const newUsers: User[] = []

            // Map Trello member IDs to App User IDs
            const memberIdMap = new Map<string, string>()

            parsedData.members.forEach(m => {
                const existing = currentUsers.find(u => u.name.toLowerCase() === m.fullName.toLowerCase())

                if (existing) {
                    memberIdMap.set(m.id, existing.id)
                } else {
                    // Create new user
                    const newUser: User = {
                        id: crypto.randomUUID(),
                        name: m.fullName,
                        email: `${m.username}@trello-import.com`, // Placeholder email
                        whatsapp: "",
                        role: "editor", // Default role
                        avatar: m.avatarUrl || null,
                        createdAt: new Date().toISOString()
                    }
                    newUsers.push(newUser)
                    memberIdMap.set(m.id, newUser.id)
                }
            })

            // Save new users
            if (newUsers.length > 0) {
                DataService.saveUsers([...currentUsers, ...newUsers])
            }

            setImportProgress(30)

            // 2. Map Cards to Demands
            const listMap = new Map(parsedData.lists.map(l => [l.id, l]))
            const listNameMap = new Map(parsedData.lists.map(l => [l.id, l.name]))

            const newDemands: Demand[] = parsedData.cards.map(card => {
                const listName = listNameMap.get(card.idList) || "Desconhecido"
                const labels = card.labels.map(l => l.name || l.color)

                // Date Priority:
                // 1. Card Due Date
                // 2. List Name (Month/Year)
                // 3. Fallback to "Sem data" (or today? user preferred specific logic)

                let dateStr = "Sem data"
                let dayNum = undefined

                if (card.due) {
                    const date = new Date(card.due)
                    dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
                    dayNum = date.getDate()
                } else {
                    // Start from List Name
                    const listDate = parseDateFromList(listName)
                    if (listDate) {
                        // Use 1st of month as fallback, or leave empty if we only want month? 
                        // App expects a "day" number usually. Let's unset dayNum if it's broad month.
                        // Or just set to 1.
                        // User request: "If no due date, check list name pattern".
                        dateStr = listDate.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }) // e.g. "fev/26"
                        // dayNum = undefined // Treat as general monthly task
                    }
                }

                return {
                    id: card.id,
                    client: selectedClient,
                    title: card.name,
                    type: mapType(card.name, labels),
                    status: mapStatus(listName),
                    theme: labels.join(", "),
                    briefing: card.desc,
                    assignedTo: card.idMembers.length > 0 ? memberIdMap.get(card.idMembers[0]) || null : null,
                    date: dateStr,
                    day: dayNum,
                    mediaUrl: card.cover?.idAttachment ? undefined : undefined
                }
            })

            setImportProgress(60)

            // 3. Save Demands
            // Verify valid status before saving? logic in mapStatus handles defaults.
            const currentDemands = DataService.getDemands()
            const mergedDemands = [...currentDemands, ...newDemands]

            // Remove duplicates if re-importing? 
            // Simple approach: ID check.
            const uniqueDemands = Array.from(new Map(mergedDemands.map(d => [d.id, d])).values())

            await DataService.saveDemands(uniqueDemands)

            setImportProgress(100)
            setSuccess(true)
            setFile(null)
            setParsedData(null)

            setTimeout(() => setSuccess(false), 5000)

        } catch (err) {
            setError("Falha na importação. Tente novamente.")
            console.error(err)
        } finally {
            setIsImporting(false)
        }
    }

    return (
        <Card className="bg-[#0A0A0A]/80 backdrop-blur-xl border-white/5">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileJson className="h-5 w-5 text-blue-500" />
                    Importar do Trello
                </CardTitle>
                <CardDescription>
                    Importe quadros completos exportando como JSON no Trello.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {!parsedData ? (
                    <div className="border-2 border-dashed border-white/10 rounded-xl p-8 transition-colors hover:border-blue-500/50 hover:bg-blue-500/5 text-center group cursor-pointer relative">
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={isAnalyzing}
                        />
                        <div className="flex flex-col items-center gap-2">
                            {isAnalyzing ? (
                                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                            ) : (
                                <Upload className="h-8 w-8 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                            )}
                            <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
                                {isAnalyzing ? "Analisando arquivo..." : "Clique ou arraste o arquivo JSON aqui"}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                    <FileJson className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm">{file?.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {(file!.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => {
                                setFile(null)
                                setParsedData(null)
                                setSummary(null)
                                setSelectedClient("")
                            }}>
                                Trocar
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Nome do Cliente para Importação</label>
                            <input
                                type="text"
                                value={selectedClient}
                                onChange={(e) => setSelectedClient(e.target.value)}
                                placeholder="Ex: Café Moriah"
                                className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>

                        {summary && (
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="p-3 bg-white/5 rounded-md">
                                    <span className="text-muted-foreground block text-xs">Cartões</span>
                                    <span className="font-bold text-lg">{summary.totalCards}</span>
                                </div>
                                <div className="p-3 bg-white/5 rounded-md">
                                    <span className="text-muted-foreground block text-xs">Membros</span>
                                    <span className="font-bold text-lg">{summary.membersFound}</span>
                                </div>
                                <div className="col-span-2 p-3 bg-white/5 rounded-md">
                                    <span className="text-muted-foreground block text-xs mb-1">Listas Encontradas</span>
                                    <div className="flex flex-wrap gap-1">
                                        {summary.listsFound.map(l => (
                                            <span key={l} className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">{l}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={handleImport}
                            disabled={isImporting || !selectedClient.trim()}
                        >
                            {isImporting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Importando...
                                </>
                            ) : (
                                <>
                                    Confirmar Importação
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </div>
                )}

                {isImporting && (
                    <div className="space-y-1">
                        <Progress value={importProgress} className="h-2" />
                        <p className="text-xs text-center text-muted-foreground">Processando dados...</p>
                    </div>
                )}

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Erro</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert className="border-green-500/50 bg-green-500/10 text-green-500">
                        <Check className="h-4 w-4" />
                        <AlertTitle>Sucesso!</AlertTitle>
                        <AlertDescription>Dados importados corretamente. Verifique o Dashboard.</AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    )
}
