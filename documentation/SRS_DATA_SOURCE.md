# Software Requirements Specification (SRS) Data Source
**Standard:** ISO/IEC/IEEE 29148:2018
**Project:** Real Estate AI Assistant Dashboard

---

## 1. Introduction Data

### 1.1 Purpose
The purpose of this software is to automate the qualification and management of real estate leads through an AI-driven conversational interface and a centralized administrative dashboard. It bridges the gap between raw traffic and qualified sales opportunities.

### 1.2 Scope
- **In-Scope**:
    - AI Chatbot (Gemini 2.0 Flash) for natural language processing.
    - Deterministic "Heat Score" algorithm for lead prioritization.
    - Real-time Admin Dashboard for visualization and management.
    - PDF Reporting Module.
    - User Authentication (Admin Access).
- **Out-of-Scope**:
    - Payment processing.
    - Native mobile application development (iOS/Android).
    - Direct integration with third-party CRMs (Salesforce/HubSpot).

### 1.3 Definitions & Acronyms
- **Heat Score**: A numerical value (0-100) representing qualification level.
- **SOP**: Same-Origin Policy (Security constraint).
- **LLM**: Large Language Model (Google Gemini).
- **KPI**: Key Performance Indicator.
- **Tone Analysis**: Algorithmic determination of user sentiment (Urgent, Positive, Negative).

---

## 2. Overall Description Data

### 2.1 Product Perspective
- **System Architecture**: Monolithic Node.js/Express Application.
- **Client-Side**: Server-Side Rendered (SSR) with EJS Templates + Vanilla JS + Tailwind CSS v4.
- **Server-Side**: Node.js runtime environment.
- **Database**: SQLite (Embedded Relational DB) for zero-latency local storage.
- **External Interfaces**:
    - **Google Gemini API**: For text generation.
    - **Google Sheets API**: For fetching property "Compounds" data.
    - **Mistral/HuggingFace API**: Fallback inference endpoints.

### 2.2 Product Functions
1.  **Conversational Intelligence**: Engage users, answer property queries, maintain context (6-turn memory).
2.  **Lead Extraction**: Parse unstructured chat text into structured JSON (Name, Phone, Budget, Location).
3.  **Scoring & Prioritization**: Calculate lead value in real-time based on `ScoreService` logic.
4.  **Dashboard Visualization**: Render charts (Chart.js) and tables for data analysis.
5.  **Reporting**: Generate downloadable PDF summaries using `pdfkit`.

### 2.3 User Characteristics
- **Admin/Agent**: Non-technical users requiring an intuitive, high-contrast interface ("Deep Black" theme) for rapid decision making.
- **End-User (Lead)**: General public seeking property information via mobile or desktop browsers.

### 2.4 Constraints
- **Regulatory**: Must comply with data privacy laws (simulated via chat history retention policies).
- **Hardware**: Server must handle Node.js event loop; minimal RAM (512MB+) required for SQLite.
- **Connectivity**: Constant Internet connection required for API calls (Gemini/Sheets).

---

## 3. Specific Requirements Data (The Core)

### 3.1 Functional Requirements

#### FR-01: Chat Processing Loop
- **Input**: `POST /chat/message` { `message`: string, `chatId`: string }.
- **Process**:
    1.  Check/Generate `chatId`.
    2.  Append message to global history.
    3.  Calculate `UserResponseTime` (latency between turns).
    4.  Fetch Property Data from Google Sheets.
    5.  Call `llm.generateResponse()` with context window.
    6.  Call `llm.extractLead()` to get metadata + `tonality`.
    7.  Call `scoreService.calculateScore()` using Lead Data + Response Time.
    8.  Log data to SQLite, Sheets, and JavaLogger.
- **Output**: JSON { `reply`: string }.

#### FR-02: Heat Score Algorithm
- **Logic**: `Score = Base(20) + (Phone?25:0) + (Name?5:0) + (Budget?10:0) + (Loc?10:0) + (Unit?10:0) + ToneModifier + SpeedBonus`.
- **ToneModifier**: Urgent=+25, Positive=+10, Negative=-10.
- **SpeedBonus**: <30s reply = +10; >1hr reply = -5.
- **Constraint**: Clamped between 0 and 100.

#### FR-03: Dashboard Rendering
- **Input**: `GET /dashboard` (with Auth Cookie).
- **Process**:
    1.  Verify `auth=true` cookie.
    2.  Query SQLite for filtered leads (Date Range, Pagination).
    3.  Aggregate Metrics (Total, Hot, Revenue, Avg Score).
    4.  Render `dashboard.ejs`.
- **Output**: HTML Document (text/html).

#### FR-04: PDF Reporting
- **Input**: `GET /download-pdf?startDate=...&endDate=...`
- **Process**:
    1.  Fetch matching leads.
    2.  Initialize `PDFDocument`.
    3.  Draw Headers, Tables, and Summary Stats.
    4.  Stream bytes.
- **Output**: File Download (`application/pdf`).

### 3.2 Performance Requirements
- **Latency**: AI Response under 3.0 seconds (95th percentile).
- **Throughput**: Support 50 concurrent chat sessions.
- **Database**: SQLite queries under 50ms for datasets < 10,000 records.
- **UI Render**: Dashboard First Contentful Paint (FCP) < 1.0s.

### 3.3 Interface Requirements
- **User Interface**:
    - **Theme**: Strict Monochrome (Off-White `#F5F5F0` / Deep Black `#000000`).
    - **Font**: Sans-serif, Base Size 20px.
    - **Feedback**: "Typing..." indicators, Toast notifications for "Copied to Clipboard".
- **Software APIs**:
    - **REST API**: `/api/dashboard-stats`, `/api/chart-data`.
    - **Format**: JSON `application/json`.
- **Security**:
    - **Cookies**: `HttpOnly`, `SameSite=Strict`.
    - **Sanitization**: Basic input cleaning to prevent SQL Injection (via Parameterized Queries).

### 3.4 Data Requirements (Schema)
**Table: `leads`**
- `id` (INTEGER PRIMARY KEY)
- `chat_id` (TEXT, Index)
- `name` (TEXT, Nullable)
- `phone` (TEXT, High Priority field)
- `budget` (TEXT -> Numeric for aggregates)
- `heat_score` (INTEGER, 0-100)
- `tonality` (TEXT, Enum: 'Urgent', 'Positive', ...)
- `call_requested` (BOOLEAN/INTEGER 0-1)
- `start_time` (DATETIME)
- `summary` (TEXT)

### 3.5 Attributes
- **Reliability**: System auto-restarts on crash (via Process Manager/Docker - implied).
- **Availability**: 24/7 Uptime dependency on Google Cloud APIs.
- **Maintainability**: Modular Architecture (`/services`, `/routes`, `/views`). Code is commented and logged.

---

## 4. Verification & Validation Data

### 4.1 Acceptance Criteria
- **AC-01**: Admin can login with valid credentials; invalid attempts are rejected.
- **AC-02**: Chatbot responds to "Hello" within 3 seconds.
- **AC-03**: Mentioning a phone number in chat automatically raises Heat Score by +25 points.
- **AC-04**: Dashboard reflects new chats via "Refresh" or Polling instantly.
- **AC-05**: Generated PDF opens legibly in standard viewers (Adobe/Chrome).

### 4.2 Test Cases
- **TC-Lead-Qual**: User says "I want a villa in Cairo for 5M budget". System extracts "Villa", "Cairo", "5M", assigns appropriate score.
- **TC-Dark-Mode**: User toggles theme. Background becomes `#000000`, text becomes white. Elements remain visible.
