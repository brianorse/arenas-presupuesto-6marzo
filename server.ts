import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // WhatsApp API Configuration (Evolution API / Self-Hosted)
  const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL;
  const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY;

  // Mock Evolution API / Self-Hosted Architecture
  const instances = new Map();

  // 1. Create or Get Instance
  app.post("/api/whatsapp/instances", async (req, res) => {
    const { userId } = req.body;
    
    // If real API is configured, we could call it here. 
    // For now, we manage internal instance mapping.
    let instanceId = Array.from(instances.values()).find(i => i.userId === userId)?.id;
    
    if (!instanceId) {
      instanceId = `inst_${Math.random().toString(36).substring(2, 11)}`;
      instances.set(instanceId, {
        id: instanceId,
        userId,
        status: "not_connected",
        qrCode: null,
        phoneNumber: null,
        createdAt: new Date().toISOString()
      });
    }
    
    res.json(instances.get(instanceId));
  });

  // 2. Connect / Generate QR
  app.post("/api/whatsapp/instances/:id/connect", async (req, res) => {
    const instance = instances.get(req.params.id);
    if (!instance) return res.status(404).json({ error: "Instance not found" });
    
    // REAL INTEGRATION: If WHATSAPP_API_URL is set, call the real Evolution API
    if (WHATSAPP_API_URL && WHATSAPP_API_KEY) {
      try {
        // Example for Evolution API: POST /instance/create
        // This is where you'd put the real logic
        console.log(`Connecting to real API at ${WHATSAPP_API_URL}`);
      } catch (error) {
        console.error("Real API Error:", error);
      }
    }

    // Mock logic for demo/dev
    instance.status = "pending_qr";
    instance.qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=evolution_api_instance_${instance.id}_${Date.now()}`;
    instance.qrExpiresAt = new Date(Date.now() + 60 * 1000).toISOString();
    
    instances.set(instance.id, instance);

    setTimeout(() => {
      if (instances.has(instance.id) && instances.get(instance.id).status === "pending_qr") {
        const inst = instances.get(instance.id);
        inst.status = "waiting_scan";
        instances.set(inst.id, inst);
      }
    }, 3000);

    res.json(instance);
  });

  // 3. Query Instance Status
  app.get("/api/whatsapp/instances/:id", async (req, res) => {
    const instance = instances.get(req.params.id);
    if (!instance) return res.status(404).json({ error: "Instance not found" });
    
    // REAL INTEGRATION: Poll real API status here if configured
    
    res.json(instance);
  });

  // 4. Simulate Scan (For Demo/Dev)
  app.post("/api/whatsapp/instances/:id/simulate-scan", (req, res) => {
    const { phoneNumber } = req.body;
    const instance = instances.get(req.params.id);
    if (!instance) return res.status(404).json({ error: "Instance not found" });
    
    instance.status = "connected";
    instance.phoneNumber = phoneNumber || "+34 600 000 000";
    instance.updatedAt = new Date().toISOString();
    
    instances.set(instance.id, instance);
    res.json(instance);
  });

  // 5. Logout / Disconnect
  app.post("/api/whatsapp/instances/:id/logout", async (req, res) => {
    const instance = instances.get(req.params.id);
    if (!instance) return res.status(404).json({ error: "Instance not found" });
    
    // REAL INTEGRATION: Call real API logout here if configured
    
    instance.status = "disconnected";
    instance.qrCode = null;
    instance.phoneNumber = null;
    
    instances.set(instance.id, instance);
    res.json({ success: true });
  });

  // Vite middleware for development

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
