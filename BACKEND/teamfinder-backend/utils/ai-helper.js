const { GoogleGenerativeAI } = require("@google/generative-ai");

// Configuration
const MOCK_MODE = true; // Temporarily disable AI as requested
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const TIMEOUT_MS = 10000;

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Helper to delay execution
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Wrapper for Gemini API calls with retry, timeout, and mock support.
 */
async function callGemini(prompt, mockData = null) {
  if (MOCK_MODE) {
    console.log("[AI-HELPER] Mock Mode Active. Returning default response.");
    return mockData;
  }

  let lastError;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      // Timeout wrapper
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("AI_TIMEOUT")), TIMEOUT_MS)
      );

      const result = await Promise.race([
        model.generateContent(prompt),
        timeoutPromise
      ]);

      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) throw new Error("INVALID_AI_RESPONSE");
      return JSON.parse(jsonMatch[0]);

    } catch (error) {
      lastError = error;
      const is503 = error.message?.includes("503") || error.status === 503 || error.message?.includes("504");
      const isTimeout = error.message === "AI_TIMEOUT";

      if (is503 && i < MAX_RETRIES - 1) {
        const backoff = RETRY_DELAY_MS * Math.pow(2, i);
        console.warn(`[AI-HELPER] 503 Error. Retrying in ${backoff}ms... (Attempt ${i + 1}/${MAX_RETRIES})`);
        await delay(backoff);
        continue;
      }

      console.error(`[AI-HELPER] Fatal AI Error:`, error.message);
      break; 
    }
  }

  // Final Fallback if all retries fail or non-retryable error
  console.log("[AI-HELPER] All retries failed. Returning mock/default data.");
  return mockData;
}

module.exports = { callGemini };
