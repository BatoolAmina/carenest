import fs from "node:fs";

for (const file of [".env.local", ".env"]) {
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (match && !(match[1] in process.env)) process.env[match[1]] = match[2].replace(/^"(.*)"$/, "$1");
  }
}

const required = [
  ["NEXTAUTH_URL", "Public application URL"],
  ["NEXTAUTH_SECRET", "NextAuth signing secret"],
  ["NEXT_PUBLIC_SITE_URL", "Canonical public site URL"],
  ["MONGODB_URI", "MongoDB Atlas connection string"],
  ["HOSPITAL_EMAIL_DOMAINS", "Official doctor email domains"],
];
const missing = required.filter(([key]) => !String(process.env[key] || "").trim());

if (missing.length) {
  console.error("CareNest environment preflight failed:");
  for (const [key, label] of missing) console.error(`  - ${key}: ${label}`);
  process.exit(1);
}

console.log("CareNest environment preflight passed.");
