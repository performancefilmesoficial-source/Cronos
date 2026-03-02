import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    try {
        const { clientName, fileName, fileBase64 } = await request.json();

        if (!clientName || !fileName || !fileBase64) {
            return NextResponse.json({ error: 'Dados incompletos para o upload' }, { status: 400 });
        }

        const baseDir = process.cwd();
        const brandingPath = path.join(baseDir, 'clientes', clientName, 'Branding');

        // Garantir que a pasta existe
        if (!fs.existsSync(brandingPath)) {
            fs.mkdirSync(brandingPath, { recursive: true });
        }

        const filePath = path.join(brandingPath, fileName);

        // Escrever o arquivo
        fs.writeFileSync(filePath, fileBase64, 'base64');

        return NextResponse.json({
            success: true,
            message: `Arquivo salvo com sucesso em: ${filePath}`,
            path: filePath
        });

    } catch (error: any) {
        console.error('Erro no upload de arquivo:', error);
        return NextResponse.json({ error: 'Erro ao salvar o arquivo localmente', details: error.message }, { status: 500 });
    }
}
