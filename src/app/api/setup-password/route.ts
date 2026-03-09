import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "E-mail e senha são necessários" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
        }

        // Só permite criar senha se ela ainda estiver vazia/nula
        if (user.password) {
            return NextResponse.json({ error: "Este usuário já possui uma senha definida" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        });

        return NextResponse.json({ message: "Senha definida com sucesso!" }, { status: 200 });

    } catch {
        return NextResponse.json({ error: "Erro ao configurar senha" }, { status: 500 });
    }
}
