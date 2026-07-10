import { AiProvider } from "./provider.interface";
import { OpenRouterProvider } from "./openrouter.provider";

let cachedProvider: AiProvider | null = null;

export function getAiProvider(): AiProvider {
  if (!cachedProvider) {
    cachedProvider = new OpenRouterProvider();
  }
  return cachedProvider;
}
