// backend/src/controllers/geminiController.js
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const summarizeChat = async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: "Messages are required" });
    }

    const prompt = `Summarize this chat:\n\n${messages.join('\n')}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const summary = response.text;
    res.json({ summary });
  } catch (err) {
    console.error("Error summarizing chat:", err);
    res.status(500).json({ error: "Failed to summarize chat" });
  }
};
