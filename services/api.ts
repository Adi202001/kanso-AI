
import { neon } from '@neondatabase/serverless';
import { UserProfile, Itinerary } from "../types";
import { DATABASE_URL, AUTH_SESSION_KEY } from './config';
import { hashPassword, verifyPassword } from './security';

// Initialize Neon Client
const sql = neon(DATABASE_URL);

class NeonBackendService {
  private initPromise: Promise<void> | null = null;

  // Lazy initialization of database schema
  private async ensureSchema() {
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        await sql`
          CREATE TABLE IF NOT EXISTS auth_users (
            email TEXT PRIMARY KEY,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `;
        await sql`
          CREATE TABLE IF NOT EXISTS profiles (
            email TEXT PRIMARY KEY,
            data JSONB
          );
        `;
        await sql`
          CREATE TABLE IF NOT EXISTS itineraries (
            id TEXT PRIMARY KEY,
            email TEXT,
            data JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `;
        // We log only in development/console for verification
        console.log("Connected to Neon DB and schema verified.");
      } catch (e) {
        console.error("Failed to initialize Neon DB schema:", e);
      }
    })();

    return this.initPromise;
  }

  // --- Helper to get current session email from client-side storage ---
  private getSessionEmail(): string | null {
    const stored = localStorage.getItem(AUTH_SESSION_KEY);
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored);
      return parsed.email;
    } catch {
      return null;
    }
  }

  // --- User Profile Endpoints ---

  async getUserProfile(): Promise<UserProfile> {
    await this.ensureSchema();
    const email = this.getSessionEmail();
    if (!email) throw new Error("No session found");

    try {
      const result = await sql`SELECT data FROM profiles WHERE email = ${email}`;
      if (result.length > 0) {
        return result[0].data as UserProfile;
      }
    } catch (e) {
      console.error("Error fetching profile:", e);
    }

    // Default Profile if not found
    return {
      name: email.split('@')[0],
      bio: 'Ready for the next adventure.',
      homeBase: '',
      defaultBudget: 'Moderate',
      defaultInterests: [],
      hasCompletedOnboarding: false
    };
  }

  async updateUserProfile(profile: UserProfile): Promise<UserProfile> {
    await this.ensureSchema();
    const email = this.getSessionEmail();
    if (!email) throw new Error("No session found");

    // Upsert profile data into JSONB column
    await sql`
      INSERT INTO profiles (email, data)
      VALUES (${email}, ${JSON.stringify(profile)})
      ON CONFLICT (email)
      DO UPDATE SET data = ${JSON.stringify(profile)}
    `;
    
    return profile;
  }

  // --- Itinerary Endpoints ---

  async getItineraries(): Promise<Itinerary[]> {
    await this.ensureSchema();
    const email = this.getSessionEmail();
    if (!email) return [];

    try {
      const result = await sql`
        SELECT data FROM itineraries 
        WHERE email = ${email} 
        ORDER BY created_at DESC
      `;
      return result.map((row: any) => row.data as Itinerary);
    } catch (e) {
      console.error("Error fetching itineraries:", e);
      return [];
    }
  }

  async createItinerary(itinerary: Itinerary): Promise<Itinerary> {
    await this.ensureSchema();
    const email = this.getSessionEmail();
    if (!email) throw new Error("No session found");

    await sql`
      INSERT INTO itineraries (id, email, data)
      VALUES (${itinerary.id}, ${email}, ${JSON.stringify(itinerary)})
      ON CONFLICT (id) DO UPDATE SET data = ${JSON.stringify(itinerary)}
    `;
    
    return itinerary;
  }

  async updateItinerary(itinerary: Itinerary): Promise<Itinerary> {
    // Reuse upsert logic for updates
    return this.createItinerary(itinerary); 
  }

  async deleteItinerary(id: string): Promise<boolean> {
    await this.ensureSchema();
    const email = this.getSessionEmail();
    if (!email) return false;

    await sql`DELETE FROM itineraries WHERE id = ${id} AND email = ${email}`;
    return true;
  }

  // --- Auth Endpoints ---

  async signup(email: string, password: string): Promise<{ id: string; email: string; name: string }> {
    await this.ensureSchema();

    // Check if user already exists
    const existing = await sql`SELECT email FROM auth_users WHERE email = ${email}`;
    if (existing.length > 0) {
      throw new Error("Account already exists. Please log in.");
    }

    // Hash Password
    const { hash, salt } = await hashPassword(password);

    // Create Auth Record
    await sql`
      INSERT INTO auth_users (email, password_hash, salt)
      VALUES (${email}, ${hash}, ${salt})
    `;

    // Initialize Profile
    const name = email.split('@')[0];
    const newProfile: UserProfile = {
      name: name,
      bio: 'Ready for the next adventure.',
      homeBase: '',
      defaultBudget: 'Moderate',
      defaultInterests: [],
      hasCompletedOnboarding: false
    };
    await sql`
      INSERT INTO profiles (email, data)
      VALUES (${email}, ${JSON.stringify(newProfile)})
      ON CONFLICT (email) DO NOTHING
    `;

    // Start Session
    const user = {
      id: 'usr_' + Date.now(),
      email,
      name
    };
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user));

    return user;
  }

  async login(email: string, password?: string): Promise<{ id: string; email: string; name: string }> {
    await this.ensureSchema();

    // 1. Fetch user auth record
    const users = await sql`SELECT email, password_hash, salt FROM auth_users WHERE email = ${email}`;
    
    if (users.length === 0) {
      // For backward compatibility or "Auth via Magic Link" simulation if password is not provided
      // BUT prompted request is "Use Email and Password".
      throw new Error("User not found. Please sign up.");
    }

    const authRecord = users[0];

    // 2. Verify Password
    if (!password) {
      throw new Error("Password is required.");
    }

    const isValid = await verifyPassword(password, authRecord.password_hash, authRecord.salt);
    if (!isValid) {
      throw new Error("Invalid password.");
    }

    // 3. Set Session
    const user = {
      id: 'usr_' + Date.now(), // In a real app, you'd fetch ID from DB
      email,
      name: email.split('@')[0]
    };
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user));

    return user;
  }

  async getCurrentUser(): Promise<{ id: string; email: string } | null> {
    const stored = localStorage.getItem(AUTH_SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  async logout(): Promise<void> {
    localStorage.removeItem(AUTH_SESSION_KEY);
  }
}

export const api = new NeonBackendService();
