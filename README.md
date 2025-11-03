
<h1 style="text-align: center;">Transaction Analyzer</h1>

<img src="img/intro.png" />

## Overview

Transaction Analyzer is a small full-stack project that provides an API and frontend for creating and managing transaction-related items, plus an ingestion pipeline for importing blockchain data into a graph database. The repository contains:

- `backend/` — TypeScript Node.js API (Serverless-ready) with GraphQL and REST handlers.
- `frontend/` — React + TypeScript single-page app.
- `ingestion/` — Python scripts and dependencies to import blockchain data (uses `web3`, `neo4j`, etc.).

## Project structure

Quick tree of the repository (trimmed to important files and folders):

```text
.
├── README.md
├── backend/
│   ├── package.json
│   ├── serverless.yml
│   ├── tsconfig.json
	│   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── handlers/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── authorizer.ts
│   │   │   │   │   ├── signIn.ts
│   │   │   │   │   └── signUp.ts
│   │   │   │   └── items/
│   │   │   │       ├── create.ts
│   │   │   │       ├── get.ts
│   │   │   │       └── list.ts
│   │   │   ├── services/
│   │   │   │   ├── graphql.service.ts
│   │   │   │   └── neo4j.service.ts
│   │   │   └── utils/
│   │   │       └── logger.ts
│   └── tests/
├── frontend/
│   ├── package.json
│   ├── src/
│   │   ├── index.tsx
│   │   ├── App.tsx
│   │   └── components/
│   │       ├── Dashboard.tsx
│   │       └── SignInForm.tsx
│   └── public/
│       └── index.html
├── ingestion/
│   ├── ingest.py
│   └── requirements.txt
└── img/

```

This is a compact view — explore each folder for more files and implementation details.

## Key features

- User authentication (Cognito-backed flows in Serverless config).
- CRUD endpoints for items, protected with an authorizer.
- Graph/neo4j integration and tooling for analyzing transaction relationships.
- Ingestion pipeline for Ethereum data (Web3 + Neo4j).

## Architecture (high level)

- Frontend (React) communicates with the Backend over HTTP/GraphQL.
- Backend is built with TypeScript and can be deployed with Serverless to AWS (Cognito + DynamoDB resources defined in `serverless.yml`).
- Ingestion (Python) pulls blockchain data and writes to Neo4j.

## Quick start — prerequisites

- Node.js >= 18, npm >= 9
- Python 3.10+ (for ingestion)
- Docker (optional, for Neo4j/local testing)

Work in Bash on Windows (WSL / Git Bash) or a UNIX-like shell for the commands below.

## Backend — run locally (development)

1. Open a terminal and install dependencies:

```bash
cd backend
npm install
```

2. Start the backend in dev mode (hot reload):

```bash
npm run dev
```

Useful backend scripts (from `backend/package.json`):

- `npm run dev` — nodemon + ts-node (development)
- `npm run build` — compile TypeScript
- `npm run start` — run compiled app (node dist/index.js)
- `npm run test` — run Jest tests
- `npm run deploy:dev` / `npm run deploy:prod` — build + `serverless deploy --stage <stage>`

Serverless configuration notes (from `serverless.yml`):

- Default provider region: `us-west-1` (override with `--region`)
- Stages: `dev`, `prod` (use `--stage` when deploying)
- Environment variables injected by Serverless: `TABLE_NAME`, `STAGE`, `REGION`, `USER_POOL_ID`, `USER_POOL_CLIENT_ID`, `ALLOWED_ORIGIN`

## Frontend — run locally

1. Install dependencies and start dev server:

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server opens a browser automatically (webpack). Production build:

```bash
npm run build
# serve the built app (uses `serve -s build -p 3000` by default in package.json)
npm run start
```

The frontend expects the backend or API to be reachable from `http://localhost:3000` (see Serverless `allowedOrigin`).

## Ingestion (Python)

The ingestion pipeline lives in `ingestion/`. Install Python requirements and run the script:

```bash
cd ingestion
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python ingest.py
```

The `requirements.txt` includes `web3`, `neo4j`, and related libraries used to fetch and store blockchain/graph data.

## Testing

Backend tests are implemented with Jest. From the `backend/` folder:

```bash
npm test
```

Frontend tests (if present) can be executed with Jest from the `frontend/` folder.

## Environment variables

Typical env vars used by the backend (some are set via `serverless.yml` when deployed):

- NODE_ENV — development|production
- TABLE_NAME — DynamoDB table name (Serverless creates `items-table-${stage}`)
- STAGE — deployment stage (dev|prod)
- REGION — AWS region
- USER_POOL_ID / USER_POOL_CLIENT_ID — Cognito identifiers
- ALLOWED_ORIGIN — e.g. `http://localhost:3000`

If you run the services locally, create a `.env` file in `backend/` with the variables your local environment needs (and add it to `.gitignore`).

## Docker / Local Neo4j (optional)

To run a local Neo4j for development, you can use the official Docker image and point the ingestion script at it. Example (Linux/WSL):

```bash
docker run --publish=7474:7474 --publish=7687:7687 --env NEO4J_AUTH=neo4j/test neo4j:5
```

Then set your Neo4j connection env vars accordingly for ingestion.

## Deployment

Backend: uses Serverless Framework. From `backend/`:

```bash
npm run build
npm run deploy:dev    # or deploy:prod
```

Frontend: build and host the static `build/` folder (the repo already contains a prebuilt `frontend/build/` for quick demo).

## Contributing

1. Fork the repo
2. Create a feature branch
3. Open a PR with a clear description and tests where appropriate

## License

MIT — see `LICENSE` (add one if missing).

## A few next steps / suggestions

- Add a small `docker-compose.yml` for running Postgres/Neo4j locally for development tests.
- Add a short API section describing GraphQL schema/endpoints and example requests.
- Add CI checks (GitHub Actions) to run lint and tests on push/PR.

---

If you want, I can also add a short API examples section (example GraphQL query / REST curl calls) or wire up a GitHub Actions CI file next.
