
// Centralized configuration for the application backend

// Neon Database Connection String (Direct Connection)
export const DATABASE_URL = "postgresql://neondb_owner:npg_QexFwrDjJb73@ep-fragrant-base-adz9wts1-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

// Neon Auth URL (for potential future OAuth/Auth integration)
export const NEON_AUTH_URL = "https://ep-fragrant-base-adz9wts1.neonauth.c-2.us-east-1.aws.neon.tech/neondb/auth";

// Session Storage Key
export const AUTH_SESSION_KEY = 'ainrion_session_user';

// API Key for Gemini (process.env is injected by Vite/Bundler)
export const GEMINI_API_KEY = process.env.API_KEY || '';
