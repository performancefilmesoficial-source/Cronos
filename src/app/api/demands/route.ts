import { NextResponse } from "next/server";
import { DemandRepository } from "@/repositories/demand-repository";
import { auth } from "@/lib/auth";

export async function GET() {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const demands = await DemandRepository.getAll();
    return NextResponse.json(demands);
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const data = await req.json();

        if (data.id) {
            await DemandRepository.update(data.id, data);
        } else {
            await DemandRepository.create(data);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
