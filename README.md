# RecipeAtlas

A global recipe-sharing platform. Browse recipes by **country → state/region**, search by name/ingredient/tag, and publish your own recipes — with Claude AI auto-suggesting tags, writing a short summary, and surfacing genuinely similar recipes already on the site.

Built with **React (Vite)**, **Node.js + Express**, **MongoDB**, and the **Claude API**.

![stack](https://img.shields.io/badge/stack-MERN%20%2B%20Claude-16242B)

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Sample data](#sample-data)
- [API reference](#api-reference)
- [Architecture notes & decisions](#architecture-notes--decisions)
- [Roadmap ideas](#roadmap-ideas)

---

## Features

- **Home page** — search bar, a stylized atlas with a pin for every country that has recipes, popular tags, latest recipes.
- **Country → State → Recipes browsing** — only countries/states that actually contain a recipe are ever shown; there's no way to land on an empty region.
- **Search + filter** — search by recipe name, ingredient, or tag; combine with one or more tag filters (AND logic).
- **Recipe submission** — recipe name, country, state/region, ingredients, instructions, optional tags, optional image upload.
- **Recipe details page** — image, full ingredient list, numbered instructions, tags, date added, and an AI-written summary.
- **AI features (Claude)**
  - **Automatic tag suggestions** when a recipe is submitted without tags (or on-demand via a "Suggest tags with AI" button).
  - **Recipe summary** generated automatically for every recipe.
  - **Similar recipe suggestions** — grounded in the actual database (see [Architecture notes](#architecture-notes--decisions) for why this isn't a free-form AI guess).
- **Full CRUD** — create, read, update, delete recipes, including replacing the image.

## Tech stack

| Layer    | Choice                                                                 |
| -------- | ----------------------------------------------------------------------|
| Frontend | React 18, Vite, React Router v6, Tailwind CSS, axios, lucide-react    |
| Backend  | Node.js, Express, Mongoose                                            |
| Database | MongoDB (text index for search)                                       |
| AI       | Claude API via `@anthropic-ai/sdk` (model: `claude-sonnet-4-6`)       |
| Uploads  | Multer (local disk storage, served statically)                        |

## Project structure

```
RecipeAtlas/
├── backend/
│   ├── config/db.js                 # Mongoose connection
│   ├── models/
│   │   ├── Recipe.js                # Recipe schema + text index
│   │   └── Tag.js                   # Tag usage tracking
│   ├── controllers/
│   │   ├── recipeController.js      # CRUD, search, similar-recipes
│   │   ├── locationController.js    # countries / states / recipes-by-state
│   │   ├── tagController.js         # tag list for filter UI
│   │   └── aiController.js          # standalone Claude preview endpoints
│   ├── routes/                      # one file per controller
│   ├── middleware/
│   │   ├── upload.js                # Multer image upload config
│   │   └── errorHandler.js          # centralized error responses
│   ├── utils/
│   │   ├── claudeClient.js          # all Claude API calls live here
│   │   ├── curatedTags.js           # shared official tag vocabulary
│   │   └── asyncHandler.js
│   ├── seed/
│   │   ├── sampleData.js            # 14 sample recipes, 7 countries
│   │   └── seed.js                  # `npm run seed` / `npm run seed:destroy`
│   ├── uploads/                     # uploaded recipe images (gitignored)
│   ├── server.js
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/              # Navbar, RecipeCard, CountryMap, TagFilter, ...
    │   ├── pages/                   # Home, SearchPage, CountryPage, StatePage,
    │   │                            # RecipeDetails, AddRecipe (also used for edit)
    │   ├── services/api.js          # single axios client, one function per endpoint
    │   ├── utils/                   # tag color mapping, map coordinate projection
    │   ├── App.jsx / main.jsx
    │   └── index.css
    ├── tailwind.config.js           # design tokens (palette, type, shadows)
    └── .env.example
```

## Getting started

You'll need **Node.js 18+** and a running **MongoDB** instance (local or [Atlas](https://www.mongodb.com/atlas)).

### 1. Clone and install

```bash
git clone <your-fork-url> recipeatlas
cd recipeatlas

cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment variables

```bash
# from the backend/ folder
cp .env.example .env
# then edit .env: set MONGO_URI and ANTHROPIC_API_KEY

# from the frontend/ folder
cp .env.example .env
# the default (blank) is correct for local dev — see Environment variables below
```

### 3. Seed sample data (optional but recommended)

```bash
cd backend
npm run seed
```

This inserts 14 sample recipes across 7 countries (India, Italy, Japan, Mexico, France, USA, Thailand) so you can try the browsing/search/filter flows immediately, even before adding an Anthropic API key. Run `npm run seed:destroy` to wipe and start over.

### 4. Run both servers

```bash
# Terminal 1
cd backend
npm run dev          # http://localhost:5000

# Terminal 2
cd frontend
npm run dev           # http://localhost:5173
```

Open **http://localhost:5173**. The Vite dev server proxies `/api/*` and `/uploads/*` to the backend, so you don't need to configure CORS for local development.

### 5. Build for production

```bash
cd frontend
npm run build         # outputs static files to frontend/dist
```

Serve `frontend/dist` with any static host or behind the same reverse proxy as the backend, and point `VITE_API_BASE_URL` at the deployed API if they're on different domains.

## Environment variables

### `backend/.env`

| Variable           | Description                                               | Default                                    |
| ------------------- | ----------------------------------------------------------| ------------------------------------------- |
| `PORT`              | Express port                                               | `5000`                                      |
| `MONGO_URI`         | MongoDB connection string                                  | `mongodb://127.0.0.1:27017/recipeatlas`     |
| `ANTHROPIC_API_KEY` | Claude API key — get one at console.anthropic.com          | _(required for AI features)_                |
| `CLAUDE_MODEL`      | Model used for all three AI features                        | `claude-sonnet-4-6`                         |
| `CLIENT_ORIGIN`     | Comma-separated allowed CORS origins                        | `http://localhost:5173`                     |
| `MAX_UPLOAD_MB`     | Max recipe image size                                       | `5`                                          |

**Without `ANTHROPIC_API_KEY` configured:** the rest of the app works normally — recipes can still be created, browsed, searched, and filtered. Tag suggestion, summary generation, and similar-recipe ranking simply no-op (logged as a warning) rather than failing the request.

### `frontend/.env`

| Variable             | Description                                                                 |
| --------------------- | ---------------------------------------------------------------------------- |
| `VITE_API_BASE_URL`   | Leave blank for local dev (uses the Vite proxy). Set for production builds.  |

## Sample data

`backend/seed/sampleData.js` ships with 14 hand-written recipes spanning:

- 🇮🇳 India — Kerala, Maharashtra, Tamil Nadu
- 🇮🇹 Italy — Tuscany, Sicily
- 🇯🇵 Japan — Hokkaido, Kansai
- 🇲🇽 Mexico — Oaxaca
- 🇫🇷 France — Provence
- 🇺🇸 USA — Louisiana
- 🇹🇭 Thailand — Bangkok

This is enough data to exercise every browsing path (country with one state vs. multiple states), every curated tag, and the search/filter combination logic.

## API reference

Base URL: `http://localhost:5000`

### Recipes

| Method | Path                     | Description                                                        |
| ------ | ------------------------- | -------------------------------------------------------------------|
| GET    | `/api/recipes/latest`     | Latest recipes (`?limit=8`)                                         |
| GET    | `/api/recipes/search`     | Search/filter (`?q=&tags=a,b&country=&state=`)                      |
| GET    | `/api/recipes/:id`        | Recipe details                                                      |
| GET    | `/api/recipes/:id/similar`| Claude-ranked similar recipes                                       |
| POST   | `/api/recipes`            | Create a recipe (multipart/form-data, field `image` for the photo)  |
| PUT    | `/api/recipes/:id`        | Update a recipe                                                     |
| DELETE | `/api/recipes/:id`        | Delete a recipe                                                     |

`POST`/`PUT` body fields: `recipeName`, `country`, `state`, `author` (optional), `ingredients` (JSON array string), `instructions` (JSON array string), `tags` (JSON array string, optional — omit/empty to trigger AI tag suggestion on create), `image` (file, optional).

### Locations

| Method | Path                                                         | Description                          |
| ------ | -------------------------------------------------------------| --------------------------------------|
| GET    | `/api/locations/countries`                                   | Countries with at least one recipe    |
| GET    | `/api/locations/countries/:country/states`                   | States in that country with recipes   |
| GET    | `/api/locations/countries/:country/states/:state/recipes`    | Recipes in that state                 |

### Tags

| Method | Path         | Description                                                    |
| ------ | -------------| -----------------------------------------------------------------|
| GET    | `/api/tags`  | Curated + in-use tags with usage counts, for the filter UI        |

### AI (standalone preview endpoints)

| Method | Path                       | Body                                                          |
| ------ | ---------------------------| ---------------------------------------------------------------|
| POST   | `/api/ai/generate-tags`    | `{ recipeName, ingredients: [...], instructions: [...] }`      |
| POST   | `/api/ai/generate-summary` | `{ recipeName, country, state, ingredients, instructions, tags }` |

## Architecture notes & decisions

A few choices worth knowing about if you're reading this code as a portfolio piece:

- **No separate Country/State collections.** `country` and `state` are plain strings on each `Recipe`. The spec only requires `Recipe` and `Tag` models, and Mongo's `distinct()`/aggregation makes deriving "countries/states that currently have recipes" cheap and always-correct — a denormalized Country/State collection would just be more state to keep in sync, and risks showing an "empty" region if a sync step is missed.
- **Similar recipes are grounded in MongoDB, not invented by Claude.** Claude has no knowledge of what's actually in your database, so asking it to "recommend similar recipes" from memory would risk recommending dishes that don't exist in your data. Instead, `recipeController.getSimilarRecipes` first runs a cheap Mongo query for real candidates that already overlap on tags/ingredients, and only asks Claude to **re-rank that closed list** and explain why. Every returned id is validated against the candidate set server-side before being used — a malformed or hallucinated index simply gets filtered out, and the UI falls back to the raw overlap-ranked candidates if the AI call fails entirely.
- **Summaries are always AI-generated, tags only sometimes.** The submission form doesn't ask the user to write a summary at all — `Recipe.summary` only exists because Claude wrote it. Tags, by contrast, are user-editable; Claude only fills them in when the user leaves the field blank, and the "Suggest tags with AI" button lets the user preview/accept suggestions before publishing.
- **Local disk storage for images**, not S3/Cloudinary, so the project runs with zero external accounts beyond MongoDB and an Anthropic key. `middleware/upload.js` is the only file that would need to change to swap in a cloud bucket later.
- **Search uses a MongoDB text index** (weighted: name > tags > ingredients) with a regex fallback for partial/substring queries that `$text`'s whole-word matching would otherwise miss (e.g. "fish" inside "shellfish").

## Roadmap ideas

Left out to keep this a focused portfolio project, but natural next steps:

- User accounts/auth (recipes currently store a free-text `author` name, not a user id)
- Recipe ratings/comments
- Pagination on `/search` and `/latest` for large datasets
- Cloud image storage + responsive image variants
- Automated tests (Jest/Supertest for the API, Vitest/RTL for the frontend)
