import { Router } from "express";
import { importCsv, healthCheck } from "../controllers/import";
import { getLeads } from "../controllers/leads";
import { csvUpload } from "../middlewares/upload";
import { importRateLimiter } from "../middlewares/rateLimiter";

const router = Router();

router.get("/health", healthCheck);
router.post("/import", importRateLimiter, csvUpload.single("file"), importCsv);
router.get("/leads", getLeads);

export default router;
