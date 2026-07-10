import { Pool } from "pg";
import { env } from "./env";
import { logger } from "../utils/logger";

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.DATABASE_URL.includes("sslmode=require") || env.DATABASE_URL.includes("neon.tech")
    ? { rejectUnauthorized: false }
    : false,
});

export async function setupDatabase() {
  const client = await pool.connect();
  try {
    logger.info("Initializing database schema...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        name VARCHAR(255),
        email VARCHAR(255),
        country_code VARCHAR(10),
        mobile_without_country_code VARCHAR(50),
        company VARCHAR(255),
        city VARCHAR(255),
        state VARCHAR(255),
        country VARCHAR(255),
        lead_owner VARCHAR(255),
        crm_status VARCHAR(50),
        crm_note TEXT,
        data_source VARCHAR(100),
        possession_time VARCHAR(255),
        description TEXT,
        imported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    logger.info("Database schema initialized successfully.");
  } catch (err) {
    logger.error({ error: (err as Error).message }, "Failed to initialize database schema");
    throw err;
  } finally {
    client.release();
  }
}
