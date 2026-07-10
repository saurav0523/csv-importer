import { env } from "../config/env";
import { logger } from "../utils/logger";
import { chunkArray, runWithConcurrency } from "../utils/batch";
import { extractBatch } from "./ai.service";
import { CrmRecord, ImportResult, RawCsvRow, SkippedRecord } from "../types/crm.types";
import { pool } from "../config/db";

function hasContactInfo(record: CrmRecord): boolean {
  const hasEmail = !!record.email && record.email.trim().length > 0;
  const hasMobile =
    !!record.mobile_without_country_code && record.mobile_without_country_code.trim().length > 0;
  return hasEmail || hasMobile;
}

async function saveImportedRecords(records: CrmRecord[]): Promise<void> {
  if (records.length === 0) return;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    const queryText = `
      INSERT INTO leads (
        created_at, name, email, country_code, mobile_without_country_code,
        company, city, state, country, lead_owner, crm_status, crm_note,
        data_source, possession_time, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    `;

    for (const record of records) {
      await client.query(queryText, [
        record.created_at,
        record.name,
        record.email,
        record.country_code,
        record.mobile_without_country_code,
        record.company,
        record.city,
        record.state,
        record.country,
        record.lead_owner,
        record.crm_status,
        record.crm_note,
        record.data_source,
        record.possession_time,
        record.description
      ]);
    }
    
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    logger.error({ error: (err as Error).message }, "Failed to save imported records to database");
    throw err;
  } finally {
    client.release();
  }
}

export async function mapCsvRowsToCrm(rawRows: RawCsvRow[]): Promise<ImportResult> {
  const startedAt = Date.now();

  const indexedRows = rawRows.map((row, rowIndex) => ({ _rowIndex: rowIndex, _data: row }));
  const batches = chunkArray(indexedRows, env.AI_BATCH_SIZE);

  logger.info({ totalRows: rawRows.length, batchCount: batches.length }, "Starting AI extraction");

  let failedBatches = 0;
  const mergedResults = new Map<number, CrmRecord>();

  await runWithConcurrency(batches, env.AI_CONCURRENCY, async (batch, batchIndex) => {
    try {
      const batchResult = await extractBatch(batch);
      for (const [rowIndex, record] of batchResult.entries()) {
        mergedResults.set(rowIndex, record);
      }
    } catch (err) {
      failedBatches += 1;
      logger.error(
        { batchIndex, error: (err as Error).message },
        "Batch permanently failed after retries — rows in this batch will be marked as skipped"
      );
    }
  });

  const tempImportedRecords: { record: CrmRecord; rowIndex: number; data: RawCsvRow }[] = [];
  const skippedRecords: SkippedRecord[] = [];

  indexedRows.forEach(({ _rowIndex, _data }) => {
    const record = mergedResults.get(_rowIndex);

    if (!record) {
      skippedRecords.push({
        row: _data,
        rowIndex: _rowIndex,
        reason: "AI extraction failed for this row's batch after all retries.",
      });
      return;
    }

    if (!hasContactInfo(record)) {
      skippedRecords.push({
        row: _data,
        rowIndex: _rowIndex,
        reason: "Row has neither a usable email nor a usable mobile number.",
      });
      return;
    }

    tempImportedRecords.push({ record, rowIndex: _rowIndex, data: _data });
  });

  const emailsToSearch = tempImportedRecords
    .map((t) => t.record.email?.trim().toLowerCase())
    .filter((e): e is string => !!e);
  const mobilesToSearch = tempImportedRecords
    .map((t) => t.record.mobile_without_country_code?.trim())
    .filter((m): m is string => !!m);

  const existingEmails = new Set<string>();
  const existingMobiles = new Set<string>();

  if (emailsToSearch.length > 0 || mobilesToSearch.length > 0) {
    try {
      const query = `
        SELECT email, mobile_without_country_code 
        FROM leads 
        WHERE 
          (email IS NOT NULL AND LOWER(email) = ANY($1))
          OR (mobile_without_country_code IS NOT NULL AND mobile_without_country_code = ANY($2))
      `;
      const res = await pool.query(query, [emailsToSearch, mobilesToSearch]);
      for (const row of res.rows) {
        if (row.email) {
          existingEmails.add(row.email.trim().toLowerCase());
        }
        if (row.mobile_without_country_code) {
          existingMobiles.add(row.mobile_without_country_code.trim());
        }
      }
    } catch (err) {
      logger.error({ error: (err as Error).message }, "Failed to query database for duplicates");
    }
  }

  const importedRecords: CrmRecord[] = [];
  const seenEmailsInBatch = new Set<string>();
  const seenMobilesInBatch = new Set<string>();

  tempImportedRecords.forEach(({ record, rowIndex, data }) => {
    const emailKey = record.email?.trim().toLowerCase();
    const mobileKey = record.mobile_without_country_code?.trim();

    const isEmailDbDuplicate = !!(emailKey && existingEmails.has(emailKey));
    const isMobileDbDuplicate = !!(mobileKey && existingMobiles.has(mobileKey));

    if (isEmailDbDuplicate || isMobileDbDuplicate) {
      const matchedField = isEmailDbDuplicate && isMobileDbDuplicate 
        ? "email and mobile" 
        : isEmailDbDuplicate 
          ? "email" 
          : "mobile";
      skippedRecords.push({
        row: data,
        rowIndex,
        reason: `Lead already exists in database (duplicate ${matchedField}).`,
      });
      return;
    }

    const isEmailBatchDuplicate = !!(emailKey && seenEmailsInBatch.has(emailKey));
    const isMobileBatchDuplicate = !!(mobileKey && seenMobilesInBatch.has(mobileKey));

    if (isEmailBatchDuplicate || isMobileBatchDuplicate) {
      const matchedField = isEmailBatchDuplicate && isMobileBatchDuplicate 
        ? "email and mobile" 
        : isEmailBatchDuplicate 
          ? "email" 
          : "mobile";
      skippedRecords.push({
        row: data,
        rowIndex,
        reason: `Duplicate lead in the uploaded file (same ${matchedField} as a previous row).`,
      });
      return;
    }

    if (emailKey) seenEmailsInBatch.add(emailKey);
    if (mobileKey) seenMobilesInBatch.add(mobileKey);

    importedRecords.push(record);
  });


  try {
    await saveImportedRecords(importedRecords);
    logger.info({ count: importedRecords.length }, "Successfully saved imported records to database");
  } catch (err) {
    logger.error({ error: (err as Error).message }, "Failed to commit imported records to db, continuing response");
  }

  const durationMs = Date.now() - startedAt;

  logger.info(
    { totalImported: importedRecords.length, totalSkipped: skippedRecords.length, durationMs },
    "AI extraction complete"
  );

  return {
    importedRecords,
    skippedRecords,
    totalRows: rawRows.length,
    totalImported: importedRecords.length,
    totalSkipped: skippedRecords.length,
    failedBatches,
    durationMs,
  };
}
