This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


# AI prompt for the project 

Write a project documentation outline and sample content for a web app with:
	•	Search bar with autocomplete for song titles and artist names.
	•	Lyrics page showing full lyrics for a selected song.
	•	LLM-powered lyrics analysis: break lyrics into learning units and, based on user-selected difficulty, suggest vocab and grammar points.
	•	Local deck management in localStorage (no backend DB): user can add vocab/grammar items to the deck.
	•	Optional Anki export (e.g., CSV format compatible with Anki import).
The documentation should cover: overview, feature list, user flows, architecture, data structures (including the localStorage schema), and notes for future improvements.


# Documentation & Project Plan
1. Project Overview

Goal
Leverage music as a language-learning tool by combining:
	•	A song search and lyrics viewer
	•	LLM-powered breakdown of lyrics
	•	Difficulty-based vocabulary & grammar suggestions
	•	Lightweight deck management using browser localStorage
	•	Optional export to Anki-compatible format

Target users
	•	Language learners who like using songs for practice
	•	Users who already use Anki or similar flashcard tools
	•	Learners who want vocabulary & grammar explained in context

⸻

2. Core Features
	1.	Search Bar with Suggestions
	•	Users can type:
	•	Song title
	•	Artist name
	•	The search bar:
	•	Calls a search API
	•	Returns ranked suggestions
	•	Shows autocomplete dropdown with the most probable matches
	•	Selecting a suggestion navigates to the lyrics page.
	2.	Lyrics Page
	•	Displays:
	•	Song title, artist, album (if available)
	•	Full lyrics, line-by-line or stanza-by-stanza
	•	UI considerations:
	•	Scrollable lyrics area
	•	Highlight current line when user interacts with it (optional)
	3.	LLM-Based Lyrics Breakdown
	•	When the lyrics page loads:
	•	The lyrics are sent to an LLM backend endpoint
	•	The LLM:
	•	Splits lyrics into learning units (e.g., lines, phrases)
	•	Identifies vocabulary items
	•	Identifies grammar patterns
	•	Tags each item with difficulty metadata (e.g., “Beginner”, “Intermediate”, “Advanced”)
	•	The user:
	•	Selects their difficulty level (e.g., via dropdown)
	•	Sees filtered vocab/grammar suggestions based on their chosen difficulty.
	4.	Vocabulary & Grammar Suggestions
	•	For each selected line / phrase:
	•	Show vocabulary cards:
	•	word
	•	reading/pronunciation (if applicable)
	•	meaning (possibly multiple)
	•	example sentence (optional)
	•	part of speech (optional)
	•	Show grammar points:
	•	grammar pattern
	•	explanation
	•	example from the lyrics
	•	additional example sentence (optional)
	5.	Local Deck Management (via localStorage)
	•	Users can:
	•	Click “Add to Deck” on any vocabulary item
	•	Click “Add to Deck” on any grammar item
	•	Deck is stored entirely in localStorage:
	•	No external database required
	•	Good for quick prototype / local app
	•	Basic deck features:
	•	View current deck items
	•	Remove items from deck
	•	Clear entire deck
	6.	Anki Export (Optional)
	•	Users can export their deck as:
	•	CSV file that follows a simple, well-defined column format
	•	e.g., Front, Back, Type, SourceSong, SourceLine
	•	Export flow:
	•	User clicks “Export to Anki”
	•	App generates a downloadable CSV file from deck data
	•	User imports CSV into Anki manually

⸻

3. User Flows

3.1 Search & View Lyrics
	1.	User lands on home page.
	2.	Types a song or artist name into the search bar.
	3.	Autocomplete dropdown appears with suggested queries.
	4.	User selects a suggestion.
	5.	App navigates to /song/:id (lyrics page).
	6.	Lyrics are fetched and rendered.

3.2 Get Vocabulary & Grammar Suggestions
	1.	On the lyrics page, app sends lyrics (and language target) to LLM backend.
	2.	User chooses difficulty level (e.g., Beginner/Intermediate/Advanced).
	3.	App receives structured response from LLM:
	•	list of vocabulary items with difficulty & metadata
	•	list of grammar points with difficulty & metadata
	4.	App filters and displays suggestions based on selected difficulty.
	5.	User can click items to expand explanations and examples.

3.3 Build Deck in LocalStorage
	1.	From the suggestions panel or directly in the lyrics:
	•	User clicks “Add to Deck” on vocab/grammar items.
	2.	Application:
	•	Reads current deck from localStorage
	•	Appends new item (avoiding duplicates if desired)
	•	Writes updated deck back to localStorage
	3.	User visits /deck page (or deck section in UI):
	•	Sees list of all saved items
	•	Can remove or clear items.

3.4 Export Deck to Anki
	1.	User opens deck page.
	2.	Clicks “Export to Anki”.
	3.	App:
	•	Converts deck data into a CSV string with predefined headers
	•	Triggers download of e.g. lyrilearn_deck.csv
	4.	User imports CSV into Anki via Anki’s “Import” feature.

⸻

4. System Architecture

4.1 High-Level Components
	•	Frontend (Web App)
	•	UI framework (e.g., React/Next.js/Vite + React)
	•	Pages:
	•	Home/Search
	•	Lyrics Detail
	•	Deck
	•	State management:
	•	Search query & suggestions
	•	Selected song
	•	Lyrics & LLM analysis results
	•	Difficulty selection
	•	Local deck state (synced with localStorage)
	•	Backend Services
	•	Lyrics API
	•	Could be a third-party lyrics provider or a simple wrapper
	•	Endpoints:
	•	GET /search?query=...
	•	GET /lyrics/:songId
	•	LLM API
	•	Takes lyrics text and optional difficulty configuration
	•	Endpoint example:
	•	POST /analyze-lyrics
	•	Request body: { lyrics, targetLanguage, difficultyLevels }
	•	Response: { vocab: [...], grammar: [...] }
	•	Could be:
	•	Custom backend calling OpenAI / other LLM provider
	•	Serverless function