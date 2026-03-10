import { NextResponse } from "next/server";
import { UserRepository } from "@/repositories/user-repository";
import { auth } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { clientName } = await req.json();
        if (!clientName) return NextResponse.json({ error: "Nome do cliente é obrigatório" }, { status: 400 });

        const settings = await UserRepository.getSettings();
        const basePath = settings?.baseFolderPath || process.cwd(); // Fallback to current directory if not set

        // Normalize and check path
        const clientFolder = path.join(basePath, clientName);

        // Estrutura de subpastas padrão
        const subfolders = [
            "Branding",
            "Branding/Logos",
            "Branding/Manual",
            "Conteúdo",
            "Conteúdo/Arquivos",
            "Conteúdo/Imagens",
            "Conteúdo/Videos",
            "Contratos"
        ];

        if (!fs.existsSync(clientFolder)) {
            fs.mkdirSync(clientFolder, { recursive: true });
        }

        for (const sub of subfolders) {
            const subPath = path.join(clientFolder, sub);
            if (!fs.existsSync(subPath)) {
                fs.mkdirSync(subPath, { recursive: true });
            }
        }

        return NextResponse.json({ success: true, path: clientFolder });
    } catch (error: any) {
        console.error("CREATE FOLDER ERROR:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
