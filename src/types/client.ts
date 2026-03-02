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
}

export const MOCK_CLIENTS: Client[] = [
    {
        id: "1",
        name: "Performance Filmes",
        handle: "@performancefilmesoficial",
        logo: "https://github.com/shadcn.png",
        accentColor: "#EF4444",
        industry: "Agência",
        activeContract: true,
        stats: { drafts: 8, adjustments: 0, approvals: 0, approved: 0 }
    },
    {
        id: "2",
        name: "Nike",
        handle: "@nike",
        logo: "https://avatar.vercel.sh/nike",
        accentColor: "#000000",
        industry: "Esportes",
        activeContract: true,
        stats: { drafts: 3, adjustments: 2, approvals: 1, approved: 12 }
    },
    {
        id: "3",
        name: "Nubank",
        handle: "@nubank",
        logo: "https://avatar.vercel.sh/nubank",
        accentColor: "#820AD1",
        industry: "Financeiro",
        activeContract: true,
        stats: { drafts: 0, adjustments: 1, approvals: 4, approved: 45 }
    },
]
