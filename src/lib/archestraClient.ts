const DEFAULT_ARCHESTRA_BASE_URL = "http://localhost:9000";
const DEFAULT_CHAT_MODEL = "gemini-2.5-flash";
const REQUEST_TIMEOUT_MS = 20_000;

function normalizeBaseUrl(baseUrl: string) {
    return baseUrl.replace(/\/$/, "");
}

type ArchestraConfig = {
    baseUrl: string;
    apiKey: string;
    agentId: string;
    model: string;
};

function getArchestraConfig(): ArchestraConfig {
    const baseUrl = normalizeBaseUrl(
        process.env.ARCHESTRA_BASE_URL || DEFAULT_ARCHESTRA_BASE_URL
    );
    const apiKey = process.env.ARCHESTRA_API_KEY;
    const agentId = process.env.ARCHESTRA_AGENT_ID;
    const model = process.env.ARCHESTRA_CHAT_MODEL || DEFAULT_CHAT_MODEL;

    if (!apiKey) {
        throw new Error("Missing ARCHESTRA_API_KEY");
    }
    if (!agentId) {
        throw new Error("Missing ARCHESTRA_AGENT_ID");
    }

    return { baseUrl, apiKey, agentId, model };
}

export async function chatWithArchestra(prompt: string): Promise<string> {
    const { baseUrl, apiKey, agentId, model } = getArchestraConfig();

    const url = `${baseUrl}/v1/gemini/${agentId}/v1beta/models/${model}:generateContent`;

    const requestBody = {
        contents: [
            {
                role: "user",
                parts: [
                    {
                        text: prompt,
                    },
                ],
            },
        ],
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const startTime = Date.now();

    try {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        };
        if (process.env.GEMINI_API_KEY) {
            headers["x-goog-api-key"] = process.env.GEMINI_API_KEY;
        }

        const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(requestBody),
            signal: controller.signal,
        });

        const duration = Date.now() - startTime;

        const rawText = await response.text();
        if (!response.ok) {
            throw new Error(
                `Archestra request failed (${response.status}): ${rawText}`
            );
        }

        let payload: any;
        try {
            payload = JSON.parse(rawText);
        } catch (err) {
            throw new Error("Response was not valid JSON");
        }

        const text =
            payload?.candidates?.[0]?.content?.parts
                ?.filter((p: any) => p?.text)
                ?.map((p: any) => p.text)
                ?.join("\n")
                ?.trim();

        if (!text) {
            throw new Error("Archestra response did not contain assistant content");
        }

        return text;
    } catch (err: any) {
        if (err.name === "AbortError") {
            console.error("❌ Request aborted due to timeout");
        } else {
            console.error("❌ Archestra error:", err);
        }
        throw err;
    } finally {
        clearTimeout(timeout);
    }
}
