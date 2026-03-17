# Concept Analogy Research Tool

A single-page web application that helps academic researchers strengthen arguments in their papers by finding structural analogies from other academic fields.

## Tech Stack

- **Backend**: FastAPI, `uv`, `pymupdf`, `python-docx`
- **Frontend**: React (Vite), Cytoscape.js, `lucide-react`
- **AI**: Gemini 2.0 Flash (default), GPT-4o, Claude 3.5 Sonnet
- **Academic Data**: OpenAlex API

## Setup

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Sync dependencies using `uv`:
   ```bash
   uv sync
   ```
3. Setup environment variables:
   ```bash
   cp .env.example .env
   ```
4. Set `AI_PROVIDER` to `gemini`, `openai`, or `claude` and add your corresponding API key.
5. Run the server:
   ```bash
   uv run uvicorn main:app --reload --port 8000
   ```

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:5173](http://localhost:5173) (Vite default) or the URL shown in your terminal. Note: The project request suggested [http://localhost:3000](http://localhost:3000), but Vite defaults to 5173. You can override it if desired.

## Switching AI Provider

Change `AI_PROVIDER` in your `.env` file and restart the backend. No code changes needed.
- `gemini` → uses `gemini-3-pro-preview`
- `openai` → uses `gpt-4o`
- `claude` → uses `claude-3-5-sonnet-20240620`
