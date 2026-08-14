import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({
  path: (() => {
    let p = new URL("../.env", import.meta.url).pathname;
    if (process.platform === "win32" && p.startsWith("/")) p = p.slice(1);
    return decodeURIComponent(p);
  })(),
});

const id = process.argv[2];
if (!id) {
  console.error("Usage: node scripts/printRecording.mjs <id>");
  process.exit(1);
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const doc = await db
    .collection("recordings")
    .findOne({ _id: new mongoose.Types.ObjectId(id) });
  console.log(JSON.stringify(doc, null, 2));
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
