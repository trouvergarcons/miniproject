import { createGoogleGenerativeAI } from '@ai-sdk/google';

// Create Gemini instance
export const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
});

// Default model
export const geminiModel = google('models/gemini-2.5-flash');