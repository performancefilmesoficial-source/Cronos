const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Limpando e inicializando sistema...');

    try {
        await prisma.comment.deleteMany();
        await prisma.demand.deleteMany();
        await prisma.transaction.deleteMany();
        await prisma.client.deleteMany();
        await prisma.user.deleteMany();
        await prisma.systemSettings.deleteMany();

        const hashedPassword = await bcrypt.hash('admin123', 10);

        await prisma.user.create({
            data: {
                name: 'Rafael Alves',
                email: 'admin@cronos.com.br',
                password: hashedPassword,
                role: 'ADMIN',
                active: true,
            },
        });

        await prisma.systemSettings.create({
            data: {
                id: 'singleton',
                whatsappEngine: 'META',
                notificationsEnabled: true,
            },
        });

        console.log('✅ Cronos Media Zerado e Pronto!');
        console.log('📧 Login: admin@cronos.com.br | 🔑 Senha: admin123');
    } catch (err) {
        console.error('❌ Erro no seed:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
