import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) return NextResponse.json({ error: "E-mail necessário" }, { status: 400 });

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return NextResponse.json({ status: "not_found" });
        }

        if (!(user as any).active) {
            return NextResponse.json({ status: "pending_approval" });
        }

        if (!user.password) {
            return NextResponse.json({ status: "no_password" });
        }

        return NextResponse.json({ status: "has_password" });

    } catch {
        return NextResponse.json({ error: "Erro ao verificar status do usuário" }, { status: 500 });
    }
}
