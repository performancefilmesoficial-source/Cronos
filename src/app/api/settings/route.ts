import { NextResponse } from "next/server";
import { UserRepository } from "@/repositories/user-repository";
import { auth } from "@/lib/auth";

export async function GET() {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const users = await UserRepository.getAll();
    const settings = await UserRepository.getSettings();
    return NextResponse.json({ users, settings });
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        const { action, id, ...payload } = data;

        if (action === 'update_settings') {
            await UserRepository.updateSettings(payload);
            return NextResponse.json({ success: true });
        }

        if (id) {
            await UserRepository.update(id, payload);
        } else {
            await UserRepository.create(payload);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await auth();
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        const id = data.id;

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        await UserRepository.delete(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
