import { logger } from "./logger";

interface RetryOptions {
  retries: number;
  baseDelayMs?: number;
  label?: string;
}


export async function withRetry<T>(fn: () => Promise<T>, opts: RetryOptions): Promise<T> {
  const { retries, baseDelayMs = 500, label = "operation" } = opts;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const isLastAttempt = attempt === retries;
      logger.warn(
        { attempt: attempt + 1, retries, label, error: (err as Error)?.message },
        `${label} failed${isLastAttempt ? " (no retries left)" : ", retrying..."}`
      );
      if (isLastAttempt) break;

      const delay = baseDelayMs * 2 ** attempt + Math.random() * 200;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
