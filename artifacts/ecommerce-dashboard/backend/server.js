// ══════════════════════════════════════════════════════════════
//  StreamIQ — Backend API server
//  ──────────────────────────────────────────────────────────────
//  Plain Node.js HTTP server (no frameworks, no dependencies).
//  Serves JSON API endpoints under /api/* and the static frontend
//  files from ../frontend/.
//
//  Run:        node backend/server.js
//  Default:    http://localhost:3000
//  Override:   PORT=8080 node backend/server.js
// ══════════════════════════════════════════════════════════════

import { createServer } from "http";
import { readFile } from "fs/promises";
import { existsSync, statSync } from "fs";
import { extname, join, dirname, resolve } from "path";
import { fileURLToPath } from "url";
import {
  getLiveOrders, getMonitoringStats,
} from "./data.js";
import azureData from "./azure-data.js";
import { readCSV, listCSVFiles, testConnection, azureConfig, listAllFilesAndFolders, getFileInfo, listContainers, listContainerFiles } from "./azure.js";

const __dirname  = dirname(fileURLToPath(import.meta.url));
const FRONTEND   = resolve(__dirname, "..", "frontend");
const PORT       = Number(process.env.PORT) || 3000;
const BASE_PATH  = (process.env.BASE_PATH || "/").replace(/\/$/, "");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg":  "image/svg+xml",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".ico":  "image/x-icon",
};

// ── API routes ───────────────────────────────────────────────
const routes = {
  // Dashboard KPIs & Analytics - NOW FROM AZURE!
  "GET /api/kpis":                async () => await azureData.getKpis(),
  "GET /api/sales":               async (q) => await azureData.getSalesTrend(q.period || "30d"),
  "GET /api/categories":          async () => await azureData.getCategories(),
  "GET /api/products":            async () => await azureData.getTopProducts(),
  "GET /api/orders-distribution": async () => await azureData.getOrdersDistribution(),

  // Customer Analytics - NOW FROM AZURE!
  "GET /api/customer-kpis":       async () => await azureData.getCustomerKpis(),
  "GET /api/customer-segments":   async () => await azureData.getCustomerSegments(),
  "GET /api/ltv":                 async () => await azureData.getLtvDistribution(),
  "GET /api/customers":           async () => await azureData.getTopCustomers(),

  // Predictions - NOW FROM AZURE!
  "GET /api/prediction-kpis":     async () => await azureData.getPredictionKpis(),
  "GET /api/forecast":            async () => await azureData.getForecast(),
  "GET /api/churn":               async () => await azureData.getChurnRisk(),
  "GET /api/restock":             async () => await azureData.getRestockRecommendations(),

  // NLP & Sentiment - NOW FROM AZURE!
  "GET /api/nlp/sentiment":       async () => await azureData.getSentiment(),
  "GET /api/nlp/words":           async () => await azureData.getTopWords(),
  "GET /api/nlp/complaints":      async () => await azureData.getTopKeywords(),
  "GET /api/nlp/reviews":         async () => await azureData.getReviews(),

  // Real-time Monitoring (still using local streaming data)
  "GET /api/monitoring/orders":   () => getLiveOrders(),
  "GET /api/monitoring/stats":    () => getMonitoringStats(),

  // Azure Data Endpoints (New!)
  // نقاط نهاية بيانات Azure (جديد!)
  "GET /api/azure/orders":        async () => await readCSV("orders_clean.csv"),
  "GET /api/azure/order-items":   async () => await readCSV("order_items_clean.csv"),
  "GET /api/azure/products":      async () => await readCSV("products_clean.csv"),
  "GET /api/azure/payments":      async () => await readCSV("payments_clean.csv"),
  "GET /api/azure/reviews":       async () => await readCSV("reviews_clean.csv"),
  "GET /api/azure/sellers":       async () => await readCSV("sellers_clean.csv"),
  "GET /api/azure/geolocation":   async () => await readCSV("geolocation_clean.csv"),
  "GET /api/azure/files":         async () => await listCSVFiles(),
  
  // Azure Storage Explorer Endpoints (New!)
  // نقاط نهاية مستكشف Azure Storage (جديد!)
  "GET /api/azure/browse":        async () => await listAllFilesAndFolders(),
  "GET /api/azure/file-info":     async (q) => {
    if (!q.path) {
      throw new Error("Missing 'path' query parameter");
    }
    return await getFileInfo(q.path);
  },
  "GET /api/azure/containers":    async () => await listContainers(),
  "GET /api/azure/container-files": async (q) => {
    if (!q.container) {
      throw new Error("Missing 'container' query parameter");
    }
    return await listContainerFiles(q.container);
  },
  "GET /api/azure/read":          async (q) => {
    if (!q.file) {
      throw new Error("Missing 'file' query parameter");
    }
    const container = q.container || 'cleaned-data';
    return await readCSV(q.file, container);
  },
  
  // Dashboard Data from 'dashboard' container
  "GET /api/dashboard/customer-clv":     async () => await readCSV("customer_clv.csv", "dashboard"),
  "GET /api/dashboard/rfm":              async () => await readCSV("rfm_dashboard.csv", "dashboard"),
  "GET /api/dashboard/delay-review":     async () => await readCSV("delay_vs_review.csv", "dashboard"),
  "GET /api/dashboard/top-customers":    async () => await readCSV("top_customers.csv", "dashboard"),
  "GET /api/dashboard/top-categories":   async () => await readCSV("top_categories.csv", "dashboard"),
  
  // ML Models Data from 'models' container
  "GET /api/models/churn-predictions":   async () => await readCSV("customer_churn_predictions.csv", "models"),
  "GET /api/models/clv-predictions":     async () => await readCSV("customer_clv_predictions.csv", "models"),
  "GET /api/models/sales-forecast":      async () => await readCSV("sales_forecast.csv", "models"),
  "GET /api/models/recommendations":     async () => await readCSV("recommendation.csv", "models"),
  
  // NLP Data from 'nlp' container (raw, use /api/nlp/* for processed)
  "GET /api/azure/nlp/sentiment":        async () => await readCSV("sentiment_summary.csv", "nlp"),
  "GET /api/azure/nlp/reviews":          async () => await readCSV("nlp_reviews.csv", "nlp"),
  "GET /api/azure/nlp/keywords":         async () => await readCSV("top_keywords.csv", "nlp"),
  
  "GET /api/azure/test":          async () => ({ 
    connected: await testConnection(),
    config: azureConfig,
  }),
};

