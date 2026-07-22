import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { runEnergyCalculations, InputParams } from "./src/utils/energyMath.ts";

const app = express();
const PORT = 3000;

// Set up server-side JSON parsing
app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
  console.log("Gemini API initialized successfully.");
} else {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not set. AI Advisor features will be unavailable.");
}

// Simple health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", aiAvailable: !!ai });
});

// Endpoint: Generate Energy Efficiency Audit and Report
app.post("/api/advisory/audit", async (req, res) => {
  if (!ai) {
    return res.status(503).json({
      error: "AI service is currently unavailable. Please verify that the GEMINI_API_KEY secret is configured.",
    });
  }

  try {
    const params = req.body as InputParams;
    
    // Run core calculations to ensure accurate, consistent numerical data
    const mathResults = runEnergyCalculations(params);
    
    // Format appliance counts and names
    const applianceText = params.appliances
      .map(
        (a) =>
          `- ${a.name} (Category: ${a.category}): Qty: ${a.count}, Rating: ${a.wattage}W, Grid: ${a.hoursOnGrid}h/day, Backup: ${a.hoursOnBackup}h/day${
            a.isInverter ? " [Inverter Model]" : ""
          }`
      )
      .join("\n");

    const prompt = `
You are a certified Nigerian Energy Efficiency Auditor. Generate a concise, professional Energy Audit Report for this household/SME based on the profile and metrics below.
The report MUST be between 600–900 words maximum, strictly formatted with Markdown tables and bullet points for rapid decision-making.

### USER CLASSIFICATION & REGION
- User Type: ${params.userType.toUpperCase()} (${params.subType})
- Location: ${params.state} State, Nigeria (${params.disco}, Tariff Band ${params.gridBand})
- Backup System: ${params.backupType === "none" ? "No backup generator" : params.backupType} (${params.generatorHoursDaily} hrs/day, ${params.generatorSizeKva} kVA)
- Local Generator Fuel Price: ₦${params.fuelPrice}/liter

### CALCULATED BASELINE METRICS (Reference these exact numbers)
- Monthly Grid Consumption: ${mathResults.monthlyGridKwh.toFixed(1)} kWh (Cost: ₦${Math.round(mathResults.monthlyGridCost).toLocaleString()})
- Monthly Generator Consumption: ${mathResults.monthlyBackupKwh.toFixed(1)} kWh (Cost: ₦${Math.round(mathResults.monthlyBackupCost).toLocaleString()}, Fuel: ${mathResults.monthlyBackupFuelLiters.toFixed(1)} Liters)
- Total Monthly Energy Consumption: ${mathResults.totalMonthlyKwh.toFixed(1)} kWh
- Total Monthly Energy Cost: ₦${Math.round(mathResults.totalMonthlyCost).toLocaleString()}
- Cost Ratio: Grid ${mathResults.gridCostPercentage}% vs. Generator ${mathResults.backupCostPercentage}%
- Calculated Upgrade Options: ${JSON.stringify(mathResults.applianceSavings, null, 2)}
- Solar Hybrid Sizing Option: ${JSON.stringify(mathResults.solarSizing, null, 2)}

### APPLIANCE INVENTORY
${applianceText}

---

### MANDATORY REPORT STRUCTURE (Follow this structure strictly using Markdown):

# Professional Energy Audit Report

## 1. Executive Summary
Provide EXACTLY 3 to 5 concise bullet points summarizing key financial and energy metrics:
- Monthly energy consumption: ${mathResults.totalMonthlyKwh.toFixed(1)} kWh
- Monthly electricity grid cost: ₦${Math.round(mathResults.monthlyGridCost).toLocaleString()}
- Monthly generator fuel cost: ₦${Math.round(mathResults.monthlyBackupCost).toLocaleString()}
- Total monthly energy cost: ₦${Math.round(mathResults.totalMonthlyCost).toLocaleString()}
- Potential monthly savings: ₦ and % savings achievable through recommended upgrades

## 2. Energy Consumption Summary
Provide a clear Markdown table breaking down energy sources:
| Energy Source | Consumption (kWh) | Monthly Cost (₦) | % of Total Cost |
| :--- | :--- | :--- | :--- |
(Include rows for Grid Electricity, Generator Fuel, and Total).

## 3. Top 5 Energy-Consuming Appliances
Provide a Markdown table ranking the top 5 energy consumers from the appliance inventory:
| Appliance | Monthly Consumption (kWh) | Monthly Cost (₦) | Priority Level |
| :--- | :--- | :--- | :--- |
(Assign High, Medium, or Low priority level based on energy impact).

## 4. Recommended Energy Efficiency Upgrades
Provide a Markdown table detailing high-impact upgrade recommendations:
| Recommended Upgrade | Estimated Cost (₦) | Monthly Savings (₦) | Payback Period |
| :--- | :--- | :--- | :--- |
Follow the table with a concise 1-sentence explanation per recommendation. Keep technical explanations minimal and focused on financial return.

## 5. Action Plan
Provide a maximum of 5 concise bullet points with the most important immediate actions the customer should take to lower energy costs.

### FORMATTING & CONTENT CONSTRAINTS:
- Keep total word count strictly between 600 and 900 words.
- Use tables, metrics, and bullet points instead of long prose paragraphs.
- Keep explanations to at most ONE sentence per recommendation.
- Remove detailed technical descriptions of appliances, solar components, thermodynamics, or engineering concepts.
- Avoid repeating the same figures across multiple sections.
- Ensure all currency figures use the Naira symbol (₦).
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.3, // Keep audit highly factual
      },
    });

    res.json({
      mathResults,
      reportText: response.text,
    });
  } catch (error: any) {
    console.error("Error generating energy audit report:", error);
    res.status(500).json({
      error: "Failed to generate report due to an unexpected error: " + (error.message || error),
    });
  }
});

// Endpoint: Interactive Chat with Advisor
app.post("/api/advisory/chat", async (req, res) => {
  if (!ai) {
    return res.status(503).json({
      error: "AI service is currently unavailable. Please verify that the GEMINI_API_KEY secret is configured.",
    });
  }

  try {
    const { messages, userProfile } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid request body: 'messages' array is required." });
    }

    // Format the profile context for the advisor
    const profileContext = userProfile 
      ? `
Context on the user:
- User Type: ${userProfile.userType.toUpperCase()}
- Location: ${userProfile.state} State, Nigeria (DisCo: ${userProfile.disco}, Tariff Band: ${userProfile.gridBand})
- Backup System: ${userProfile.backupType} (Fuel price: ₦${userProfile.fuelPrice}/L, Generator Size: ${userProfile.generatorSizeKva}kVA)
- Selected appliances: ${JSON.stringify(userProfile.appliances.map((a: any) => ({ name: a.name, count: a.count, wattage: a.wattage })))}
`
      : "The user is seeking general energy efficiency advice for Nigeria.";

    const systemInstruction = `
You are a warm, highly expert Nigerian Energy Efficiency Advisor. You help Nigerian households and businesses save money on their electric bills and generator fuel.
Use Nigerian context freely (e.g., Band A tariffs, fuel subsidy removal, fuel queuing, DisCos, inverter technology, 12V/24V/48V solar systems).
Keep your answers professional, friendly, and practical. Ensure your calculations or monetary estimations are grounded in realistic Nigerian pricing.
Always refer to Naira (₦) for costs.

${profileContext}
`;

    // Extract recent chat history for the Gemini client
    // We will convert them to contents format or use Gemini Chat API
    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    // To preserve chat history in the Google GenAI SDK, we can either re-send all history
    // or play through the chat messages. Let's send the chat message with previous history pre-populated.
    // In @google/genai, ai.chats.create allows a history configuration:
    // history: Array<{ role: 'user' | 'model', parts: [{ text: string }] }>
    // Let's transform incoming messages to this format!
    const formattedHistory = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const activeChat = ai.chats.create({
      model: "gemini-3.5-flash",
      history: formattedHistory,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const lastUserMessage = messages[messages.length - 1].content;
    const response = await activeChat.sendMessage({
      message: lastUserMessage,
    });

    res.json({
      content: response.text,
    });
  } catch (error: any) {
    console.error("Error in interactive energy advisor chat:", error);
    res.status(500).json({
      error: "Failed to run chat completion: " + (error.message || error),
    });
  }
});

// Configure Vite or production serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Configuring Vite Dev Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving production static files...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Energy Efficiency Advisor backend running on port ${PORT}`);
  });
}

startServer();
