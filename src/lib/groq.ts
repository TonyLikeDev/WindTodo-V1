import Groq from 'groq-sdk';

// Single shared Groq client (OpenAI-compatible). Null when no key is set so
// callers can degrade gracefully instead of throwing at import time — mirrors
// the optional-config pattern used for Liveblocks.
export const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

// Multimodal model: handles both the vision (photo OCR) path and plain text.
// `meta-llama/llama-4-maverick-17b-128e-instruct` is a drop-in higher-quality
// alternative; `openai/gpt-oss-20b` supports strict JSON for text-only input.
export const GROQ_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
