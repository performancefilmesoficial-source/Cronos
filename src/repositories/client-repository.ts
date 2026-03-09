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
                driveUrl: data.driveUrl,
                branding: data.branding || {},
                managerId: data.managerId,
            }
        });
    }

    static async update(id: string, data: any) {
        return await prisma.client.update({
            where: { id },
            data: {
                name: data.name,
                driveUrl: data.driveUrl,
                branding: data.branding,
                status: data.status,
            }
        });
    }

    static async delete(id: string) {
        return await prisma.client.delete({
            where: { id }
        });
    }
}
