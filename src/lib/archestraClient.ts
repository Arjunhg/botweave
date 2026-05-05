const DEFAULT_ARCHESTRA_BASE_URL = "http://localhost:9000";
const DEFAULT_CHAT_MODEL = "gemini-2.5-flash";
const REQUEST_TIMEOUT_MS = 20_000;

type ArchestraConfig = {
    baseUrl: string;
    apiKey: string;
    agentId: string;
    model: string;
};

type GeminiContentPart = {
    text?: string;
};

type GeminiCandidate = {
    content?: {
        parts?: GeminiContentPart[];
    };
};

type GeminiGenerateContentResponse = {
    candidates?: GeminiCandidate[];
};

function normalizeBaseUrl(baseUrl: string) {
    return baseUrl.replace(/\/$/, "");
}

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

function extractResponseText(payload: GeminiGenerateContentResponse) {
    return payload.candidates?.[0]?.content?.parts
        ?.filter((part) => typeof part?.text === "string")
        ?.map((part) => part.text)
        ?.join("\n")
        ?.trim();
}

export async function chatWithArchestra(prompt: string): Promise<string> {
    const { baseUrl, apiKey, agentId, model } = getArchestraConfig();
    const url = `${baseUrl}/v1/gemini/${agentId}/v1beta/models/${model}:generateContent`;

    const requestBody = {
        contents: [
            {
                role: "user",
                parts: [{ text: prompt }]
            }
        ]
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
        };

        if (process.env.GEMINI_API_KEY) {
            headers["x-goog-api-key"] = process.env.GEMINI_API_KEY;
        }

        const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(requestBody),
            signal: controller.signal
        });

        const rawText = await response.text();
        if (!response.ok) {
            throw new Error(`Archestra request failed (${response.status}): ${rawText}`);
        }

        let payload: GeminiGenerateContentResponse;
        try {
            payload = JSON.parse(rawText) as GeminiGenerateContentResponse;
        } catch {
            throw new Error("Response was not valid JSON");
        }

        const text = extractResponseText(payload);
        if (!text) {
            throw new Error("Archestra response did not contain assistant content");
        }

        return text;
    } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
            console.error("Archestra request aborted due to timeout");
        } else {
            console.error("Archestra error:", error);
        }
        throw error;
    } finally {
        clearTimeout(timeout);
    }
}