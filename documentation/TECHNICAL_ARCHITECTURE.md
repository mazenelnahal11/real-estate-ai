# Technical Architecture & Codebase Documentation
**Project:** Real Estate AI Assistant Dashboard
**Version:** 1.0.0
**Stack:** Node.js, Express, EJS, SQLite, Tailwind CSS v4, Google Gemini AI.

---

## 1. High-Level Architecture
The application follows a **Monolithic MVC (Model-View-Controller)** pattern with a Service-Oriented logic layer.
- **Frontend**: Server-Side Rendered (SSR) HTML via EJS templates, styled with Tailwind CSS v4. Client-side interactivity uses Vanilla JS.
- **Backend API**: Express.js REST API handling requests for Chat, Dashboard Data, and PDF Generation.
- **Logic Layer (Services)**: Discrete modules handling AI (LLM), Scoring, Database Ops, and external APIs.
- **Database**: Embedded SQLite database (`leads.db`) for zero-latency relational data storage.

---

## 2. Directory Structure & File Inventory

```
dashboard/
├── config/
│   └── db.js            # SQLite Database Connection & Schema Initialization
├── public/              # Static Assets served to client
│   ├── css/
│   │   ├── input.css    # Tailwind v4 Source (Deep Black Theme definitions)
│   │   └── style.css    # Compiled CSS
│   ├── js/
│   │   └── modules/     # Client-side Modules
│   └── images/
├── routes/              # Express Route Handlers (Controllers)
│   ├── chatRoutes.js    # Handles /chat endpoints (POST/GET)
│   └── dashboardRoutes.js # Handles /dashboard, /login, /api endpoints
├── services/            # Business Logic Layer
│   ├── chartService.js  # Prepares data for Chart.js
│   ├── javaLogger.js    # Legacy/Backup logging to external Java service
│   ├── leadService.js   # CRUD operations for Leads Metadata
│   ├── llm.js           # Google Gemini AI Integration (Chat & Extract)
│   ├── pdfService.js    # PDF Generation logic using pdfkit
│   ├── scoreService.js  # Deterministic Heat Score Algorithm
│   └── sheets.js        # Google Sheets API Integration (Property Data)
├── views/               # EJS Templates
│   ├── chat.ejs         # User-facing Chat Interface
│   ├── dashboard.ejs    # Admin Dashboard Interface
│   └── login.ejs        # Admin Login Interface
├── server.js            # Application Entry Point
├── tailwind.config.js   # Tailwind Configuration (Theme Extensions)
└── leads.db             # SQLite Database File
```

---

## 3. Core Components Detail

### 3.1. Server (`server.js`)
**Role**: The heart of the application.
- **Middleware**: Configures `cookie-parser` for auth, `express.json` for body parsing, and serves `public/` static files.
- **Routing**: Mounts `dashboardRoutes` at root (`/`) and `chatRoutes` at `/chat`.
- **Initialization**: Starts the HTTP server on Port 3001.

### 3.2. Routes (Controllers)

