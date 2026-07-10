import { Request, Response, NextFunction } from "express";
import { parseCsv, CsvParseError } from "../services/csv.service";
import { mapCsvRowsToCrm } from "../services/mapping.service";
import { AppError } from "../middlewares/error.middleware";
import { logger } from "../utils/logger";


export async function importCsv(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      throw new AppError("No CSV file was uploaded. Attach it under the 'file' field.", 400);
    }

    const csvText = req.file.buffer.toString("utf-8");

    let rawRows;
    try {
      rawRows = parseCsv(csvText);
    } catch (err) {
      if (err instanceof CsvParseError) {
        throw new AppError(err.message, 422);
      }
      throw err;
    }

    logger.info({ fileName: req.file.originalname, rows: rawRows.length }, "Import request received");

    const result = await mapCsvRowsToCrm(rawRows);

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}


export function healthCheck(_req: Request, res: Response) {
  res.status(200).json({ success: true, status: "ok", timestamp: new Date().toISOString() });
}
