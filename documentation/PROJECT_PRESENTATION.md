# Real Estate AI Lead Gen & Dashboard System
## Project Overview
This project is a comprehensive **AI-driven Lead Qualification and Dashboard System** designed specifically for the Real Estate sector. It automates the initial customer interaction, qualifies potential clients through natural language chatting, and presents real-time actionable data to sales teams via a premium, animated dashboard.

---

## 🚀 Key Features

### 1. Intelligent AI Chatbot
-   **Natural Language Processing**: Uses advanced LLMs (Google Gemini 2.0 Flash, Mistral, or HuggingFace) to converse naturally with clients in English or Arabic.
-   **Context-Aware**: Remembers conversation history (last ~3 exchanges) to provide relevant follow-ups.
-   **Smart Data Extraction**: Automatically extracts critical lead information (Name, Phone, Budget, Location, Unit Type) from unstructured chat text.
-   **Lead Scoring ("Heat Score")**: automatically calculates a score (0-100) based on budget magnitude and urgency keywords.
-   **Call Scheduling Logic**: Intelligently identifies if a call is requested and captures the "Best Time to Call" only when explicitly provided.

### 2. Real-Time Interactions Dashboard
-   **Live Metrics**: Displays "Total Leads", "Hot Leads (>75 score)", and "Projected Revenue" with animated delta indicators (e.g., `+$1M` floats up when data changes).
-   **Dynamic Visualization**: Interactive "Lead Quality Score" line chart (Chart.js) that updates in real-time every 5 seconds without page reload.
-   **Recent Interactions Table**: A paginated, sortable list of recent chats with status badges (e.g., "Call Requested") and detailed tooltips.
-   **Glassmorphism UI**: modern, aesthetically pleasing interface with Light/Dark mode toggling.

### 3. Reporting & Integrations
-   **PDF Generation**: automated generation of professional lead reports.
-   **Google Sheets Sync**: Real-time backup of leads to a Google Sheet for external team access.
-   **Legacy Java Integration**: A robust Java-based logger service for redundant data storage.
-   **SQLite Database**: Local, high-performance database for low-latency queries.

---

## 💼 Business Value & Logic

### Problem Solved
Real estate agents waste hours qualifying cold leads. This system acts as a 24/7 SDR (Sales Development Rep).

### Value Proposition
1.  **Increased Conversion**: By responding instantly and engaging users while they are interested.
2.  **Operational Efficiency**: Sales team only focuses on "Hot Leads" (Score > 75) or those who requested calls.
3.  **Data Integrity**: Unstructured chat is converted into structured, queryable database records.

---

## ⚙️ Functional Requirements

1.  **Chat Interface**
    *   System must accept user input and respond within <2 seconds (typical).
    *   System must support multiple compounds/projects data context injection.
    *   System must persist chat sessions for returning users via Cookies/SessionStorage.

2.  **Data Extraction**
    *   System must parse `call_requested` as boolean true/false.
    *   System must set `best_call_time` to NULL unless a specific time is mentioned.
    *   System must calculate `projected_revenue` based on the sum of budgets of all valid leads.

3.  **Dashboard**
    *   Dashboard must poll for new data every 5 seconds.
    *   Dashboard must animate changes to highlight activity.
    *   Dashboard must allow filtering by Date Range.

---

## 🏗️ Non-Functional Requirements

1.  **Performance**
    *   **Low Latency**: Optimized EJS rendering and lightweight frontend modules.
    *   **Concurrency**: Node.js non-blocking I/O handles multiple chat sessions simultaneously.

2.  **Reliability**
    *   **Redundancy**: Triple-layer logging (SQLite, Google Sheets, Java File Logger).
    *   **Error Handling**: Graceful fallbacks if one LLM provider (e.g., HuggingFace) is down.

3.  **Security**
    *   **Environment Variables**: exact API keys and DB paths managed via `.env`.
    *   **Input Sanitization**: Basic protection against simple injection attacks in chat.

4.  **Maintainability**
    *   **Modular Codebase**: Frontend logic separated into ES6 modules (`dashboardController.js`, `reportController.js`).
    *   **Service-Oriented Architecture**: Backend logic split into `services/` (LLM, Sheets, Logger).

---

## 🛠️ Technology Stack

*   **Frontend**: HTML5, EJS Templating, Tailwind CSS (Custom Animations), Vanilla JS (ES6 Modules), Chart.js.
*   **Backend**: Node.js, Express.js.
*   **Database**: SQLite (`leads.db`).
*   **AI/ML**: Google Generative AI SDK, Axios for REST AI APIs (Mistral/HF).
*   **Tools**: Postman (Testing), Git.
