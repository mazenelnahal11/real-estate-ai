# Real Estate AI Assistant Dashboard 🏢🤖
![License](https://img.shields.io/badge/license-MIT-blue.svg) ![Node](https://img.shields.io/badge/node-v18%2B-green.svg) ![Status](https://img.shields.io/badge/status-MVP-orange.svg)
A premium, fast, and intelligent **Lead Qualification System** designed for modern real estate professionals. This application leverages **Google Gemini AI** to automate customer interactions, calculate granular "Heat Scores" for leads, and provide actionable insights via a sleek "Deep Black" monochrome dashboard.
## ✨ Key Features
*   **🤖 AI-Powered Chat**: Uses Gemini 2.0 Flash for natural, context-aware property discussions.
*   **🔥 Heat Score Algorithm**: Deterministic scoring (0-100) based on Budget, Urgency, and Phone Number capture.
*   **🎨 Premium Monochrome UI**: A strict "Deep Black & Off-White" aesthetic designed for high-end branding.
*   **📊 Real-Time Dashboard**: Live metrics, lead tables, and interactive performance charts.
*   **📂 Multi-Source Logging**: Persists data to standard **SQLite**, **Google Sheets**, and an external Java Logger.
*   **📄 PDF Reporting**: One-click generation of professional lead reports.
*   **⚡ Zero-Latency Performance**: Optimized monolithic architecture with embedded database storage.
## 🛠️ Tech Stack
*   **Backend**: Node.js, Express.js
*   **Frontend**: EJS Templates, Tailwind CSS v4, Vanilla JS
*   **Database**: SQLite3
*   **AI Engine**: Google Generative AI (Gemini)
*   **External Integration**: Google Sheets API
## 🚀 Getting Started
### Prerequisites
*   Node.js (v18 or higher)
*   Git
### Installation
1.  **Clone the repository**
    ```bash
    git clone https://github.com/mazenelnahal11/real-estate-ai.git
    cd real-estate-ai
    ```
2.  **Install Dependencies**
    ```bash
    cd dashboard
    npm install
    ```
3.  **Configure Environment**
    Create a `.env` file in the `dashboard` directory with your keys:
    ```env
    GEMINI_API_KEY=your_key_here
    GOOGLE_SHEETS_ID=your_sheet_id
    GOOGLE_APPLICATION_CREDENTIALS=./path_to_creds.json
    ```
4.  **Run the Application**
    ```bash
    node server.js
    ```
    Visit `http://localhost:3001` in your browser.
## 🔐 Login Credentials
*   **Username**: `mazenelnahal`
*   **Password**: `1234`
## 📂 Project Structure
```
├── dashboard/           # Main Node.js Application
│   ├── config/          # Database & Environment Config
│   ├── services/        # Logic (AI, Scoring, PDF)
│   ├── routes/          # API & Page Controllers
│   ├── views/           # EJS Templates
│   └── public/          # Static Assets (CSS/JS)
├── java_logger/         # Secondary Logging Service (Java)
└── documentation/       # Comprehensive Architecture & Requirements Docs
```
## 📖 Documentation
Detailed documentation is available in the `documentation/` folder:
*   [Technical Architecture](documentation/TECHNICAL_ARCHITECTURE.md)
*   [User Guide](documentation/USER_GUIDE.md)
*   [Business Requirements](documentation/business_requirements_document.md)
## 🤝 Contributing
1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
