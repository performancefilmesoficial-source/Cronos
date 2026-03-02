import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    try {
        const { clientName, pdfBase64 } = await request.json();

        if (!clientName || !pdfBase64) {
            return NextResponse.json({ error: 'Nome do cliente e dados do PDF são obrigatórios' }, { status: 400 });
        }

        const baseDir = process.cwd();
        const brandingPath = path.join(baseDir, 'clientes', clientName, 'Branding');

        // Garantir que a pasta existe (embora já devesse existir pelo botão de Nova Pasta)
        if (!fs.existsSync(brandingPath)) {
            fs.mkdirSync(brandingPath, { recursive: true });
        }

        const fileName = `Paleta_Cores_${clientName.replace(/\s+/g, '_')}.pdf`;
        const filePath = path.join(brandingPath, fileName);

        // Remover o prefixo data:application/pdf;base64, se houver
        const base64Data = pdfBase64.replace(/^data:application\/pdf;base64,/, "");

        fs.writeFileSync(filePath, base64Data, 'base64');

        return NextResponse.json({
            success: true,
            message: `PDF salvo com sucesso em: ${filePath}`,
            path: filePath
        });

    } catch (error: any) {
        console.error('Erro ao salvar PDF:', error);
        return NextResponse.json({ error: 'Erro ao salvar o arquivo PDF localmente', details: error.message }, { status: 500 });
    }
}
