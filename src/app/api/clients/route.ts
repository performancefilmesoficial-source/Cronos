import { NextResponse } from "next/server";
import { ClientRepository } from "@/repositories/client-repository";
import { auth } from "@/lib/auth";

export async function GET() {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const clients = await ClientRepository.getAll();
        return NextResponse.json(clients);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const data = await req.json();
        const { id, ...payload } = data;

        if (id && id.length > 10) { // Simple check if it's a real ID vs a temp cuid/math.random-ish
            const updated = await ClientRepository.update(id, payload);
            return NextResponse.json(updated);
        } else {
            const created = await ClientRepository.create(payload);
            return NextResponse.json(created);
        }
    } catch (error: any) {
        console.error("API CLIENTS ERROR:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await auth();
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        await ClientRepository.delete(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
