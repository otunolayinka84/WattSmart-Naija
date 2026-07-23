# WattSmart Naija — AI Energy Efficiency Advisor
[Project link](https://wattsmart-naija.ai.studio)
> **Know your usage, save cost.**  
> Empowering Nigerian households and SMEs to navigate grid tariff bands, optimize generator running costs, and size solar hybrid systems with data-driven AI intelligence.
---

## 📌 Overview

**WattSmart Naija** is a full-stack, AI-powered energy management and audit platform tailored specifically for the unique energy realities of Nigeria. By integrating official **Nigerian Electricity Regulatory Commission (NERC)** tariff structures, regional Distribution Companies (DisCos), generator backup metrics, and real-time fuel pricing, WattSmart Naija provides actionable cost-cutting insights and hardware payback calculations.

Whether for a 3-bedroom apartment on Band C grid supply or a retail SME running a 15 kVA diesel generator for 8 hours daily, WattSmart Naija models baseline energy expenditures and generates professional, executive-ready **AI Energy Audit Reports**.

---

## ✨ Key Features

### 1. ⚡ Grid & Tariff Band Configuration
- **NERC Service-Based Tariffs**: Support for Bands A (20+ hrs/day), B (16–20 hrs), C (12–16 hrs), D (8–12 hrs), and E (<8 hrs).
- **DisCo Selection**: Tailored pricing models across Nigerian distribution companies (e.g., Ikeja Electric, Eko DisCo, AEDC, IBEDC, KEDCO, PHED, etc.).
- **Backup Generator Modeling**: Calculates fuel liters consumed and monthly Naira spend based on generator rating (kVA), daily operating hours, and local petrol/diesel prices (₦/liter).

### 2. 🔌 Appliance Inventory & Energy Profiling
- Pre-loaded templates for **Households** (Flats, Duplexes) and **SMEs** (Shops, Offices, Bakeries, Salons).
- Custom appliance tracking for heavy loads (Non-Inverter vs. Inverter ACs, Pumping Machines, Boiling Rings, Deep Freezers, LED/Incandescent Lighting).
- Precision calculations for daily/monthly kilowatt-hours (kWh) and associated cost contributions.

### 3. 📊 Visual Charts & Metrics Breakdown
- **Cost Ratio Visualization**: Interactive Recharts pie and bar graphs highlighting Grid spend vs. Generator fuel spend.
- **Top Consumption Drivers**: Instant identification of "energy vampires" within the building.
- **Baseline vs. Optimized Scenarios**: Comparative financial previews showing potential percentage savings.

### 4. 🤖 WattSmart AI Energy Audit Reports
- Server-side **Gemini API** integration generating structured **600–900 word executive reports**.
- **Formatted Data Tables**: Built with customized HTML/React components, featuring:
  - Executive Summaries & Financial Highlights.
  - Energy Source Breakdown (Grid kWh vs. Generator Liters).
  - Ranked Top 5 Energy Consumers.
  - Recommended Equipment Upgrades (Inverter ACs, Solar Hybrid, LED retrofits) with estimated costs, monthly savings, and payback periods.
  - Priority Badges (`High`, `Medium`, `Low`) and right-aligned Naira (`₦`) values.
  - Actionable 5-step operational strategies tailored for Nigerian grid schedules.

### 5. 💬 24/7 AI Energy Advisor Chat
- Interactive streaming conversational assistant powered by server-side Gemini AI.
- Context-aware responses answering questions on NERC regulations, inverter specs, solar battery types (Lithium LiFePO4 vs. Tubular Gel), and peak-shaving tactics.

### 6. 📁 Scenario Vault & Cloud Sync
- **Firebase Firestore Integration**: Save, name, and retrieve custom energy profiles and generated AI audit reports.
- Compare multiple investment scenarios (e.g., *Full Solar Installation* vs. *Inverter AC Upgrade*).
- Anonymous and guest account support via **Firebase Authentication**.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript + Vite |
| **Styling & UI** | Tailwind CSS v4, Lucide Icons, Motion (Framer Motion) |
| **Data Visualization** | Recharts |
| **Markdown Rendering** | `react-markdown` with `remark-gfm` |
| **Backend Runtime** | Node.js + Express (TypeScript) |
| **Build Tools** | `tsx` (development), `esbuild` (bundled CJS output) |
| **AI Engine** | `@google/genai` (Google Gemini 2.5/3.5/3.6 server-side proxy) |
| **Database & Auth** | Firebase Firestore & Firebase Auth |

---

## 📂 Project Structure

```text
├── server.ts                    # Express backend (API proxy, Gemini prompt engineering)
├── src/
│   ├── main.tsx                 # Application entry point
│   ├── App.tsx                  # Primary layout and state management
│   ├── components/
│   │   ├── ApplianceManager.tsx # Appliance inventory editor & wattage calculator
│   │   ├── AdvisorChat.tsx      # Interactive 24/7 AI Energy Advisor chat drawer
│   │   ├── AuthScreen.tsx       # User login & authentication modal
│   │   ├── ControlPanel.tsx     # Location, DisCo, Grid Band & Generator setup
│   │   ├── EnergyCharts.tsx     # Recharts data visualizers
│   │   ├── ReportViewer.tsx     # AI Audit Report container with custom GFM tables
│   │   └── ScenarioHistory.tsx  # Saved scenario manager backed by Firestore
│   ├── lib/
│   │   └── firebase.ts          # Firebase Auth & Firestore client configuration
│   └── utils/
│       └── energyMath.ts        # Pure mathematical models for kWh, DisCo tariffs, & solar ROI
├── .env.example                 # Environment variable templates
├── metadata.json                # AI Studio application configuration
└── package.json                 # Project dependencies and build scripts
```

---

## 🧠 AI Model & Architectural Flow

### 1. 🤖 AI Model Used
- **Primary Foundation Model**: **Google Gemini 2.5 Flash** (`gemini-2.5-flash`) via `@google/genai` SDK.
- **Key Advantages**:
  - Ultra-fast token generation speed suitable for interactive web dashboards.
  - Strict adherence to JSON/Markdown layout schemas and character/word-count boundaries (600–900 words).
  - High domain reasoning capability for localized Nigerian energy dynamics (NERC DisCo tariffs, generator fuel logistics, and solar payback modeling).

### 2. 📐 AI Architecture Flow
```
[User Form / Appliance Manager]
               │
               ▼
   [Deterministic Math Engine]
     (Pure TypeScript Calculations in energyMath.ts)
               │  (Raw kWh, ₦ Costs, Fuel Liters, Solar Sizing)
               ▼
 [Server-Side Secure Express Proxy] ──▶ (GEMINI_API_KEY Hidden Server-Side)
      (/api/advisory/audit)
               │
               ▼
 [Structured Prompt Engineering]
     • NERC Band A-E Constraints
     • DisCo Pricing Rules
     • Mandatory Markdown Table Schema
               │
               ▼
   [Google Gemini 2.5 Flash API]
               │
               ▼  (Structured Markdown Response)
    [Frontend Component Layer]
     (ReactMarkdown + remark-gfm in ReportViewer.tsx)
               │
               ▼
[Custom Styled React Data Tables]
  • Priority Badges (High, Medium, Low)
  • Right-aligned Naira (₦) & kWh figures
  • Responsive borders & alternating rows
```

### 3. 🛡️ Key Architectural Principles
1. **Zero Math Hallucinations**: Core financial metrics, energy totals, and solar sizing options are pre-computed mathematically before passing into the LLM context. Gemini is tasked with structural aggregation, advisory narrative, and strategy synthesis—never arithmetic.
2. **Secure Server-Side API Proxy**: All requests to Google Gemini route through Node/Express API handlers (`/api/advisory/audit` and `/api/advisory/chat`). API credentials never touch the browser DOM.
3. **Structured Component Mapping**: Markdown output produced by the AI model is dynamically compiled into native React components using `remark-gfm`, transforming raw text tables into styled, responsive tables with priority indicators.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **Gemini API Key**: Obtainable from [Google AI Studio](https://aistudio.google.com/)

### Environment Setup
Create a `.env` file in the project root (or set variables in your deployment environment):

```env
# Required for server-side AI report & chat generation
GEMINI_API_KEY=your_google_gemini_api_key_here

# Required for Firebase Cloud persistence & Auth (Auto-configured in AI Studio)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Installation

```bash
# Install all dependencies
npm install
```

### Running Development Server

```bash
# Starts the Express backend & Vite HMR proxy on port 3000
npm run dev
```

Open `http://localhost:3000` in your browser.

### Production Build & Deployment

```bash
# Build the client static assets and bundle server.ts with esbuild
npm run build

# Launch the compiled Node.js production server
npm start
```

---

## 💡 How Energy Calculations Work

1. **Grid Electricity Cost**:  
   $$\text{Monthly Grid Cost (₦)} = \text{Monthly Grid kWh} \times \text{DisCo Band Tariff (₦/kWh)}$$

2. **Generator Fuel Expenditure**:  
   $$\text{Monthly Fuel Cost (₦)} = \text{Daily Generator Hours} \times 30 \times \text{Fuel Burn Rate (L/hr)} \times \text{Fuel Price (₦/L)}$$

3. **Solar Payback Period**:  
   $$\text{Payback Period (Years)} = \frac{\text{Upfront Solar System Capital (₦)}}{\text{Annual Generator Fuel Savings (₦)}}$$

---

## 📄 License

This project is developed for **WattSmart Naija**. All rights reserved.
