# LLM-GEN-REP Front-End

This React/Vite front-end communicates with a FastAPI back-end that performs large-language-model powered data analysis and report generation.

## Live Back-End URL

The application **defaults** to the production back-end hosted on Vercel:

```
https://llm-gen-rep-be.vercel.app
```

All API calls (e.g. `POST /process`, `GET /session/:id`, `GET /sessions`, `POST /visualize/zip`, `POST /export/...`) are prefixed with this URL. During local development you **may** override this by pointing to a locally running API (e.g. `http://localhost:8000`) via an environment variable or editing the source.

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
VITE_API_BASE_URL="http://localhost:8000"
```

Vite will expose this as `import.meta.env.VITE_API_BASE`, which you can reference in the code (a small refactor may be required if not already abstracted).

## API Endpoints

Key routes exposed by the back-end include:

- `POST /process` - analyze uploaded files or ZIP bundles automatically.
  Include an `upload_type` form field set to `zip`, `tabular`, or `mixed` so
  the back-end can route the request appropriately.
- `POST /visualize/zip` - generate slide decks from a ZIP upload.
- `GET /session/:id` - retrieve a previous session.
- `GET /sessions` - list recent sessions.
- `POST /export/...` - export charts or dashboards.

### ZIP Upload Example

1. Choose a `.zip` archive containing CSV or Excel files.
2. Submit your initial query with the files attached. The front-end will send `upload_type=zip` to `/process`.
3. After processing, click **Generate Slides** to send the same archive to `/visualize/zip`.
4. Returned slide images will display inline.

The backend currently accepts archives up to **20&nbsp;MB** in size.

## Production Build

This project uses a `vercel.json` file for deployment settings. In Vercel you can
set the API endpoint by adding **VITE_API_BASE_URL** under
**Project Settings → Environment Variables**.

```bash
npm run build   # Generates static assets in dist/
```

The build output lives in the `dist/` directory. Deploy its contents to any
static hosting provider (Netlify, Vercel, S3, etc.). When deploying on Vercel the
build command and output directory are read from `vercel.json`. The app will
continue pointing to the live back-end on Vercel by default.
