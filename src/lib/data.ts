export type UserRole = "ADMIN" | "EDITOR" | "SOCIAL_MEDIA" | "DESIGNER" | "MANAGER" | "FINANCIAL" | "CLIENT"

export interface User {
    id: string
    name: string
    email: string
    whatsapp: string
    role: UserRole
    avatar?: string | null
    active: boolean
    createdAt: string
}

export interface Comment {
    id: number | string
    user: string
    text: string
    time: string
    type: 'client' | 'internal'
}

export type DemandStatus = "Aprovado" | "Aguardando ajuste" | "Programado" | "Aguardando aprovação" | "Em andamento"

export interface Demand {
    id: string
    client: string
    title: string
    type: string
    status: DemandStatus | null
    theme?: string
    briefing?: string
    caption?: string
    mediaUrl?: string
    assignedTo?: string | null
    date: string
    day?: number
    comments?: Comment[]
    clientId?: string
}

// Proxy Service to smooth transition to real DB
let _users: User[] = []
let _settings: any = {
    whatsapp_engine: 'META',
    notifications_enabled: true
}

export const DataService = {
    // Clients
    getClients: async () => {
        const res = await fetch('/api/clients');
        return await res.json();
    },

    // Demands
    getDemands: () => {
        return [] as Demand[];
    },

    getDemandById: (id: string) => {
        return undefined as Demand | undefined;
    },

    addDemand: async (demand: Demand) => {
        await fetch('/api/demands', {
            method: 'POST',
            body: JSON.stringify(demand)
        });
        window.dispatchEvent(new Event("sf-data-change"));
    },

    updateDemand: async (demand: Demand) => {
        await fetch('/api/demands', {
            method: 'POST',
            body: JSON.stringify(demand)
        });
        window.dispatchEvent(new Event("sf-data-change"));
    },

    saveDemands: async (demands: Demand[]) => {
        // Mocked or partially implemented
    },

    // Users
    setUsers: (users: User[]) => {
        _users = users
        window.dispatchEvent(new Event("sf-data-change"));
    },

    getUsers: () => {
        return [..._users];
    },

    saveUsers: async (users: User[]) => {
        // In a real app this would call an API
        _users = users
        window.dispatchEvent(new Event("sf-data-change"));
    },

    // Settings
    getSettings: () => {
        return { ..._settings };
    },

    setSettings: (settings: any) => {
        _settings = settings
    },

    saveSettings: async (settings: any) => {
        await fetch('/api/settings', {
            method: 'POST',
            body: JSON.stringify({ action: 'update_settings', ...settings })
        });
    }
}
