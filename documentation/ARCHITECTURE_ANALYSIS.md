# System Architecture Analysis & Evaluation

## 1. Architectural Classification
**Current Pattern:** **Layered Modular Monolith (MVC)**

The system is architected as a cohesive **Monolithic Application** running on a Node.js runtime. It strictly follows the **Model-View-Controller (MVC)** design pattern, though "Models" are implemented via a Service Layer abstraction rather than strict ORM classes.

- **Presentation Layer (View)**: EJS Templates rendered on the server. Low client-side complexity.
- **Control Layer (Controller)**: Express Routes (`dashboardRoutes`, `chatRoutes`) handling HTTP requests and orchestrating services.
- **Domain/Service Layer (Model)**: `services/` directory containing business logic (`ScoreService`, `LLMService`) and data access.
- **Persistence Layer**: Embedded SQLite database.

---

## 2. Component Analysis

### A. The "Smart" Monolith
Unlike a "Spaghetti Code" monolith, this system uses **Modular Services**. The logic for AI interaction, Scoring, and PDF generation is isolated in separate files. This makes the codebase **maintainable** and **testable**.
- **Strength**: Rapid development, simple deployment (single process), zero network latency between business logic and database.
- **Weakness**: Tightly coupled. If the PDF generation hangs the CPU, the Chat interface is partially affected (due to Node's single thread, though `await` helps).

### B. Hybrid Data Strategy
The system uses a unique hybrid approach to data:
1.  **Transactional Data (SQLite)**: High-speed, ACID-compliant storage for Leads and Chat Logs. Perfect for read-heavy dashboards.
2.  **Contextual Data (Google Sheets)**: Acting as a "Headless CMS" for property data (Compounds). This allows non-technical stakeholders to update property prices/availability in Sheets without deploying code.
3.  **AI Metadata**: Unstructured text is parsed into structured JSON tables.

### C. The Deterministic Scoring Engine
The architecture creates a robust **Decision Support System**.
- Instead of relying on AI "hallucinations" for lead scoring, the **ScoreService** acts as a deterministic logic gate.
- **Flow**: `Input -> AI Extraction -> Logic Gate (ScoreService) -> Persistence`. 
- This architecture ensures consistency and reliability, a critical business requirement.

---

## 3. Evaluation: Strengths vs. Weaknesses

### Strengths
1.  **Performance (Latency)**: Utilizing **SQLite** eliminates network round-trips to a database server. For a read-heavy dashboard, this provides near-instant page loads (<50ms).
2.  **Simplicity**: Deployment is trivial (one container/process). No complex microservice orchestration needed.
3.  **Cost Efficiency**: Runs on minimal hardware (even a 512MB RAM instance). Low reliance on paid external infrastructure.
4.  **SEO & First-Paint**: Server-Side Rendering (EJS) ensures the browser receives fully populated HTML, improving perceived performance on low-end devices.

### Weaknesses (Risks)
1.  **Horizontal Scalability**: SQLite is a file-based lock. If traffic exceeds ~50-100 concurrent write operations per second, the DB will lock. You cannot simply spin up multiple instances of the app without migrating to a shared DB (PostgreSQL).
2.  **Single Point of Failure**: The application manages its own state and logging. If the Node process crashes, all active chat contexts in memory (if any non-persisted) are lost.
3.  **Long-Polling**: The dashboard uses client-side polling (`setInterval`). At scale, 1000 admins polling every 30s = 33 requests/sec idle load. WebSockets would be architecturally superior for real-time updates.

---

## 4. Verdict & Recommendations
**Verdict**: The current architecture is **Optimal for MVP and SMB Scale**. It strikes a perfect balance between complexity and functionality. It is robust, easy to iterate on, and fast.

**Future Path (Phase 2):**
To scale to Enterprise level:
1.  **Migrate DB**: Switch from SQLite to **PostgreSQL** (managed).
2.  **External Cache**: Introduce **Redis** for session storage and chat history, decoupling state from the app process.
3.  **Real-Time**: Replace Dashboard Polling with **Socket.io** (WebSockets) for event-driven updates.
