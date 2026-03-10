import { NextResponse } from "next/server";
import { UserRepository } from "@/repositories/user-repository";
import { auth } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { clientName, fileName, fileBase64, customPath } = await req.json();

        const settings = await UserRepository.getSettings();
        const basePath = settings?.baseFolderPath || process.cwd();

        let targetDir;
        if (customPath) {
            // Se um caminho customizado for fornecido (absoluto ou relativo ao base)
            if (path.isAbsolute(customPath)) {
                targetDir = customPath;
            } else {
                targetDir = path.join(basePath, customPath);
            }
        } else if (clientName) {
            // Fallback para o comportamento padrão de cliente
            targetDir = path.join(basePath, clientName, "Branding");
        } else {
            return NextResponse.json({ error: "Nome do cliente ou caminho customizado é obrigatório" }, { status: 400 });
        }

        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        const filePath = path.join(targetDir, fileName);
        const buffer = Buffer.from(fileBase64, 'base64');

        fs.writeFileSync(filePath, buffer);

        return NextResponse.json({ success: true, path: filePath });
    } catch (error: any) {
        console.error("UPLOAD FILE ERROR:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
