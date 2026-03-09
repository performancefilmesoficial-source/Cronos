import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";

export async function POST(req: Request) {
    try {
        const { name, email, whatsapp } = await req.json();

        // Validação simples
        if (!name || !email) {
            return NextResponse.json(
                { error: "Nome e e-mail são obrigatórios" },
                { status: 400 }
            );
        }

        const userExists = await prisma.user.findUnique({
            where: { email },
        });

        if (userExists) {
            return NextResponse.json(
                { error: "Este e-mail já está cadastrado" },
                { status: 400 }
            );
        }

        const user = await prisma.user.create({
            data: {
                name,
                email,
                whatsapp,
                role: "CLIENT",
            },
        });

        return NextResponse.json({
            message: "Cadastro solicitado com sucesso",
            userId: user.id
        }, { status: 201 });

    } catch (error) {
        console.error("Erro no registro:", error);
        return NextResponse.json(
            { error: "Erro interno no servidor" },
            { status: 500 }
        );
    }
}
