import OpenAI from "openai";
import { env } from "../../config/env";
import { AiProvider } from "./provider.interface";

export class OpenRouterProvider implements AiProvider {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      timeout: 15000,
      defaultHeaders: {
        "HTTP-Referer": "https://groweasy.ai",
        "X-Title": "GrowEasy CSV Importer",
      },
    });
  }

  async generateJson(systemPrompt: string, userPrompt: string): Promise<string> {
    const completion = await this.client.chat.completions.create({
      model: env.OPENROUTER_MODEL,
      temperature: 0,
      response_format: { type: "json_object" },
      max_tokens: 4096,
      messages: [
        {
          role: "system",
          content: `${systemPrompt}\n\nRespond ONLY with valid raw JSON. Do not include markdown code block formatting (fences).`,
        },
        { role: "user", content: userPrompt },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("OpenRouter returned an empty response");

    return content.replace(/^```json\s*|```\s*$/g, "").trim();
  }
}
