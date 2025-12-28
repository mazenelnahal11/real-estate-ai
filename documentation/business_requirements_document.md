# Business Requirements Document (BRD)
**Project:** Real Estate AI Assistant Dashboard

---

## 1. Business Need
The real estate market is highly competitive, and speed of response is a critical differentiator. Real estate professionals currently face a bottleneck in manually qualifying a high volume of leads, resulting in delayed responses, missed opportunities, and inefficient allocation of time to low-quality prospects. There is a critical need for an automated, intelligent system to filter inquiries and visualize performance data in real-time.

## 2. Problem/Opportunity Statement
**Problem:**
- Agents spend 40% of their time answering repetitive questions from unqualified leads.
- Response times often exceed 2-3 hours, leading to lead attrition.
- Lack of centralized data visualization makes it difficult to track overall pipeline health.

**Opportunity:**
Implementing an AI-driven dashboard will automate 24/7 engagement, instantaneously identifying high-value ("Hot") leads. This will enable agents to focus solely on closing deals, potentially increasing conversion rates by 15-20%.

## 3. Business Objectives
- **BO-01**: Reduce initial lead response time from hours to <5 seconds via AI automation.
- **BO-02**: Increase agent efficiency by filtering out 60% of low-intent inquiries automatically.
- **BO-03**: Provide a centralized "Deep Black" visual command center for real-time portfolio tracking.
- **BO-04**: Enhance brand perception through a premium, high-tech digital interface.

## 4. Scope Definition
The project encompasses the development of a web-based comprehensive lead management system.
- **In-Scope**: AI Chat Interface, Admin Dashboard, Heat Scoring Engine, PDF Reporting, Mobile-Responsive Web View.
- **Out-of-Scope**: Native Mobile Apps (iOS/Android) stores, Payment Processing, integration with external legacy CRM systems (Phase 2).

## 5. Stakeholder Analysis
| Stakeholder Role | Responsibility | Interest Level | Influence Level |
| :--- | :--- | :--- | :--- |
| **Product Owner** | Defines vision, accepts deliverables | High | High |
| **Real Estate Agents** | End-users, manage leads | High | Medium |
| **Lead Developer** | System architecture & implementation | Medium | High |
| **Compliance Officer** | Data privacy & disclaimer review | Low | High |

## 6. Current State Analysis
Currently, leads arrive via disparate channels (email, phone, SMS) and are manually entered into spreadsheets. There is no automated pre-qualification.
- **Process**: Manual receipt -> Manual reply -> Manual score assessment.
- **Pain Points**: High latency, data fragmentation, subjective qualification logic.

## 7. Future State Vision
A unified, "Deep Black" monochromatic web platform where:
1.  Leads converse with a context-aware AI immediately upon visiting the site.
2.  The system calculates a "Heat Score" in real-time.
3.  Agents log into a secure dashboard to view a prioritized list of "Hot Leads".
4.  Decision-making is data-driven via live charts and generated reports.

## 8. Business Requirements
- **BR-01**: The system must be accessible via standard web browsers without installation.
- **BR-02**: The system must align with the company's premium "Monochrome" brand identity.
- **BR-03**: The system must support high-volume concurrency during marketing campaigns.

## 9. Functional Requirements
### Dashboard Module
- **FR-01**: Display real-time KPI cards: Total Leads, Hot Leads (>75), Avg Score, Revenue.
- **FR-02**: Provide filtered data tables with pagination and date ranges.
- **FR-03**: Enable detailed views of chat history via modal.
- **FR-04**: Generate and download PDF reports based on active filters.

### Chat & AI Module
- **FR-05**: Integrate Google Gemini AI for contextual, natural language responses.
- **FR-06**: Display "Typing... " indicators to mimic human interaction.
- **FR-07**: Persist conversation context (last 6 messages) for continuity.

### Security
- **FR-08**: Enforce Admin Authentication with secure, HTTP-only session cookies.

## 10. Non-Functional Requirements
- **NFR-01 (Aesthetics)**: Interface must strictly adhere to the "Deep Black & Off-White" theme with heavy shadow depth (`shadow-2xl`).
- **NFR-02 (Performance)**: Dashboard data load time <2 seconds; AI latency <3 seconds.
- **NFR-03 (Scalability)**: Database architecture must support future migration from SQLite to PostgreSQL.
- **NFR-04 (Reliability)**: 99.9% uptime during business hours (8 AM - 8 PM).

## 11. Business Rules
- **BR-Rule-01 (Heat Score)**: A lead is "Hot" if Score >= 75.
- **BR-Rule-02 (Qualification)**: Score increases by +10 for budget mention, +20 for "Urgent" keywords, +15 for location specificity.
- **BR-Rule-03 (Archival)**: Chats inactive for >30 days are archived (future rule).

## 12. Data Requirements
- **Entities**: Leads, Messages, Admin_Users.
- **Data Retention**: Chat logs retained for 1 year for compliance.
- **Sync**: Real-time synchronization between Chat Interface and Dashboard view using AJAX polling.

## 13. Process Models and Workflows
**Lead-to-Agent Handover Flow:**
1.  **Start**: Lead sends message.
2.  **System**: AI analyzes intent & sentiment -> Updates Heat Score.
3.  **Decision**:
    - *If Score < 75*: AI continues nurturing.
    - *If Score >= 75*: Lead flagged as "Hot" on Dashboard.
4.  **Action**: Agent views dashboard -> Opens "Hot" Lead -> Initiates Call.
5.  **End**: Deal Closed / Lead Discarded.

## 14. Solution Scope and Features
| Feature | Priority | Sprint/Phase |
| :--- | :--- | :--- |
| AI Chatbot (Gemini) | Critical | MVP |
| Admin Dashboard | Critical | MVP |
| Heat Score Engine | High | MVP |
| PDF Reporting | Medium | MVP |
| Google Calendar Integration | Low | Phase 2 |
| Multi-Admin RBAC | Low | Phase 2 |

## 15. Assumptions
- Google Gemini API key remains valid and funded.
- Agents have basic computer literacy.
- "Deep Black" theme provides sufficient contrast for the specific target user demographic.

## 16. Constraints
- **Resource**: Single developer resource for MVP.
- **Timeline**: MVP deployment required within 2 weeks.
- **Tech Stack**: Must use Node.js, Express, EJS, and Tailwind CSS v4.

## 17. Risks and Impacts
- **Risk 1**: AI Hallucination (Providing wrong property prices).
    - *Impact*: Loss of trust/legal liability.
- **Risk 2**: SQLite Database Lock (High concurrency).
    - *Impact*: Data loss or slow response.

## 18. Risk Mitigation Approaches
- **Mitigation 1**: Implement strict prompt engineering constraints for the AI (e.g., "Do not invent prices"). Add disclaimer text.
- **Mitigation 2**: Use write-ahead logging (WAL) for SQLite or migrate to PostgreSQL if traffic exceeds 100 concurrent users.

## 19. Transition Requirements
- **Training**: 1-hour workshop for Agents on dashboard navigation.
- **Documentation**: Provide a "User Guide" PDF for the Dashboard.
- **Deployment**: Zero-downtime deployment strategy not required for MVP but planned for Phase 2.

## 20. Acceptance Criteria
1.  **Login**: User cannot access `/dashboard` without valid credentials.
2.  **Theme Check**: Application renders correctly in both Light (Off-White) and Dark (Deep Black) modes without visual breakage.
3.  **AI Response**: Chatbot answers a property query relevantly within 3 seconds.
4.  **Reporting**: PDF download initiates correctly and contains accurate filtered data.
