import { ReactingDeepSettingHandler } from "handlers/settings-handler";

// Declare Foundry VTT globals
declare const ui: any;

export class Translator {
  static async chatWithDeepSeek(message: string): Promise<string | undefined> {
    const apiKey = ReactingDeepSettingHandler.getSetting("reacting-deep", "apiKeyDeepSeek") as string;
    const apiEndpoint = ReactingDeepSettingHandler.getSetting("reacting-deep", "apiEndpoint") as string;
    const model = ReactingDeepSettingHandler.getSetting("reacting-deep", "targetModel") as string;

    const url = `${apiEndpoint}/v1/chat/completions`;
    let response: Response | undefined;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ 
          model, 
          messages: [{ role: "user", content: message }],
          stream: false
        }),
      });
    } catch (error) {
      ui?.notifications?.error(`DeepSeek API call failed. ${error}`);
      return undefined;
    }

    if (!response?.ok) {
      const errText = await response?.text().catch(() => "");
      ui?.notifications?.error(`DeepSeek API call failed: ${response?.status} ${errText}`);
      return undefined;
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content ?? undefined;
  }

  static async getModels(): Promise<Record<string, string> | undefined> {
    return await Translator.getDeepSeekModels();
  }

  static async getDeepSeekModels(): Promise<Record<string, string>> {
    const apiKey = ReactingDeepSettingHandler.getSetting("reacting-deep", "apiKeyDeepSeek") as string;
    const apiEndpoint = ReactingDeepSettingHandler.getSetting("reacting-deep", "apiEndpoint") as string;

    const pricing: Record<string, string> = {
      "deepseek-chat":     "DeepSeek Chat V3 — $0.07 / $0.27 / $1.10 per 1M tokens",
      "deepseek-reasoner": "DeepSeek Reasoner R1 — $0.14 / $0.55 / $2.19 per 1M tokens",
    };

    if (apiKey && apiEndpoint) {
      try {
        const res = await fetch(`${apiEndpoint}/v1/models`, {
          headers: { "Authorization": `Bearer ${apiKey}` },
        });
        if (res.ok) {
          const data = await res.json();
          const result: Record<string, string> = {};
          for (const m of data?.data ?? []) {
            result[m.id] = pricing[m.id] ?? m.id;
          }
          if (Object.keys(result).length > 0) return result;
        }
      } catch {
        // fall through to static list
      }
    }

    return pricing;
  }
}
