# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DarkReader** is a simple SPA (Single Page Application) server for hosting text stories in `.txt` files with randomized password-based access control (no login system). It uses role-based permissions: reader, contributor, and admin levels.

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Go 1.22 with Gorilla routing and session management
- **Deployment**: Docker + Kubernetes

## Architecture

### Backend (Go)

Located in `/src`, the backend serves two purposes:
1. **API Server**: Handles authentication, file operations, and book generation via HTTP endpoints
2. **Static File Server**: Serves the React SPA and assets

**Key modules:**
- `main.go`: HTTP routing via Gorilla mux, server initialization
- `session/`: Session validation and management (using Gorilla sessions with cookie store)
- `passwd.go`: Password-to-access-level mapping
- `texthandlers.go`: Text file read/write operations
- `textnaming.go`: Filename and directory naming conventions
- `filelisting.go`: Directory/catalog listing
- `bookgen.go`: EPUB generation from text files

**Access levels** are hierarchy-based: "reader" < "contributor" < "admin"

### Frontend (React + TypeScript + Vite)

Located in `/frontend/src`, organized by feature:
- `components/`: Page components (TextPage, HomePage, CreatePage, AppendPage)
- `components/management/`: Admin features (FileListAdmin, EditTextPage, CatalogEditPage)
- `utils/`: Helper functions (api.ts for HTTP calls, renderText.tsx for formatting, filenames.ts)

**Router** setup in `App.tsx`:
- `/` – HomePage (catalogs list)
- `/text/:catalog/:fileName` – Text reader
- `/create` – Create new text
- `/append/:catalog` – Append to existing text
- `/edit/:catalog/:file` – Edit single text
- `/edit/:catalog` – Edit catalog metadata
- `/manage` – Admin file management

## Development Commands

### Backend

```bash
# Run backend (develops on port 6969)
go run ./src

# Set custom text directory (PowerShell on Windows example)
$env:TEXT_PATH = 'secret'; go run ./src

# Build production binary
go build ./src
```

### Frontend

```bash
cd frontend

# Dev server with hot reload
npm run dev

# Build for production (TypeScript + Vite)
npm run build

# Lint TypeScript and JSX (ESLint, max-warnings: 0)
npm run lint

# Preview production build locally
npm run preview
```

### Integration

The frontend dev server proxies API requests to the backend on port 6969. Both must be running for local development:
1. Backend: `go run ./src` (runs on `:6969`)
2. Frontend: `npm run dev` in `/frontend` (typically `:5173`)

## Configuration

Backend behavior is controlled by environment variables:
- `TEXT_PATH`: Directory containing text catalogs (default: current directory)
- `MASTER_PASSWORDS_FILE`: JSON file with password-to-access-level mappings (default: `master_passwords.json`)
- `SERVER_STATIC`: Directory for static assets/SPA build (default: `static`)
- `SESSION_FILE`: Where session data is persisted (not specified = in-memory)

Example: `TEXT_PATH=./stories MASTER_PASSWORDS_FILE=./pwd.json go run ./src`

## Deployment

### Docker

```bash
# Build Docker image
make docker-build

# Push to registry
make docker-push

# Deploy to Kubernetes cluster
make deploy-service

# Redeploy (restart pods)
make redeploy
```

The Docker image includes a multi-stage build: Go backend binary + prebuilt React frontend.

### Production Build

For Windows:
1. Install .NET 6 SDK (required version, not latest)
2. Install FAKE: `dotnet tool install fake-cli -g`
3. Run: `fake run .\fakefile.fsx`

This generates a release package including built backend binary and frontend assets.

## API Routes

All API endpoints require authentication (via session cookie) except `/api/login`:

**Authentication:**
- `POST /api/login` – Authenticate with password
- `GET /api/logout` – Clear session
- `GET /api/get_login_data` – Check current session status

**Content:**
- `GET /api/text/{directory}/{filename}` – Read text file
- `GET /api/epub/{directory}` – Generate EPUB for catalog

**Catalogs:**
- `GET /api/catalogs` – List all catalogs
- `GET /api/catalog/{directory}` – Get catalog metadata

**Management** (requires appropriate access level):
- `POST /api/create` – Create new text (contributor+)
- `POST /api/append` – Append to text (contributor+)
- `POST /api/edit` – Edit text content (contributor+)
- `POST /api/editmeta` – Edit catalog metadata (admin)
- `POST /api/delete` – Delete text (admin)

## Code Patterns

**Error Handling in Backend:**
- Handlers call `checkLoggedIn()` to verify authentication and access level
- Returns HTTP status codes: 401 (Unauthorized), 403 (Forbidden), 400 (Bad Request), 500 (Server Error)

**Frontend State:**
- No global state manager; uses React Context via session checks in API calls
- `utils/api.ts` handles all HTTP communication and error responses

**Session Management:**
- Stored in browser cookies (server-side validation required)
- Backend stores session metadata independently; secret is passed in session cookie for validation

## File Structure Summary

```
darkreader/
├── src/                 # Go backend source
│   ├── session/         # Session validation
│   ├── utils/           # Go utilities
│   └── *.go             # Core handlers and logic
├── frontend/            # React + TypeScript app
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── utils/       # Utility functions
│   │   ├── App.tsx      # Router setup
│   │   └── main.tsx     # Entry point
│   ├── package.json     # Dependencies and scripts
│   └── tsconfig.json    # TypeScript config
├── Makefile             # Build/deploy targets
├── Dockerfile           # Multi-stage container build
├── go.mod, go.sum       # Go dependencies
└── README.md            # User-facing documentation
```