#### `routes/chatRoutes.js`
- **GET /**: Renders `chat.ejs`.
- **POST /message**: Main Event Loop.
    1.  Receives user message.
    2.  Calculates **Response Time** (User Latency).
    3.  Fetches **Context** (Compounds) from `sheets.js`.
    4.  Calls `llm.generateResponse()` for AI reply.
    5.  Calls `llm.extractLead()` to parse metadata.
    6.  Calls `scoreService.calculateScore()` to compute Heat Score.
    7.  Logs to all systems (DB, Sheets, JavaLogger).

#### `routes/dashboardRoutes.js`
- **GET /dashboard**: Protected route (checks `auth` cookie). Fetches aggregated metrics via `LeadService` and renders `dashboard.ejs`.
- **GET /api/dashboard-stats**: Returns JSON data for dynamic dashboard updates (AJAX).
- **GET /download-pdf**: Triggers `PdfService` to generate a report.
- **POST /login**: Authenticates admin creds (`mazenelnahal`/`1234`) and sets HTTP-only cookie.

### 3.3. Services (Logic Layer)

#### `services/scoreService.js`
**Function**: `calculateScore(leadData, responseTime)`
**Logic**: Pure deterministic function.
- **Base**: 20 points.
- **Modifiers**: Phone (+25), Urgent Tone (+25), Fast Reply (+10).
- **Output**: Integer 0-100.
- **Importance**: Replaces unreliable AI guessing with hard logic.

#### `services/llm.js`
**Dependencies**: `@google/generative-ai`
**Functions**:
- `generateResponse(msg, context, history)`: Uses Gemini 2.0 Flash with a system prompt to act as a Real Estate Assistant.
- `extractLead(chatHistory)`: Uses a specialized prompt to extract JSON metadata (Name, Budget, Location, **Tonality**) from unstructured text.

#### `services/sheets.js`
**Dependencies**: `googleapis`
**Functions**:
- `getCompounds()`: Fetches property data from Google Sheets to ground the AI's knowledge.
- `saveLead()`: Appends new lead rows to a spreadsheet for backup/marketing.

#### `services/leadService.js`
**Function**: Abstraction over `db.js`.
- `getDashboardMetrics()`: Complex SQL queries to count Total/Hot leads and calculate Avg Score and Revenue.
- `getLeads(filters)`: Dynamic SQL builder for pagination and date filtering.

#### `services/pdfService.js`
**Dependencies**: `pdfkit`
**Function**: Generates visual PDF reports. Draws headers, verified tables, and summary statistics pixel-by-pixel.

### 3.4. Views (Frontend)

#### `views/dashboard.ejs`
- **Architecture**: Monolithic View. Contains HTML structure + Inline Script for Chart.js and Polling.
- **Theme**: "Deep Black" (`bg-zinc-950`) / "Off-White".
- **Interactivity**:
    - **Polling**: `fetchDashboardStats()` runs every 30s to update numbers without reload.
    - **Modals**: Custom implementation for viewing chat history.
    - **Chart.js**: Renders the "Lead Quality" line chart.

#### `views/chat.ejs`
- **Architecture**: Single Page Application (SPA) feel within an EJS file.
- **Interactivity**: `sendMessage()` function handles AJAX POST to server and appends HTML bubbles dynamically.
- **Theme**: Fully Monochrome. User bubbles adapt (Black in Light Mode, White in Dark Mode).

#### `views/login.ejs`
- **Design**: Floating Glassmorphism card with deep `shadow-2xl`.
- **Logic**: Simple Form POST.

### 3.5. Database (`config/db.js`)
**Schema**:
- **Table `leads`**:
    - `chat_id` (Primary Key, String)
    - `name`, `phone`, `budget`, `location` (Text)
    - `heat_score` (Integer)
    - `call_requested` (Boolean)
    - `tonality` (Text)
    - `start_time` (Datetime)

---

## 4. Data Flow

### 4.1. Chat Data Flow
1.  **User** types "Hi".
2.  **Client** (`chat.ejs`) -> POST `/chat/message`.
3.  **Server** (`chatRoutes.js`) -> `llm.js` (Gemini API) -> Generates "Hello!".
4.  **Server** -> `llm.js` (Extract) -> Gets JSON `{tonality: 'Neutral'}`.
5.  **Server** -> `scoreService.js` -> Calculates Score `20`.
6.  **Server** -> **DB** (Insert/Update) AND **Sheets** (Append).
7.  **Server** -> Response `{reply: 'Hello'}` to Client.
8.  **Client** renders message.

### 4.2. Dashboard Update Flow
1.  **Admin** loads `/dashboard`.
2.  **Server** (`dashboardRoutes`) -> `leadService.getDashboardMetrics()`.
3.  **LeadService** -> `SELECT count(*) FROM leads...`.
4.  **Server** renders HTML with initial numbers.
5.  **Client** (`dashboard.ejs` JS) -> `setInterval` -> GET `/api/dashboard-stats`.
6.  **Client** updates DOM elements if numbers change.

---

## 5. Security Features
1.  **Authentication**: Simple Hardcoded Admin check, protected by `httpOnly` cookies.
2.  **Environment Variables**: API Keys (Gemini, Sheets) stored in `.env` (not committed).
3.  **Input Validation**: Basic sanitization via Parameterized SQL Queries to prevent Injection.
