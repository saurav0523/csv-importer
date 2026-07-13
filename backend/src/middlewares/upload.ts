import multer from "multer";
import { env } from "../config/env";
import { AppError } from "./error";

const storage = multer.memoryStorage();

export const csvUpload = multer({
  storage,
  limits: { fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const isCsv =
      file.mimetype === "text/csv" ||
      file.mimetype === "application/vnd.ms-excel" ||
      file.originalname.toLowerCase().endsWith(".csv");

    if (!isCsv) {
      return cb(new AppError("Only .csv files are supported.", 400));
    }
    cb(null, true);
  },
});
