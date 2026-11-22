import { describe, it, expect } from "vitest";
import { toCsv } from "../lib/csv.js";
describe("csv export", () => {
  it("quotes commas/quotes/newlines", () => { expect(toCsv(["a"], [['x,"y"\nz']])).toBe('a\r\n"x,""y""\nz"'); });
  it("neutralises spreadsheet formula injection", () => { for (const bad of ["=SUM(A1)", "+1", "-2", "@cmd"]) expect(toCsv(["a"], [[bad]]).split("\r\n")[1].startsWith("'")).toBe(true); });
  it("handles null values", () => { expect(toCsv(["a", "b"], [[null, 1]])).toBe("a,b\r\n,1"); });
});
