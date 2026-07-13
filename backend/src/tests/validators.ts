import { describe, it, expect } from "vitest";
import { crmRecordSchema, aiBatchResponseSchema } from "../utils/validators";

describe("crmRecordSchema", () => {
  it("normalizes empty strings and AI noise words to null", () => {
    const parsed = crmRecordSchema.parse({
      created_at: "",
      name: "John Doe",
      email: "john@example.com",
      country_code: "N/A",
      mobile_without_country_code: "9876543210",
      company: "none",
      city: null,
      state: undefined,
      country: "India",
      lead_owner: null,
      crm_status: "",
      crm_note: null,
      data_source: "",
      possession_time: null,
      description: null,
    });

    expect(parsed.created_at).toBeNull();
    expect(parsed.country_code).toBeNull();
    expect(parsed.company).toBeNull();
    expect(parsed.crm_status).toBeNull();
    expect(parsed.data_source).toBeNull();
    expect(parsed.name).toBe("John Doe");
  });

  it("coerces invalid crm_status values to null instead of failing", () => {
    const result = crmRecordSchema.safeParse({
      created_at: null,
      name: null,
      email: null,
      country_code: null,
      mobile_without_country_code: null,
      company: null,
      city: null,
      state: null,
      country: null,
      lead_owner: null,
      crm_status: "UNKNOWN_STATUS",
      crm_note: null,
      data_source: null,
      possession_time: null,
      description: null,
    });

    expect(result.success).toBe(true);
    expect(result.data?.crm_status).toBeNull();
  });
});

describe("aiBatchResponseSchema", () => {
  it("accepts a well-formed batch response with row indices", () => {
    const result = aiBatchResponseSchema.safeParse({
      records: [
        {
          _rowIndex: 0,
          created_at: null,
          name: "Ankit",
          email: "ankit@example.com",
          country_code: "+91",
          mobile_without_country_code: "9876543210",
          company: null,
          city: null,
          state: null,
          country: null,
          lead_owner: null,
          crm_status: "GOOD_LEAD_FOLLOW_UP",
          crm_note: null,
          data_source: null,
          possession_time: null,
          description: null,
        },
      ],
    });

    expect(result.success).toBe(true);
  });
});
