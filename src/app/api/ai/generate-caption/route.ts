import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { title, type, clientName, briefing, currentCaption } = await request.json();

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            // Fallback: gera legenda com templates locais
            const templates = [
                `🔥 ${title}\n\n${briefing || "Conteúdo exclusivo preparado especialmente para você!"}\n\n✨ ${type === "Reels" ? "Deslize para ver mais ➡️" : "Curtiu? Salva pra depois!"}\n\n#${clientName.replace(/\s+/g, '')} #conteúdo #marketing #social`,
                `💡 ${title}\n\nVocê sabia? ${briefing || "Conteúdo que transforma a forma como você vê o mundo."}\n\n🚀 ${type === "Stories" ? "Arraste para cima!" : "Deixe seu comentário!"}\n\n#${clientName.replace(/\s+/g, '')} #digital #tendência`,
                `📲 ${title}\n\n${briefing || "Prepare-se para se surpreender com o que preparamos!"}\n\n💬 O que achou? Comenta aqui!\n\n#${clientName.replace(/\s+/g, '')} #criatividade #${type.toLowerCase().replace(/\s+/g, '')}`,
            ];

            return NextResponse.json({
                caption: templates[Math.floor(Math.random() * templates.length)],
                source: "template"
            });
        }

        // Prompt para o Gemini — prioriza o texto do campo legenda
        const hasUserText = currentCaption && currentCaption.trim().length > 0

        const prompt = hasUserText
            ? `Crie uma legenda profissional e envolvente para uma postagem de rede social BASEADA na seguinte ideia/frase do usuário:

"${currentCaption}"

Contexto adicional:
- Cliente: ${clientName}
- Formato: ${type}
${title ? `- Título do conteúdo: ${title}` : ''}
${briefing ? `- Briefing: ${briefing}` : ''}

Use a frase do usuário como base principal e expanda ela numa legenda completa.
A legenda deve:
- Ser em português brasileiro
- Manter a essência da frase original
- Ter emojis relevantes
- Incluir call-to-action
- Ter hashtags relacionadas
- Ser envolvente e profissional

Responda APENAS com a legenda, sem explicações.`
            : `Crie uma legenda criativa e envolvente para uma postagem de rede social:
- Cliente: ${clientName}
- Título/Tema: ${title}
- Formato: ${type}
${briefing ? `- Briefing: ${briefing}` : ''}

A legenda deve:
- Ser em português brasileiro
- Ter emojis relevantes
- Incluir call-to-action
- Ter hashtags relacionadas
- Ser envolvente e profissional

Responda APENAS com a legenda, sem explicações.`;

        // Tenta modelos em ordem de preferência
        const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-8b'];

        for (const model of models) {
            try {
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }],
                            generationConfig: { temperature: 0.8, maxOutputTokens: 500 }
                        }),
                    }
                );

                const data = await response.json();

                // Se quota excedida, tenta próximo modelo
                if (data?.error?.code === 429 || data?.error?.message?.includes('Quota exceeded')) {
                    console.warn(`Quota excedida para ${model}, tentando próximo...`);
                    continue;
                }

                const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (generatedText) {
                    return NextResponse.json({ caption: generatedText.trim(), source: model });
                }
            } catch (e) {
                console.warn(`Erro com ${model}:`, e);
                continue;
            }
        }

        // Fallback: se todos falharem, usa template
        const templates = [
            `🔥 ${title}\n\n${briefing || "Conteúdo exclusivo!"}\n\n✨ Curtiu? Salva pra depois!\n\n#${clientName.replace(/\s+/g, '')} #marketing #social`,
            `💡 ${title}\n\n${briefing || "Conteúdo que transforma."}\n\n🚀 Deixe seu comentário!\n\n#${clientName.replace(/\s+/g, '')} #digital #tendência`,
        ];
        return NextResponse.json({
            caption: templates[Math.floor(Math.random() * templates.length)],
            source: "template-fallback"
        });

    } catch (error: any) {
        console.error('Erro ao gerar legenda:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
