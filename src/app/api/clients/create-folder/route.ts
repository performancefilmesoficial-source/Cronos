import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    try {
        const { clientName } = await request.json();

        if (!clientName) {
            return NextResponse.json({ error: 'Nome do cliente é obrigatório' }, { status: 400 });
        }

        // Caminho base: Raiz do projeto/clientes/Nome do Cliente/Branding
        const baseDir = process.cwd();
        const clientsDirPath = path.join(baseDir, 'clientes');
        const clientDirPath = path.join(clientsDirPath, clientName);
        const brandingDirPath = path.join(clientDirPath, 'Branding');

        // Cria as pastas recursivamente
        if (!fs.existsSync(brandingDirPath)) {
            fs.mkdirSync(brandingDirPath, { recursive: true });
            return NextResponse.json({
                success: true,
                message: `Pastas criadas com sucesso em: ${brandingDirPath}`,
                path: brandingDirPath
            });
        }

        return NextResponse.json({
            success: true,
            message: 'A pasta já existe.',
            path: brandingDirPath
        });

    } catch (error: any) {
        console.error('Erro ao criar pasta:', error);
        return NextResponse.json({ error: 'Erro interno ao criar pasta', details: error.message }, { status: 500 });
    }
}
