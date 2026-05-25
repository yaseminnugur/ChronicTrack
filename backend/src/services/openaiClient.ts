import OpenAI from 'openai';

let cachedClient: OpenAI | null = null;

/**
 * Lazy-init OpenAI client. process.env'i ilk çağrıda okur ki dotenv
 * load sırası önemli olmasın.
 */
export function getOpenAIClient(): OpenAI {
  if (cachedClient) return cachedClient;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY tanımlı değil. backend/.env dosyasına ekleyin.');
  }

  cachedClient = new OpenAI({ apiKey });
  return cachedClient;
}

export const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
