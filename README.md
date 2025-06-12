# LLM-GEN-REP Front-End

This React/Vite front-end communicates with a FastAPI back-end that performs large-language-model powered data analysis and report generation.

## Live Back-End URL

The application is now configured to talk to the production back-end hosted on Vercel:

```
https://llm-gen-rep-be.vercel.app
```

All API calls (e.g. `POST /analyze`, `GET /session/:id`, `GET /sessions`, `POST /export/...`) are prefixed with this URL.  During local development you may still point the front-end at a locally running API (usually `http://localhost:8000`) by searching for the base URL in the code or injecting an environment variable (see below).

## Quick Start (Development)

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Start the local back-end on port 8000
#    Only necessary if you do NOT want to use the hosted API.
#    See the back-end repo for instructions.

# 3. Launch the dev server
npm run dev

# 4. Visit the app
open http://localhost:5173
```

## Environment Variable Override

If you need to switch between environments without editing source files, you can create a local **`.env`** file and define:

```
VITE_API_BASE="http://localhost:8000"
```

Vite will expose this as `import.meta.env.VITE_API_BASE`, which you can reference in the code (a small refactor may be required if not already abstracted).

## Production Build

```bash
npm run build   # Generates static assets in dist/
```

Deploy the contents of `dist/` to any static hosting provider (Netlify, Vercel, S3, etc.).  The app will continue pointing to the live back-end on Vercel by default.
