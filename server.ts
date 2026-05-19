import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const server = createServer(app);
  const PORT = 3000;

  // Initialize WebSocket server
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("Client connected to WebSocket");
    
    // Send initial ping or data
    ws.send(JSON.stringify({ type: "connection", message: "Successfully connected to SkyStream WS" }));

    ws.on("close", () => {
      console.log("Client disconnected");
    });
  });

  // API Routes
  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.post("/api/insight", async (req, res) => {
    try {
      const { entityName, from, to, type } = req.body;
      const vehicleType = type === "FLIGHT" ? "volo" : "nave";
      const prompt = `Genera un report molto breve, realistico e futuristico per il ${vehicleType} ${entityName} in viaggio da ${from} a ${to}. Menziona il meteo, la velocità attuale e un aggiornamento creativo (es. manutenzione automatizzata completata, lieve ritardo a causa del vento solare, ecc.). Scrivi esclusivamente in italiano. Massimo 60 parole.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      res.json({ report: response.text });
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "Connessione alla rete neurale fallita." });
    }
  });

  // Serve Vite in dev or static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
