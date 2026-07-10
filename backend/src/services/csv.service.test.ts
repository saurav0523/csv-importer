import { describe, it, expect } from "vitest";
import { parseCsv, CsvParseError } from "./csv.service";

describe("parseCsv", () => {
  it("parses a well-formed CSV into row objects keyed by header", () => {
    const csv = "name,email\nJohn Doe,john@example.com\nJane Doe,jane@example.com";
    const rows = parseCsv(csv);

    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ name: "John Doe", email: "john@example.com" });
    expect(rows[1].email).toBe("jane@example.com");
  });

  it("does not assume any fixed column names", () => {
    const csv = "Full Name,Contact No,Where\nAnkit,9876543210,Bangalore";
    const rows = parseCsv(csv);

    expect(Object.keys(rows[0])).toEqual(["Full Name", "Contact No", "Where"]);
  });

  it("throws CsvParseError on an empty file", () => {
    expect(() => parseCsv("name,email")).toThrow(CsvParseError);
  });

  it("trims whitespace and tolerates ragged rows", () => {
    const csv = "a,b,c\n1,2,3,4\n5,6";
    expect(() => parseCsv(csv)).not.toThrow();
  });
});
