const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const { OpenAI } = require("openai");
const rateLimit = require("express-rate-limit");

const app = express();
const port = process.env.PORT || 8000;

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
  apiKey: process.env.OPENAI_API_KEY, // Using the same key from frontend env
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
  res.send("Lumina API is running ✨");
});

app.get("/privacy", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Lumina - Privacy Policy</title>
        <style>
          body { font-family: sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #333; }
          h1 { color: #6366f1; }
          h2 { border-bottom: 2px solid #eee; padding-bottom: 10px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <h1>Privacy Policy for Lumina</h1>
        <p><strong>Effective Date:</strong> January 20, 2026</p>
        
        <h2>1. Data Collection</h2>
        <p>Lumina collects highlighted text ("Sparks") only when explicitly requested by the user. We store your professional persona settings locally in your browser.</p>
        
        <h2>2. Use of Data</h2>
        <p>Data is used solely to generate LinkedIn drafts via AI. We do not sell, trade, or repurpose your data for marketing or model training.</p>
        
        <h2>3. Third Parties</h2>
        <p>We use OpenAI's API for content generation. Your data is processed securely and is not used by the provider to train their models.</p>
        
        <h2>4. Data Retention</h2>
        <p>Your history is stored locally on your machine. You can delete your data at any time through the extension interface.</p>
      </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Lumina Proxy Server running at http://localhost:${port}`);
});
