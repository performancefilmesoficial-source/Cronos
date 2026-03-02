// Tipos de serviço com cores para o calendário do cliente
export const SERVICE_TYPES = [
    { value: "Reels Humano", label: "Reels Humano", color: "#3B82F6", bgClass: "bg-blue-500/15", borderClass: "border-blue-500/30", textClass: "text-blue-400", dotClass: "bg-blue-500" },
    { value: "Reels Aleatório", label: "Reels Aleatório", color: "#22C55E", bgClass: "bg-emerald-500/15", borderClass: "border-emerald-500/30", textClass: "text-emerald-400", dotClass: "bg-emerald-500" },
    { value: "Card", label: "Card", color: "#EAB308", bgClass: "bg-yellow-500/15", borderClass: "border-yellow-500/30", textClass: "text-yellow-400", dotClass: "bg-yellow-500" },
    { value: "Gravação", label: "Gravação", color: "#EF4444", bgClass: "bg-red-500/15", borderClass: "border-red-500/30", textClass: "text-red-400", dotClass: "bg-red-500" },
    { value: "Stories", label: "Stories", color: "#A855F7", bgClass: "bg-purple-500/15", borderClass: "border-purple-500/30", textClass: "text-purple-400", dotClass: "bg-purple-500" },
] as const

export type ServiceType = typeof SERVICE_TYPES[number]["value"]

export function getServiceColor(type: string) {
    return SERVICE_TYPES.find(s => s.value === type) || SERVICE_TYPES[0]
}
