# Kanso (簡素)

A world-class, AI-driven travel planning platform designed around the principles of **Japanese Minimalism**. Built for the *intentional traveler*—someone who seeks to escape the noise of generic top-10 lists and cluttered travel interfaces in favor of clarity, heritage, and tailored experiences.

---

## Core Project Identity

The name **Kanso** refers to the Zen aesthetic of simplicity and the elimination of clutter. The application mirrors this philosophy through a distraction-free UI, elegant typography, and a "Sumi-e" (ink-wash painting) inspired color palette.

---

## Key Features

### 1. AI-Powered Itinerary Engineering
- Uses **Gemini 3 Flash** to generate deeply personalized multi-day journeys
- Unlike static planners, it accounts for **"Travel DNA"**—a user's specific interests (Zen gardens, local gastronomy, hidden art) rather than just popular landmarks

### 2. Grounded Travel Essentials
- Integrates **Google Search Grounding** to provide real-world flight and hotel recommendations
- Users can select and toggle "Essential" packages (Flights and Stays) that are directly injected into their digital passport

### 3. Live Concierge Assistant
- A sophisticated chat widget that acts as a real-time co-pilot
- Supports **Speech-to-Text** for hands-free queries and **Text-to-Speech** (via Gemini TTS) for local phrase pronunciations
- Capable of live translations, currency conversions, and fetching emergency local information via grounding

### 4. Curated Collections
- A rotating library of **20+ hand-picked destinations** (from the "Nordic Silence" of Iceland to "The Art Island" of Naoshima)
- Each collection includes "Travel Essentials" like visa requirements, local etiquette, and best visiting times

### 5. Minimalist Mapping & Logistics
- An interactive **Leaflet-based** spatial interface that optimizes routes and visualizes the day's timeline
- Includes a **"Navigation Mode"** for mobile use and a high-fidelity **"Print Mode"** for offline physical copies

---

## Design Aesthetics

| Element | Description |
|---------|-------------|
| **Palette** | A base of Washi (rice paper) whites (`#FDFCF8`) contrasted with Sumi (ink) blacks (`#292524`) |
| **Typography** | Sophisticated pairing of *Playfair Display* (Serif) for narrative headers and *Inter* (Sans) for functional data |
| **Philosophy** | Employs the concept of **Ma** (negative space) to reduce cognitive load and enhance focus |

---

## Technical Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19 + Tailwind CSS |
| **Intelligence** | Google Gemini API (2.5 & 3 series) with Search and Maps grounding |
| **Database** | Neon (Serverless Postgres) for persistent user profiles and encrypted itinerary storage |
| **Security** | Client-side rate limiting and input sanitization for high-performance, cost-effective AI interactions |
