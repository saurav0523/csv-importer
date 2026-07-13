import { AiProvider } from "./interface";
import { OpenRouterProvider } from "./openrouter";

let cachedProvider: AiProvider | null = null;

export function getAiProvider(): AiProvider {
  if (!cachedProvider) {
    cachedProvider = new OpenRouterProvider();
  }
  return cachedProvider;
}
