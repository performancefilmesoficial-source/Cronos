import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { auth } from "@/lib/auth";

export async function GET() {
    try {
        const session = await auth();
        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const users = await prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                whatsapp: true,
                role: true,
                active: true,
                createdAt: true,
            }
        });

        return NextResponse.json(users);
    } catch {
        return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const { id, active, role } = await req.json();

        if (!id) return NextResponse.json({ error: "ID necessário" }, { status: 400 });

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                active: active !== undefined ? active : undefined,
                role: role !== undefined ? role : undefined
            }
        });

        return NextResponse.json(updatedUser);
    } catch {
        return NextResponse.json({ error: "Erro ao atualizar usuário" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await auth();
        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const { id } = await req.json();

        if (!id) return NextResponse.json({ error: "ID necessário" }, { status: 400 });

        await prisma.user.delete({ where: { id } });

        return NextResponse.json({ message: "Usuário removido" });
    } catch {
        return NextResponse.json({ error: "Erro ao remover usuário" }, { status: 500 });
    }
}
