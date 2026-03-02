"use client"

import { MediaDB } from "@/lib/media-db"

export type UserRole = "admin" | "editor" | "social_media" | "designer" | "manager" | "financial"
export type DemandStatus = "Em andamento" | "Aguardando aprovação" | "Aprovado" | "Aguardando ajuste" | null

export interface User {
    id: string
    name: string
    email: string
    whatsapp: string
    role: UserRole
    avatar?: string | null
    createdAt: string
}

export interface Demand {
    id: string
    client: string
    title: string
    type: string
    status: DemandStatus
    theme?: string
    briefing?: string
    caption?: string
    mediaUrl?: string
    assignedTo?: string | null
    date: string
    day?: number
    comments?: { id: number; user: string; text: string; time: string; type: "client" | "internal" }[]
}

// Keys for localStorage
const USERS_KEY = "sf-users"
const DEMANDS_KEY = "sf-demands"

// Initial Data
const INITIAL_DEMANDS: Demand[] = [
    { id: "1", day: 5, title: "Reels Lançamento Nike Air", client: "NIKE", type: "Reels", status: "Aprovado", theme: "Lançamento", briefing: "focar no tenis", date: "05 Fev", assignedTo: "Rafa" },
    { id: "2", day: 8, title: "Carrossel Dicas", client: "ADIDAS", type: "Carrossel", status: "Em andamento", theme: "Dicas de corrida", briefing: "usar cores da marca", date: "08 Fev", assignedTo: "Rafa" },
    { id: "3", day: 12, title: "Stories Quiz", client: "ADIDAS", type: "Stories", status: "Aguardando aprovação", theme: "Interativo", briefing: "perguntas sobre esportes", date: "12 Fev", assignedTo: null },
    { id: "4", day: 15, title: "Foto Lifestyle", client: "PUMA", type: "Feed", status: "Aprovado", theme: "Lifestyle", briefing: "foto externa", date: "15 Fev", assignedTo: "Ana" },
]

// In-memory cache to prevent read-after-write race conditions
let demandsCache: Demand[] | null = null

export const DataService = {
    getUsers: (): User[] => {
        if (typeof window === "undefined") return []
        const saved = localStorage.getItem(USERS_KEY)
        if (saved) return JSON.parse(saved)

        const initialUsers: User[] = [
            { id: "1", name: "Rafael Admin", email: "rafael@socialflow.com", whatsapp: "11999999999", role: "admin", createdAt: new Date().toISOString() },
            { id: "2", name: "Ana Editora", email: "ana@socialflow.com", whatsapp: "", role: "editor", createdAt: new Date().toISOString() },
            { id: "3", name: "Gabi Social", email: "gabi@socialflow.com", whatsapp: "", role: "social_media", createdAt: new Date().toISOString() }
        ]
        localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers))
        return initialUsers
    },

    saveUsers: (users: User[]) => {
        if (typeof window === "undefined") return
        try {
            localStorage.setItem(USERS_KEY, JSON.stringify(users))
            window.dispatchEvent(new Event("sf-data-change"))
        } catch (error) {
            console.error("User storage error:", error)
        }
    },

    getDemands: (): Demand[] => {
        if (typeof window === "undefined") return []

        // Return cache if available for instant consistency
        if (demandsCache) return demandsCache

        const saved = localStorage.getItem(DEMANDS_KEY)
        if (saved) {
            try {
                demandsCache = JSON.parse(saved)
                return demandsCache!
            } catch (e) {
                console.error("Failed to parse demands", e)
            }
        }

        demandsCache = INITIAL_DEMANDS
        // Don't save immediately on get to avoid side effects, just return initial
        return demandsCache
    },

    saveDemands: async (demands: Demand[]) => {
        if (typeof window === "undefined") return

        // 1. Synchronous Update (Optimistic)
        // Update cache immediately so next reads get the new data, even if persistence is pending
        demandsCache = demands
        // Dispatch event immediately so UI updates instantly
        window.dispatchEvent(new Event("sf-data-change"))

        // 2. Async Persistence (Fire and Forget logic)
        try {
            const demandsToSave = JSON.parse(JSON.stringify(demands)) as Demand[]
            const promises: Promise<void>[] = []

            for (const d of demandsToSave) {
                if (d.mediaUrl && d.mediaUrl.startsWith("data:")) {
                    const mediaId = `media_${d.id}`
                    promises.push(
                        MediaDB.saveMedia(mediaId, d.mediaUrl)
                            .then(() => { d.mediaUrl = `idb:${mediaId}` })
                            .catch(e => console.error("IDB Save Failed", e))
                    )
                }
            }

            // Wait for DB writes
            if (promises.length > 0) {
                await Promise.all(promises)
            }

            // Save to LocalStorage (with references or stripped)
            try {
                localStorage.setItem(DEMANDS_KEY, JSON.stringify(demandsToSave))
            } catch (lsError) {
                // If specific QuotaExceeded despite IDB ref (maybe long chat history?)
                // Fallback: Strip mediaUrl entirely for LS
                const stripped = demandsToSave.map(d => ({
                    ...d,
                    mediaUrl: d.mediaUrl?.startsWith("idb:") ? d.mediaUrl : undefined
                }))
                try {
                    localStorage.setItem(DEMANDS_KEY, JSON.stringify(stripped))
                } catch (e) {
                    console.error("Final fallback save failed", e)
                }
            }
        } catch (error) {
            console.error("Persistence failed silently:", error)
        }
    },

    updateDemand: (updatedDemand: Demand) => {
        // Use getDemands to ensure we have the cached version
        const demands = DataService.getDemands()

        // Update the array
        const newDemands = demands.map(d => d.id === updatedDemand.id ? updatedDemand : d)

        // Save (updates cache sync, persists async)
        DataService.saveDemands(newDemands)
    },

    getDemandById: (id: string): Demand | undefined => {
        const demands = DataService.getDemands()
        return demands.find(d => d.id === id)
    }
}

// Enable Cross-Tab Synchronization
if (typeof window !== "undefined") {
    window.addEventListener("storage", (event) => {
        if (event.key === DEMANDS_KEY && event.newValue) {
            try {
                // Update cache with data from the other tab
                demandsCache = JSON.parse(event.newValue)
                // Notify local components to re-render
                window.dispatchEvent(new Event("sf-data-change"))
            } catch (error) {
                console.error("Failed to sync data from other tab", error)
            }
        }
    })
}
