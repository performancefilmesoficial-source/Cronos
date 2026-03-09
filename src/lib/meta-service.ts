/**
 * Meta API Helper Service (Facebook & Instagram Graph API)
 * For official publishing without expensive middleware.
 */

export interface MetaPostParams {
    accessToken: string;
    instagramId?: string;
    facebookPageId?: string;
    caption: string;
    mediaUrl: string;
    mediaType: "IMAGE" | "VIDEO" | "REELS";
}

export class MetaService {
    private static BASE_URL = "https://graph.facebook.com/v19.0";

    /**
     * Publishes a post to Instagram
     * Flow: 1. Create Media Container -> 2. Wait for completion -> 3. Publish Container
     */
    static async publishToInstagram(params: MetaPostParams) {
        if (!params.instagramId) throw new Error("Instagram Business Account ID is required");

        try {
            // 1. Create Media Container
            const containerRes = await fetch(`${this.BASE_URL}/${params.instagramId}/media`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    image_url: params.mediaType === "IMAGE" ? params.mediaUrl : undefined,
                    video_url: params.mediaType !== "IMAGE" ? params.mediaUrl : undefined,
                    caption: params.caption,
                    media_type: params.mediaType,
                    access_token: params.accessToken,
                }),
            });

            const containerData = await containerRes.json();
            if (!containerData.id) throw new Error(`Failed to create container: ${JSON.stringify(containerData)}`);

            const creationId = containerData.id;

            // 2. Wait for media processing (Simple poll for this example)
            // Real implementation would use webhooks or more robust polling
            await new Promise(r => setTimeout(r, 5000));

            // 3. Publish Media
            const publishRes = await fetch(`${this.BASE_URL}/${params.instagramId}/media_publish`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    creation_id: creationId,
                    access_token: params.accessToken,
                }),
            });

            const publishData = await publishRes.json();
            return { success: !!publishData.id, data: publishData };
        } catch (error) {
            console.error("MetaService Instagram Error:", error);
            throw error;
        }
    }

    /**
     * Publishes a post to Facebook Page
     */
    static async publishToFacebook(params: MetaPostParams) {
        if (!params.facebookPageId) throw new Error("Facebook Page ID is required");

        try {
            const endpoint = params.mediaType === "IMAGE" ? "photos" : "videos";
            const field = params.mediaType === "IMAGE" ? "url" : "file_url";

            const res = await fetch(`${this.BASE_URL}/${params.facebookPageId}/${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    [field]: params.mediaUrl,
                    message: params.caption,
                    access_token: params.accessToken,
                }),
            });

            const data = await res.json();
            return { success: !!data.id, data };
        } catch (error) {
            console.error("MetaService Facebook Error:", error);
            throw error;
        }
    }
}
