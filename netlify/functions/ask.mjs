/* eslint-env node */
import Anthropic from "@anthropic-ai/sdk";

export const handler = async (event) => {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { prompt } = body;

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing prompt" }),
      };
    }

    const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      temperature: 0.7,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = response && response.content && response.content[0] && response.content[0].text
      ? response.content[0].text
      : "";

    return {
      statusCode: 200,
      body: JSON.stringify({ text: responseText }),
    };
  } catch (err) {
    console.error("Claude function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Claude request failed" }),
    };
  }
};
