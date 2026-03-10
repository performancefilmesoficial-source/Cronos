import prisma from "@/lib/prisma/client";

export class ClientRepository {
    static async getAll() {
        return await prisma.client.findMany({
            include: {
                manager: true,
                _count: {
                    select: { demands: true }
                }
            },
            orderBy: { name: 'asc' }
        });
    }

    static async getById(id: string) {
        return await prisma.client.findUnique({
            where: { id },
            include: {
                demands: {
                    orderBy: { date: 'desc' }
                },
                transactions: true,
                manager: true
            }
        });
    }

    static async create(data: any) {
        return await prisma.client.create({
            data: {
                name: data.name,
                handle: data.handle,
                logo: data.logo,
                accentColor: data.accentColor,
                primaryColor: data.primaryColor,
                secondaryColor: data.secondaryColor,
                industry: data.industry,
                activeContract: data.activeContract ?? true,
                status: data.status || "Ativo",
                managerId: data.managerId,
                notes: data.notes,
                branding: data.branding || {},
                driveUrl: data.driveUrl,
            }
        });
    }

    static async update(id: string, data: any) {
        return await prisma.client.update({
            where: { id },
            data: {
                name: data.name,
                handle: data.handle,
                logo: data.logo,
                accentColor: data.accentColor,
                primaryColor: data.primaryColor,
                secondaryColor: data.secondaryColor,
                industry: data.industry,
                activeContract: data.activeContract,
                status: data.status,
                managerId: data.managerId,
                notes: data.notes,
                branding: data.branding,
                driveUrl: data.driveUrl,
            }
        });
    }

    static async delete(id: string) {
        return await prisma.client.delete({
            where: { id }
        });
    }
}
