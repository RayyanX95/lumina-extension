require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { OpenAI } = require("openai");
const rateLimit = require("express-rate-limit");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rate Limiter: 20 requests per hour per IP
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 99,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

// Apply rate limiting to all requests
app.use(limiter);

// OpenAI Configuration
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY, // Using the same key from frontend env
});

app.post("/api/generate", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages) {
      return res.status(400).json({ error: "Messages are required" });
    }

    // Use gpt-4.1 where judgment matters.
    // Use gpt-4o-mini where structure matters.

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "system",
          content: `
You are reacting as a senior engineer.
Avoid summarizing the input.
Each paragraph must introduce a NEW technical angle.
Do not invent teams or personal stories.
Use frustration phrases at most once, only if relevant.
      `,
        },
        ...messages,
      ],
      temperature: 0.35,
      max_tokens: 600,
    });

    res.json(completion);
  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({
      error: error.message || "An error occurred during generation",
    });
  }
});

app.get("/", (req, res) => {
  res.send("Lumina API is running");
});

app.listen(port, () => {
  console.log(`Lumina Proxy Server running at http://localhost:${port}`);
});
