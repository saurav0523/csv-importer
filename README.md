# GrowEasy CSV Importer

Hey! This is a little weekend project I put together to solve the headache of importing messy CSV leads (from Facebook Ads, random spreadsheets, etc.) into our fixed CRM schema. Instead of writing a million regex rules, I hooked it up to OpenRouter to let AI figure out the column mapping.

## What's inside

- **Frontend**: Next.js 14 (App Router) + Tailwind. I tried to keep the styling mostly utility-based, though I'm currently migrating away from some old global dark mode CSS hacks.
- **Backend**: Node.js, Express, and PostgreSQL. It uses Zod to validate the AI responses because LLMs can be flaky sometimes.
- **AI Magic**: Check out `extraction.prompt.ts` in the backend to see the prompt I'm using for OpenRouter.

## Getting Started

You'll need Node 18+ and a local Postgres DB running.

### 1. Database

Make sure Postgres is running locally. Just create a database called `groweasy` (the app will handle creating tables when it boots).

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

**Note**: You *must* add your OpenRouter API key to the `.env` file, or the AI mapping will just fail silently (TODO: add better error handling for missing keys).

### 3. Frontend

In a new terminal:
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Go to `http://localhost:3000`.

## Docker

If you don't want to deal with local setup, you can just use `docker-compose up --build`. Just remember to stick your `OPENROUTER_API_KEY` and DB credentials in `backend/.env` first.

## Known Issues / TODOs

- Large CSVs (like 10k+ rows) might take a while because of rate limits with the free OpenRouter models. I batched it up, but it can still timeout on slow connections.
- Still working on replacing some of the global CSS hacks I used for dark mode with proper Tailwind classes.

Feel free to open an issue if you find a bug!
