import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

export async function POST(request: Request) {
    try {
        const { clientName } = await request.json();

        if (!clientName) {
            return NextResponse.json({ error: 'Nome do cliente é obrigatório' }, { status: 400 });
        }

        const baseDir = process.cwd();
        const brandingDirPath = path.join(baseDir, 'clientes', clientName, 'Branding');

        if (!fs.existsSync(brandingDirPath)) {
            // Tenta abrir a pasta do cliente se Branding não existir
            const clientDirPath = path.join(baseDir, 'clientes', clientName);
            if (!fs.existsSync(clientDirPath)) {
                return NextResponse.json({
                    success: false,
                    error: 'Pasta do cliente não encontrada. Crie a pasta primeiro.'
                });
            }
            // Abre a pasta do cliente
            exec(`open "${clientDirPath}"`);
            return NextResponse.json({
                success: true,
                message: `Pasta do cliente aberta: ${clientDirPath}`,
                path: clientDirPath
            });
        }

        // Abre a pasta Branding no Finder
        exec(`open "${brandingDirPath}"`);

        return NextResponse.json({
            success: true,
            message: `Pasta Branding aberta: ${brandingDirPath}`,
            path: brandingDirPath
        });

    } catch (error: any) {
        console.error('Erro ao abrir pasta:', error);
        return NextResponse.json({ error: 'Erro interno', details: error.message }, { status: 500 });
    }
}
