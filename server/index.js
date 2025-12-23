require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { OpenAI } = require("openai");
const rateLimit = require("express-rate-limit");

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rate Limiter: 20 requests per hour per IP
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 20,
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

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      temperature: 0.8,
      max_tokens: 1000,
    });

    res.json(completion);
  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({
      error: error.message || "An error occurred during generation",
    });
  }
});

app.listen(port, () => {
  console.log(`Lumina Proxy Server running at http://localhost:${port}`);
});
