import prisma from "@/lib/prisma/client";

export class DemandRepository {
    static async getAll() {
        return await prisma.demand.findMany({
            include: {
                client: true,
                assignedTo: true,
            },
            orderBy: {
                date: 'asc',
            },
        });
    }

    static async getById(id: string) {
        return await prisma.demand.findUnique({
            where: { id },
            include: {
                client: true,
                assignedTo: true,
                comments: {
                    orderBy: { createdAt: 'desc' }
                },
            },
        });
    }

    static async create(data: any) {
        return await prisma.demand.create({
            data: {
                title: data.title,
                type: data.type,
                status: data.status as any,
                theme: data.theme,
                briefing: data.briefing,
                caption: data.caption,
                date: new Date(data.date),
                clientId: data.clientId,
                assignedToId: data.assignedToId,
            },
        });
    }

    static async update(id: string, data: any) {
        return await prisma.demand.update({
            where: { id },
            data: {
                ...data,
                date: data.date ? new Date(data.date) : undefined,
            },
        });
    }

    static async delete(id: string) {
        return await prisma.demand.delete({
            where: { id },
        });
    }
}
