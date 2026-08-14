import dotenv from "dotenv";
import mongoose from "mongoose";

let envPath = new URL("../.env", import.meta.url).pathname;
if (process.platform === "win32" && envPath.startsWith("/"))
  envPath = envPath.slice(1);
envPath = decodeURIComponent(envPath);
console.log("Loading env from", envPath);
const cfg = dotenv.config({ path: envPath });
console.log("dotenv result", cfg.error ? cfg.error.message : "loaded");

const API =
  process.env.VITE_API_BASE_URL ??
  `http://localhost:${process.env.PORT ?? 3001}`;
const MONGO = process.env.MONGODB_URI;

if (!MONGO) throw new Error("MONGODB_URI not set");

async function main() {
  await mongoose.connect(MONGO, {
    dbName: new URL(MONGO).searchParams.get("appName") || undefined,
  });
  console.log("Connected to MongoDB");

  const email = `e2e+${Date.now()}@example.com`;
  const password = "password123";

  console.log("Signing up user", email);
  const signup = await fetch(`${API}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!signup.ok) {
    console.error("Signup failed", await signup.text());
    process.exit(1);
  }
  const su = await signup.json();
  const token = su.token;
  console.log("Signed up, token length:", token?.length ?? 0);

  console.log("Creating recording");
  const recRes = await fetch(`${API}/api/recordings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      mode: "meeting",
      title: "E2E Test",
      language: "en-US",
    }),
  });
  if (!recRes.ok) {
    console.error("Create recording failed", await recRes.text());
    process.exit(1);
  }
  const recording = await recRes.json();
  console.log(
    "Created recording id",
    recording.id || recording._id || recording,
  );
  const id = recording.id ?? recording._id ?? recording;

  // seed transcript directly in MongoDB
  const db = mongoose.connection.db;
  const segments = [
    {
      segmentId: "s1",
      startMs: 0,
      endMs: 4000,
      speaker: "Speaker 1",
      text: "Hello team, today we will discuss the API.",
    },
    {
      segmentId: "s2",
      startMs: 5000,
      endMs: 12000,
      speaker: "Speaker 2",
      text: "Sounds good. First, we have to finalize auth flows.",
    },
  ];
  const startedAt = new Date(Date.now() - 60_000);
  await db
    .collection("recordings")
    .updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: { transcript: segments, startedAt, status: "recording" } },
    );
  console.log("Seeded transcript segments");

  console.log("Calling finalize to run analysis");
  const fin = await fetch(`${API}/api/recordings/${id}/finalize`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!fin.ok) {
    console.error("Finalize failed", await fin.text());
    process.exit(1);
  }
  const final = await fin.json();
  console.log("Finalize result status:", final.status);

  const get = await fetch(`${API}/api/recordings/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const out = await get.json();
  console.log("Final recording:", JSON.stringify(out, null, 2));

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
