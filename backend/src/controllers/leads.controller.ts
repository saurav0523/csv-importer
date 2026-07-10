import { Request, Response, NextFunction } from "express";
import { pool } from "../config/db";
import { logger } from "../utils/logger";
import { CRM_STATUS_VALUES } from "../constants/crm.constants";

export async function getLeads(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const search = (req.query.search as string) || "";
    const status = (req.query.status as string) || "";

    let queryText = "SELECT * FROM leads";
    let countQueryText = "SELECT COUNT(*) FROM leads";
    const queryParams: any[] = [];
    const conditions: string[] = [];


    if (search.trim().length > 0) {
      const searchWildcard = `%${search}%`;
      queryParams.push(searchWildcard);
      conditions.push(`(name ILIKE $${queryParams.length} OR email ILIKE $${queryParams.length} OR mobile_without_country_code ILIKE $${queryParams.length} OR company ILIKE $${queryParams.length})`);
    }


    if (status.trim().length > 0 && CRM_STATUS_VALUES.includes(status as any)) {
      queryParams.push(status);
      conditions.push(`crm_status = $${queryParams.length}`);
    }


    if (conditions.length > 0) {
      const whereClause = " WHERE " + conditions.join(" AND ");
      queryText += whereClause;
      countQueryText += whereClause;
    }


    queryText += " ORDER BY imported_at DESC, id DESC";


    const limitParamIndex = queryParams.length + 1;
    const offsetParamIndex = queryParams.length + 2;
    queryText += ` LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}`;
    queryParams.push(limit, offset);

    const [leadsResult, countResult, statsResult] = await Promise.all([
      pool.query(queryText, queryParams),
      pool.query(countQueryText, queryParams.slice(0, queryParams.length - 2)),
      pool.query(`
        SELECT 
          COUNT(*) as total, 
          COUNT(*) FILTER (WHERE crm_status = 'SALE_DONE') as sales, 
          COUNT(*) FILTER (WHERE crm_status = 'GOOD_LEAD_FOLLOW_UP') as follow_ups 
        FROM leads
      `)
    ]);
    
    const totalCount = parseInt(countResult.rows[0].count) || 0;
    const stats = {
      total: parseInt(statsResult.rows[0].total) || 0,
      sales: parseInt(statsResult.rows[0].sales) || 0,
      followUps: parseInt(statsResult.rows[0].follow_ups) || 0,
    };

    res.status(200).json({
      success: true,
      data: {
        leads: leadsResult.rows,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount,
        },
        stats
      },
    });
  } catch (err) {
    logger.error({ error: (err as Error).message }, "Failed to fetch leads");
    next(err);
  }
}
