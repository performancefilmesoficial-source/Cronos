export type Competitor = {
    id: string
    name: string
    url: string
    type: 'site' | 'instagram' | 'tiktok' | 'youtube' | 'others'
}

export type BrandingFile = {
    id: string
    name: string
    url: string
    type: 'image' | 'video' | 'pdf' | 'doc'
    thumbnail?: string
}

export type Client = {
    id: string
    name: string
    handle: string
    logo: string
    accentColor: string
    primaryColor?: string
    secondaryColor?: string
    industry: string
    activeContract: boolean
    stats: {
        drafts: number
        adjustments: number
        approvals: number
        approved: number
    }
    brandingFiles?: BrandingFile[]
    competitors?: Competitor[]
    palette?: string[]
    credentials?: {
        platform: string
        login: string
        password?: string
    }[]
}

// O MOCK_CLIENTS foi removido para entregar o sistema zerado conforme solicitado.