// ── Helpers ──────────────────────────────────────────────────
function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
    ...headers,
  });
  res.end(body);
}

function sendJson(res, status, obj) {
  send(res, status, JSON.stringify(obj), { "Content-Type": "application/json; charset=utf-8" });
}

async function serveStatic(res, filePath) {
  try {
    const data = await readFile(filePath);
    const type = MIME[extname(filePath).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store, must-revalidate" });
    res.end(data);
  } catch {
    send(res, 404, "Not Found");
  }
}

// ── Request handler ──────────────────────────────────────────
const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let path = url.pathname;

  // Strip BASE_PATH prefix (used when behind a reverse proxy)
  if (BASE_PATH && path.startsWith(BASE_PATH)) {
    path = path.slice(BASE_PATH.length) || "/";
  }

  // ─── API ───────────────────────────────────────────────
  const key = `${req.method} ${path}`;
  const handler = routes[key];
  if (handler) {
    const query = Object.fromEntries(url.searchParams);
    try {
      const result = await handler(query);
      return sendJson(res, 200, result);
    } catch (err) {
      console.error(err);
      return sendJson(res, 500, { error: "Internal server error" });
    }
  }

  // ─── Static frontend ───────────────────────────────────
  if (req.method !== "GET") {
    return send(res, 405, "Method Not Allowed");
  }

  // Route root to landing page, /dashboard to the dashboard
  if (path === "/" || path === "") {
    return serveStatic(res, join(FRONTEND, "landing.html"));
  }
  if (path === "/dashboard") {
    return serveStatic(res, join(FRONTEND, "index.html"));
  }

  const safe = path.replace(/^\/+/, "").split("?")[0];
  const filePath = join(FRONTEND, safe);

  if (filePath.startsWith(FRONTEND) && existsSync(filePath) && statSync(filePath).isFile()) {
    return serveStatic(res, filePath);
  }

  // SPA fallback — serve landing page for unknown routes
  return serveStatic(res, join(FRONTEND, "landing.html"));
});

server.listen(PORT, "0.0.0.0", async () => {
  console.log(`\n  ╔════════════════════════════════════════════════════╗`);
  console.log(`  ║         StreamIQ Backend Server Started!        ║`);
  console.log(`  ╚════════════════════════════════════════════════════╝\n`);
  console.log(`  📍 Local:     http://localhost:${PORT}`);
  console.log(`  📍 Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`  📍 API:       http://localhost:${PORT}/api/kpis`);
  console.log(`  📂 Frontend:  ${FRONTEND}\n`);
  
  // Test Azure connection on startup
  console.log(`  ☁️  Azure Storage Integration:`);
  const azureConnected = await testConnection();
  if (azureConnected) {
    console.log(`  ✅ Connected to container: ${azureConfig.containerName}`);
    console.log(`  📊 Available endpoints:`);
    console.log(`     - GET /api/customers (from Azure)`);
    console.log(`     - GET /api/azure/orders`);
    console.log(`     - GET /api/azure/products`);
    console.log(`     - GET /api/azure/files (list all CSV files)`);
  } else {
    console.log(`  ⚠️  Azure Storage connection failed - using local data`);
  }
  console.log(`\n`);
});
