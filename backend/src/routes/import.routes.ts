import { Router } from "express";
import { importCsv, healthCheck } from "../controllers/import.controller";
import { getLeads } from "../controllers/leads.controller";
import { csvUpload } from "../middlewares/upload.middleware";
import { importRateLimiter } from "../middlewares/rateLimiter.middleware";

const router = Router();

router.get("/health", healthCheck);
router.post("/import", importRateLimiter, csvUpload.single("file"), importCsv);
router.get("/leads", getLeads);

export default router;
