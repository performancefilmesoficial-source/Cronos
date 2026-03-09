import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { message, engine, settings } = await req.json();

        // Em uma auditoria real, NUNCA confiaríamos nos tokens vindos do 'settings' enviado pelo client.
        // Aqui vamos priorizar variáveis de ambiente se elas existirem.
        const metaToken = process.env.WHATSAPP_META_TOKEN || settings.meta_token;
        const phoneId = process.env.WHATSAPP_META_PHONE_ID || settings.meta_phone_id;
        const recipientId = process.env.WHATSAPP_META_RECIPIENT_ID || settings.meta_recipient_id;

        const evolutionToken = process.env.WHATSAPP_EVOLUTION_TOKEN || settings.whatsapp_token;
        const evolutionUrl = process.env.WHATSAPP_EVOLUTION_URL || settings.whatsapp_api_url;
        const groupId = process.env.WHATSAPP_EVOLUTION_GROUP_ID || settings.whatsapp_group_id;

        if (engine === "meta") {
            if (!metaToken || !phoneId || !recipientId) {
                return NextResponse.json({ success: false, error: "Meta settings missing on server" }, { status: 400 });
            }

            const url = `https://graph.facebook.com/v19.0/${phoneId}/messages`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${metaToken}`
                },
                body: JSON.stringify({
                    messaging_product: "whatsapp",
                    recipient_type: "individual",
                    to: recipientId,
                    type: "text",
                    text: { body: message }
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || "Meta API Error");
            }
        } else {
            if (!evolutionToken || !evolutionUrl || !groupId) {
                return NextResponse.json({ success: false, error: "Evolution settings missing on server" }, { status: 400 });
            }

            const body: any = {};
            if (evolutionUrl.includes("message/sendText")) {
                body.number = groupId.includes("@g.us") ? groupId : `${groupId}@g.us`;
                body.text = message;
            } else {
                body.number = groupId;
                body.text = message;
            }

            const response = await fetch(evolutionUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": evolutionToken,
                    "Authorization": `Bearer ${evolutionToken}`,
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                throw new Error(`Evolution API Error: ${response.status}`);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("WhatsApp Proxy Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
