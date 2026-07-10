
export interface AiProvider {

  generateJson(systemPrompt: string, userPrompt: string): Promise<string>;
}
