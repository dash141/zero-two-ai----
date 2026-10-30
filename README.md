# Zero Two — Afterglow

## Setup
1. Create a root `.env` file beside `package.json` and `server.js`.
2. Copy values from `.env.example`, then replace the placeholder with your private Gemini API key.
3. In the terminal run `npm install`, then `npm run dev`.
4. Open port 5173 for the website. Port 3000 is the backend and has `/api/health`.

## Files
- `src/App.jsx`: chat UI, message state, saved history, settings, wallpaper upload, export/clear.
- `src/index.css`: complete responsive pink/dark styling.
- `server.js`: Gemini API backend.
- `vite.config.js`: proxies `/api` calls to port 3000.

If replies fail, inspect the error shown in the chat and the terminal. If the selected Gemini model is unavailable to your API key, set `GEMINI_MODEL` in `.env` to a model listed as available for your key. Never put the API key in frontend code or share the `.env` file.
