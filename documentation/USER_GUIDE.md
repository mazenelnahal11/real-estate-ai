# User Guide: Real Estate AI Assistant Dashboard

## 1. Introduction
Welcome to the **Real Estate AI Assistant**, a next-generation platform designed to automate lead qualification and provide real-time insights into your sales pipeline. This guide covers everything you need to know to effectively use the dashboard, manage leads, and leverage the AI chatbot.

---

## 2. Getting Started

### 2.1. Accessing the Platform
- **URL**: Navigate to `http://localhost:3001/` (or your deployed domain).
- **Login**: You will be presented with a secure "Admin Access" card.
    - **Username**: `mazenelnahal` (Default)
    - **Password**: `1234` (Default)
- **Security**: The system uses secure, HTTP-only cookies. Your session will remain active for 15 minutes before requiring re-authentication.

### 2.2. The Interface Theme
The application features a premium **Monochrome Design** available in two modes:
- **Light Mode**: "Off-White" background with high-contrast black text. Ideal for bright environments.
- **Dark Mode**: "Deep Black" background with white text and subtle border highlights. Ideal for low-light settings.
- **Toggle**: Click the **Sun/Moon icon** in the top-right header to switch themes instantly.

---

## 3. Dashboard Overview

Upon logging in, you are greeted by the **Sales Dashboard**. This is your command center.

### 3.1. Key Performance Indicators (KPI Cards)
Located at the top, these cards provide an instant snapshot of your performance:
1.  **Total Leads**: The cumulative number of chats processed by the AI.
2.  **Hot Leads**: The number of leads with a Heat Score > 75 (High Priority).
3.  **Avg Heat Score**: The average quality score of all current leads.
4.  **Projected Revenue**: An estimate based on the combined budgets of all leads.

### 3.2. Lead Quality Chart
The **"Lead Quality Score"** line chart visualizes the trend of lead quality over the last 24 hours.
- **Upward Trend**: Indicates marketing campaigns are attracting better-qualified prospects.
- **Downward Trend**: Suggests a need to refine marketing targeting.

### 3.3. Recent Interactions Table
This is the main workspace. It displays a list of the most recent conversations.
- **Columns**:
    - **Lead**: Name and Phone Number (if captured).
    - **Status**: "Active" or "Cold".
    - **Budget**: The stated budget (e.g., "$5,000,000").
    - **Score**: The calculated Heat Score badge.
    - **Summary**: A one-line AI-generated summary of the chat.

---

## 4. Managing Leads

### 4.1. Understanding the "Heat Score"
The system uses a **Deterministic Scoring Algorithm** (0-100) to rank leads. It is NOT a random guess.
- **Base Score**: Every lead starts at 20.
- **Qualifiers (+10 to +30)**: Points are added for providing Name, Phone (Gold Standard +25), Budget, and Location.
- **Tonality (+10 to +25)**: "Urgent" or "Positive" language boosts the score. "Negative" language lowers it.
- **Speed (+5 to +10)**: Leads who reply quickly (< 1 min) get a bonus.
- **Call Requested (+20)**: Explicitly asking for a call significantly boosts the score.

**Badges:**
- **White/Black Badge (Score > 80)**: **HOT**. Contact immediately.
- **Gray Badge (Score 50-79)**: **WARM**. Follow up within 2 hours.
- **Light Gray (Score < 50)**: **COLD**. Low priority.

### 4.2. Viewing Interaction Details
To see the full context of a lead:
1.  Click the **"View"** button on any row in the table.
2.  A **Modal** will appear displaying:
    - **Full Chat History**: Read the exact conversation.
    - **Extracted Metadata**: Structured data (Location, Compound, Unit Type).
    - **Best Call Time**: The user's preferred contact window.
3.  **Copy to Clipboard**: Click the "Copy" button to instantly grab all lead details for pasting into WhatsApp or CRM.

### 4.3. Filtering and Pagination
- **Pagination**: Use the numbered buttons at the bottom to navigate through older leads.
- **Dates**: Use the "Start Date" and "End Date" pickers to analyze performance for a specific week or month.

---

## 5. Reports

### 5.1. Generating a PDF Report
Need to share data with stakeholders?
1.  Apply any desired Date Filters.
2.  Click the **"Generate Report"** button in the top-right corner.
3.  A professional PDF file will automatically download, containing:
    - Executive Summary of metrics.
    - Detailed list of filtered leads.
    - Formatting optimized for print.

---

## 6. The AI Chat Experience

Your clients interact with **Google Gemini 2.0 Flash**, a state-of-the-art AI.
- **Context Aware**: The AI remembers the last ~6 messages, allowing for natural, flowing conversations.
- **Compound Knowledge**: It has access to your specific property database (Locations, Prices) via Google Sheets integration.
- **Goal-Oriented**: The AI is instructed to naturally qualify the lead (ask for Budget, Unit Type) without sounding robotic.
- **Typing Indicators**: The chat interface shows a "Typing..." animation to mimic human behavior.

---

## 7. Troubleshooting

**Q: The "Heat Score" seems low for a good lead.**
*A: Check if the lead provided a Phone Number. The algorithm heavily weights contact info (+25 points). If the user was vague, the score remains low to prevent false positives.*

**Q: I can't log in.**
*A: Ensure you are using the correct credentials and that your browser accepts cookies. Try refreshing the page if the session expired.*

**Q: The Dashboard looks broken on my phone.**
*A: The system is responsive, but for complex data tables, a Tablet or Desktop view is recommended for the best experience.*

**Q: How do I clear the chat history?**
*A: In the Chat Interface (User side), click the "Trash Can" icon in the header to reset the conversation.*
