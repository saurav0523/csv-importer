# GrowEasy — AI-Powered CSV Lead Importer

An AI-powered CSV importer that ingests **any** lead export — Facebook Lead Ads, Google Ads, Excel sheets, other CRMs, or hand-built spreadsheets — regardless of column names or layout, and maps it into GrowEasy's fixed CRM schema using OpenRouter AI.

```
groweasy-csv-importer/
├── frontend/          Next.js 14 (App Router) + TypeScript + Tailwind + Axios Service Layer
├── backend/           Node.js + Express + TypeScript + PostgreSQL Database Layer
├── samples/           Example CSVs in different formats to test the importer
├── docs/              Architecture notes
└── docker-compose.yml Run both services together locally
```

---

## Key Features & Highlights

- **Intelligent Schema Mapping**: Powered by OpenRouter AI. The mapping prompts are defined in [extraction.prompt.ts](file:///Users/sauravgupta/Library/Code/groweasy-csv-importer/backend/src/ai/prompts/extraction.prompt.ts). It automatically maps irregular input columns to GrowEasy's standard CRM lead format.
- **Axios-Based Frontend Services**: Built with a clean, centralized Axios integration layer inside `frontend/src/api` featuring:
  - [axiosInstance.ts](file:///Users/sauravgupta/Library/Code/groweasy-csv-importer/frontend/src/api/axiosInstance.ts): Configures default timeout and endpoint variables.
  - [apiUtils.ts](file:///Users/sauravgupta/Library/Code/groweasy-csv-importer/frontend/src/api/apiUtils.ts): Safe error and response resolver translating status codes to readable error feedbacks.
  - [endpoints.ts](file:///Users/sauravgupta/Library/Code/groweasy-csv-importer/frontend/src/utils/endpoints.ts): Centralized endpoint registry.
- **Robust Validation Layer**: Validates all incoming AI mappings on the server using Zod validators ([validators.ts](file:///Users/sauravgupta/Library/Code/groweasy-csv-importer/backend/src/utils/validators.ts)) to catch type errors or malformed payloads before database ingestion.
- **Advanced Deduplication**:
  - **Database Deduplication**: Validates incoming leads against existing emails and mobiles in the PostgreSQL database.
  - **Batch Deduplication**: Identifies and filters out duplicate records within the same CSV upload batch.
- **Highly Concurrent Pipelines**: Batches large files (`AI_BATCH_SIZE`) and maps them using bounded concurrency pool ([batch.ts](file:///Users/sauravgupta/Library/Code/groweasy-csv-importer/backend/src/utils/batch.ts)) with automatic retries ([retry.ts](file:///Users/sauravgupta/Library/Code/groweasy-csv-importer/backend/src/utils/retry.ts)) for optimal throughput.
- **Aesthetic UI/UX**: Includes Dark Mode, beautiful glassmorphism style card layouts, a detail modal, and virtualized scrollable tables for performance under heavy workloads.

---

## Prerequisites

- **Node.js**: `v18.18` or newer.
- **PostgreSQL**: A running instance (local or hosted) to store lead entries.
- **OpenRouter API Key**: An active API Key to call AI models.

---

## Setup & Run Instructions

### 1. Database Setup

Ensure your PostgreSQL instance is running. Create a database called `groweasy` (or any name of your choice) and define its connection URI. The backend automatically runs table initialization schemas upon startup.

### 2. Backend Config & Run

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Copy the example environment template:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and fill in your keys:
   ```env
   PORT=8080
   CORS_ORIGIN=*
   OPENROUTER_API_KEY=your-openrouter-api-key
   OPENROUTER_MODEL=openrouter/free # Or any specific model
   DATABASE_URL=postgresql://username:password@localhost:5432/groweasy
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Run in development mode:
   ```bash
   npm run dev
   ```
   *The server starts at `http://localhost:8080`*

### 3. Frontend Config & Run

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Create your `.env` file:
   ```bash
   cp .env.example .env
   ```
3. Set the backend API URL inside `.env`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Run in development mode:
   ```bash
   npm run dev
   ```
   *Open `http://localhost:3000` to view the web application*

---

## Running with Docker Compose

You can boot both the frontend and backend together using [docker-compose.yml](file:///Users/sauravgupta/Library/Code/groweasy-csv-importer/docker-compose.yml):

1. Put your production environment configurations in [backend/.env](file:///Users/sauravgupta/Library/Code/groweasy-csv-importer/backend/.env) (especially `DATABASE_URL` and `OPENROUTER_API_KEY`).
2. Run Docker Compose build in the root directory:
   ```bash
   docker compose up --build
   ```
3. Access:
   - **Frontend**: `http://localhost:3000`
   - **Backend**: `http://localhost:8080`

---

## Configuration Variables

### Backend Configuration ([env.ts](file:///Users/sauravgupta/Library/Code/groweasy-csv-importer/backend/src/config/env.ts))

| Variable | Description | Default |
|---|---|---|
| `PORT` | The port Express runs on | `8080` |
| `CORS_ORIGIN` | Allowed clients (comma-separated origins or `*`) | `*` |
| `OPENROUTER_API_KEY` | Your OpenRouter AI credentials | — |
| `OPENROUTER_MODEL` | Target OpenRouter LLM ID | `openrouter/free` |
| `DATABASE_URL` | PostgreSQL DB Connection URL | — |
| `AI_BATCH_SIZE` | Chunk size of rows processed in one LLM request | `25` |
| `AI_CONCURRENCY` | Maximum concurrent LLM requests | `3` |
| `AI_MAX_RETRIES` | Max retries per failed LLM request batch | `3` |
| `MAX_FILE_SIZE_MB` | Allowed CSV upload size cap | `5` |
| `MAX_ROWS_PER_IMPORT` | Row count limit per CSV upload | `5000` |

### Frontend Configuration ([.env](file:///Users/sauravgupta/Library/Code/groweasy-csv-importer/frontend/.env))

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Backend URL used by the Axios client | `http://localhost:8080` |

---

## Testing & Validation

### 1. Automated Verification
Run unit tests inside the backend folder to ensure validators and helpers work as intended:
```bash
cd backend
npm run test
```

### 2. Manual Verification Walkthrough
- Open `http://localhost:3000` in your browser.
- Toggle between Light and Dark mode using the button at the top right of the dashboard.
- Go to the **Lead Sources** tab and click **Import Leads**.
- Drag and drop or browse any file in the `/samples` folder (e.g. `samples/facebook_leads_export.csv`).
- Review the client-side parsing preview, then click **Confirm Import**.
- After AI extraction completes, view the detailed **Parsed Lead Results** containing the status of imported and skipped rows.
- Click **Done** and navigate to the **Manage Leads** tab. Check that leads appear correctly, filter by status, search, and click individual rows to view detail cards.
