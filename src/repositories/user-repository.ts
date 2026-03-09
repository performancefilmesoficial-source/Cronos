import prisma from "@/lib/prisma/client";
import { Role } from "@prisma/client";

export class UserRepository {
    static async getAll() {
        return await prisma.user.findMany({
            orderBy: { name: 'asc' }
        });
    }

    static async getById(id: string) {
        return await prisma.user.findUnique({
            where: { id }
        });
    }

    static async create(data: any) {
        return await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                whatsapp: data.whatsapp,
                role: data.role.toUpperCase() as Role,
                password: data.password || null, // Will be handled by auth
            }
        });
    }

    static async update(id: string, data: any) {
        return await prisma.user.update({
            where: { id },
            data: {
                name: data.name,
                email: data.email,
                whatsapp: data.whatsapp,
                role: data.role.toUpperCase() as Role,
                image: data.avatar || undefined,
            }
        });
    }

    static async delete(id: string) {
        return await prisma.user.delete({
            where: { id }
        });
    }

    static async getSettings() {
        return await prisma.systemSettings.findUnique({
            where: { id: 'singleton' }
        });
    }

    static async updateSettings(data: any) {
        return await prisma.systemSettings.update({
            where: { id: 'singleton' },
            data: {
                whatsappEngine: data.whatsapp_engine.toUpperCase() || 'META',
                notificationsEnabled: data.notifications_enabled,
                metaToken: data.meta_token,
                metaPhoneId: data.meta_phone_id,
                metaRecipientId: data.meta_recipient_id,
                evolutionToken: data.whatsapp_token,
                evolutionUrl: data.whatsapp_api_url,
                evolutionGroupId: data.whatsapp_group_id,
            }
        });
    }
}
