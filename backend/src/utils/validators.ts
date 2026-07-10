import { z } from "zod";
import { CRM_STATUS_VALUES, DATA_SOURCE_VALUES } from "../constants/crm.constants";

const nullableString = z.preprocess((val) => {
  if (val === undefined) return null;
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed === "" || /^(null|n\/a|na|none)$/i.test(trimmed)) return null;
    return trimmed;
  }
  return val;
}, z.string().nullable());

export const crmRecordSchema = z.object({
  created_at: nullableString,
  name: nullableString,
  email: nullableString,
  country_code: nullableString,
  mobile_without_country_code: nullableString,
  company: nullableString,
  city: nullableString,
  state: nullableString,
  country: nullableString,
  lead_owner: nullableString,
  crm_status: z.preprocess((v) => {
    if (typeof v !== "string") return null;
    const val = v.trim();
    if (val === "") return null;
    
    if (CRM_STATUS_VALUES.includes(val as any)) return val;
    
    const upper = val.toUpperCase();
    if (upper.includes("WON") || upper.includes("AGREE") || upper.includes("CLOSE")) {
      return "SALE_DONE";
    }
    if (upper.includes("FOLLOW") || upper.includes("VISIT") || upper.includes("SCHEDULED") || upper.includes("HOT")) {
      return "GOOD_LEAD_FOLLOW_UP";
    }
    if (upper.includes("NOT INTEREST") || upper.includes("BAD") || upper.includes("JUNK")) {
      return "BAD_LEAD";
    }
    if (upper.includes("NOT CONNECT") || upper.includes("NO ANSWER") || upper.includes("COULD NOT")) {
      return "DID_NOT_CONNECT";
    }
    
    return null;
  }, z.enum(CRM_STATUS_VALUES).nullable()),
  crm_note: nullableString,
  data_source: z.preprocess((v) => {
    if (typeof v !== "string") return null;
    const val = v.trim();
    if (val === "") return null;

    const match = DATA_SOURCE_VALUES.find(
      (ds) => ds.toLowerCase() === val.toLowerCase()
    );
    if (match) return match;

    return null;
  }, z.enum(DATA_SOURCE_VALUES).nullable()),
  possession_time: nullableString,
  description: nullableString,
});

export const aiBatchResponseSchema = z.object({
  records: z.array(
    crmRecordSchema.extend({
      _rowIndex: z.number().optional(),
    })
  ),
});

export type CrmRecordParsed = z.infer<typeof crmRecordSchema>;
