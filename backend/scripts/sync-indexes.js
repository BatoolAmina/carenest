// Builds every index defined on the models. REQUIRED once per environment: the double-booking guarantee depends on
// the unique partial indexes on Appointment (slotKey, patientSlotKey).  npm run db:indexes
import "./_env.js";
import mongoose from "mongoose";
import * as M from "../models/index.js";
if (!process.env.MONGODB_URI) { console.error("MONGODB_URI is not set."); process.exit(1); }
await mongoose.connect(process.env.MONGODB_URI);
for (const [name, model] of Object.entries(M)) { await model.syncIndexes(); console.log("indexes ok:", name); }
const idx = await M.Appointment.collection.indexes();
const ok = ["slotKey_1", "patientSlotKey_1"].every((n) => idx.some((i) => i.name === n && i.unique));
console.log(ok ? "\nDouble-booking guard verified: unique indexes present." : "\nWARNING: unique booking indexes are MISSING.");
await mongoose.disconnect();
process.exit(ok ? 0 : 1);
