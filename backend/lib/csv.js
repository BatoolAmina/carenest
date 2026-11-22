// CSV with formula-injection protection (cells starting with = + - @ are prefixed with an apostrophe).
const cell = (v) => {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
export const toCsv = (headers, rows) => [headers.join(","), ...rows.map((r) => r.map(cell).join(","))].join("\r\n");
