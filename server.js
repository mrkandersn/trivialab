/* eslint-env node */

import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Anthropic from "@anthropic-ai/sdk";

dotenv.config();
const app = express();
app.use(express.json());

// Get dirname in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Claude client
const client = new Anthropic({
  apiKey: process.env?.CLAUDE_API_KEY,
});

// === API ROUTE ===
app.post("/api/ask", async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 5000,
      temperature: 0.7,
      messages: [
        { 
          role: "user", 
          content: prompt 
        }
      ],
    });

    res.json({ text: response.content[0].text });
  } catch (err) {
    console.error("Claude API error:", err);
    res.status(500).json({ error: "Claude request failed" });
  }
});

// === STATIC FILES (Production) ===
if (process.env.NODE_ENV === "production") {
  // Serve frontend from /dist
  app.use(express.static(path.join(__dirname, "dist")));

  // Handle React Router paths
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}

// === START SERVER ===
const PORT = process.env.PORT || 3001;
// eslint-disable-next-line no-console
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
