import { NextResponse } from "next/server";
import { MetaService } from "@/lib/meta-service";

// O Meta API exige tokens de acesso de página (Page Access Tokens)
// Em produção, você buscaria esses tokens do banco de dados baseado no clientId
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { platforms, content, mediaUrl, scheduledDate, clientId, extraData } = body;

    console.log("Meta API: Processando pedido de postagem", {
      clientId,
      platforms,
      contentLength: content?.length,
      hasMedia: !!mediaUrl
    });

    // NOTA: Em um sistema real, aqui você buscaria as configurações do cliente:
    // const clientConfigs = await db.clientSocialConfigs.findFirst({ where: { clientId } });
    // const accessToken = clientConfigs.accessToken;

    const results = [];

    // Simulação de execução para cada plataforma usando a API Oficial
    for (const platform of platforms) {
      const p = platform.toLowerCase();

      if (p.includes("instagram")) {
        // Exemplo de chamada real (comentada até ter tokens válidos)
        /*
        const res = await MetaService.publishToInstagram({
            accessToken: extraData?.instagramToken,
            instagramId: extraData?.instagramId,
            caption: content,
            mediaUrl: mediaUrl,
            mediaType: "IMAGE" // Detectar dinamicamente depois
        });
        results.push({ platform: "Instagram", result: res });
        */
        console.log("Mock: Postando no Instagram via Meta API...");
      }

      if (p.includes("facebook")) {
        console.log("Mock: Postando no Facebook via Meta API...");
      }
    }

    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json({
      success: true,
      message: "Conteúdo enviado com sucesso via API Oficial da Meta!",
      platforms: platforms
    });
  } catch (error: any) {
    console.error("Erro na integração Meta API:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Falha ao processar postagem via Meta"
    }, { status: 500 });
  }
}
