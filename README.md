# AI Agent Workflow Builder SaaS

A multi-tenant **AI Agent Workflow Builder SaaS** platform engineered with Next.js, Nhost, Hasura GraphQL engine, and PostgreSQL. Features real-time execution streaming, Human-in-the-Loop approval gates, multi-tenant RBAC, and automated usage quota tracking.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: Next.js 14+ (App Router), React, Lucide Icons, Glassmorphism UI Design.
- **Backend Infrastructure**: Nhost (Hasura GraphQL Engine, PostgreSQL, Serverless Functions, Nhost Auth & Storage).
- **Data Layer**: PostgreSQL with row-level security (RLS) & Hasura metadata permissions.
- **Execution Engine**: TypeScript Serverless Functions with exponential retries and state machine orchestration.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- [Node.js (v18+)](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/) (for running Nhost locally)
- [Nhost CLI](https://docs.nhost.io/development-workflows/cli) (`npm install -g nhost`)

### 2. Backend Setup (Nhost)
```bash
# Navigate to backend directory
cd nhost

# Initialize and start Nhost local backend (Postgres, Hasura, Functions, Auth)
nhost up
```
*Note: `nhost up` will start Hasura GraphQL Engine on `http://localhost:8080` and Nhost Functions on `http://localhost:1337`.*

### 3. Frontend Setup (Next.js)
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📋 Key Features & Features Overview

1. **Visual Workflow Builder**: Add, configure, and re-order step nodes:
   - `llm_call`: Execute AI prompts with OpenAI fallback / stub capability.
   - `http_request`: Send HTTP GET/POST calls with automatic retries on failure.
   - `db_write`: Execute structured database writes.
   - `notify`: Dispatch webhooks / email notifications.
   - `conditional_branch`: Evaluate previous step outputs to dynamically branch workflow execution paths.
   - `approval_gate`: Pause workflow execution until an authorized user approves.
2. **Multi-Tenant RBAC**: Switch between organizations (Org A / Org B) and roles (`Owner`, `Editor`, `Viewer`).
3. **Live Execution Timeline**: Real-time streaming subscription (`step_runs`) showing per-step status, payloads, error logs, and attempt counts.
4. **Usage Quota Management**: Real-time quota tracking badge and automated execution blocking when organization limits are reached.

---

## 📄 Deliverables & References
- [`WRITEUP.md`](file:///c:/Users/shailesh/Desktop/AutoFlow/WRITEUP.md) - Detailed 1-page architecture write-up covering data schema, permission layers, and approval gate execution engine.
- [`nhost/migrations/`](file:///c:/Users/shailesh/Desktop/AutoFlow/nhost/migrations) - Timestamped PostgreSQL database migrations.
- [`nhost/metadata/`](file:///c:/Users/shailesh/Desktop/AutoFlow/nhost/metadata) - Exported Hasura metadata (actions, permission rules).
- [`nhost/functions/`](file:///c:/Users/shailesh/Desktop/AutoFlow/nhost/functions) - TypeScript Serverless Action Handlers.
