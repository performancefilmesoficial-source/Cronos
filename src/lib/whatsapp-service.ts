export const WhatsAppService = {
    async sendNotification(message: string) {
        if (typeof window === "undefined") return;

        console.log("Requesting WhatsApp Notification via Server Proxy...");

        try {
            // O servidor possui as chaves de API e a lógica de decisão.
            // Chamamos o roteiro seguro para processar a notificação.
            const response = await fetch("/api/notifications/whatsapp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message })
            });

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || "Failed to send notification");
            }

            console.log("WhatsApp notification handled by server proxy!");
        } catch (error) {
            console.error("Failed to send WhatsApp notification proxy:", error);
        }
    }
}
