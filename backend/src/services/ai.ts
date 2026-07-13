import { getAiProvider } from "../ai/providers/factory";
import { EXTRACTION_SYSTEM_PROMPT, buildExtractionUserPrompt } from "../ai/prompts/extraction";
import { aiBatchResponseSchema } from "../utils/validators";
import { withRetry } from "../utils/retry";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { CrmRecord, RawCsvRow } from "../types/crm";

export class AiExtractionError extends Error {}

interface IndexedRow {
  _rowIndex: number;
  _data: RawCsvRow;
}


export async function extractBatch(
  rows: IndexedRow[]
): Promise<Map<number, CrmRecord>> {
  const provider = getAiProvider();
  const userPrompt = buildExtractionUserPrompt(rows);

  const rawJson = await withRetry(
    async () => {
      const response = await provider.generateJson(EXTRACTION_SYSTEM_PROMPT, userPrompt);
      JSON.parse(response);
      return response;
    },
    { retries: env.AI_MAX_RETRIES, label: `AI batch (${rows.length} rows)` }
  );

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawJson);
  } catch {
    throw new AiExtractionError("AI response was not valid JSON after retries.");
  }

  const validation = aiBatchResponseSchema.safeParse(parsedJson);
  if (!validation.success) {
    logger.error({ issues: validation.error.issues }, "AI response failed schema validation");
    throw new AiExtractionError("AI response did not match the expected CRM record schema.");
  }

  const resultMap = new Map<number, CrmRecord>();
  for (const record of validation.data.records) {
    if (typeof record._rowIndex !== "number") continue;
    const { _rowIndex, ...crmFields } = record;
    resultMap.set(_rowIndex, crmFields as CrmRecord);
  }

  return resultMap;
}
