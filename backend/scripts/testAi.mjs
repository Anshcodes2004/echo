import "dotenv/config";
import { AiService } from "../src/services/ai.service.js";

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

const ai = new AiService();
ai.analyze("meeting", segments)
  .then((res) => console.log("AI result:", JSON.stringify(res, null, 2)))
  .catch((err) => {
    console.error("AI error", err.message);
    process.exit(1);
  });
