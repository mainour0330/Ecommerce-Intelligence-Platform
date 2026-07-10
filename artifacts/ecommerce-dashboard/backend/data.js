// ══════════════════════════════════════════════════════════════
//  StreamIQ — mock data layer
//  ──────────────────────────────────────────────────────────────
//  All "database" data lives here. The server imports these and
//  serves them as JSON. Replace any of these with real DB or ML
//  outputs when you're ready to go live.
// ══════════════════════════════════════════════════════════════

export const kpis = {
  totalSales:    { value: 1847294, delta: 12.4, currency: "$" },
  totalOrders:   { value: 14821,   delta: 8.7  },
  avgOrderValue: { value: 125,     delta: 3.5,  currency: "$" },
  customers:    { value: 3798,    delta: 5.2  },
};

const PERIOD_DAYS = { "7d": 7, "30d": 30, "90d": 90, "1y": 52 };

export function generateSales(period = "30d") {
  const n = PERIOD_DAYS[period] ?? 30;
  const labels = [];
  const data   = [];
  const today  = new Date();
  let value = 50000;
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    if (period === "1y") {
      d.setDate(d.getDate() - i * 7);
      labels.push(`Wk ${52 - i}`);
    } else {
      d.setDate(d.getDate() - i);
      labels.push(`${d.getMonth() + 1}/${d.getDate()}`);
    }
    value += (Math.random() - 0.45) * 8000;
    data.push(Math.max(20000, Math.round(value)));
  }
  return { period, labels, data };
}

export const categories = {
  labels: ["Electronics", "Footwear", "Home & Kitchen", "Fitness", "Beauty", "Outdoor", "Other"],
  data:   [32, 18, 16, 12, 10, 7, 5],
};

export const topProducts = {
  labels: ["Wireless Headphones", "Smart Watch", "Yoga Mat", "Coffee Maker", "Running Shoes", "LED Lamp", "Backpack"],
  data:   [142, 118, 96, 84, 72, 58, 49],
};

export const ordersDistribution = {
  labels: ["Delivered", "Shipped", "Processing", "Pending", "Returned"],
  data:   [62, 18, 10, 7, 3],
};

// ── Customers ────────────────────────────────────────────────
export const customerKpis = {
  vip:    { value: 428,  delta:  6.1 },
  loyal:  { value: 1124, delta:  3.4 },
  atRisk: { value: 312,  delta: -1.8 },
  isNew:  { value: 1934, delta: 12.7 },
};

export const customerSegments = {
  labels: ["VIP", "Loyal", "At-Risk", "New"],
  data:   [428, 1124, 312, 1934],
};

export const ltvDistribution = {
  labels: ["<$100", "$100-500", "$500-1k", "$1k-5k", "$5k+"],
  data:   [820, 1450, 894, 512, 122],
};

export const customers = [
  { name: "Sarah Johnson",  segment: "VIP",     orders: 47, spent: 12480, last: "2d ago" },
  { name: "Michael Chen",   segment: "VIP",     orders: 38, spent: 9215,  last: "1d ago" },
  { name: "Aisha Patel",    segment: "Loyal",   orders: 24, spent: 4870,  last: "5d ago" },
  { name: "David Kim",      segment: "Loyal",   orders: 22, spent: 4421,  last: "3d ago" },
  { name: "Emma Williams",  segment: "At-Risk", orders: 8,  spent: 1240,  last: "42d ago" },
  { name: "Lucas Garcia",   segment: "New",     orders: 2,  spent: 312,   last: "6h ago" },
  { name: "Olivia Brown",   segment: "Loyal",   orders: 18, spent: 3680,  last: "4d ago" },
  { name: "James Wilson",   segment: "VIP",     orders: 33, spent: 8740,  last: "8h ago" },
];

// ── Predictions ──────────────────────────────────────────────
export const predictionKpis = {
  churnRisk:        { value: 8.2,  delta: -1.2, suffix: "%" },
  forecastRevenue:  { value: 2.1,  delta: 14.7, prefix: "$", suffix: "M" },
  modelAccuracy:    { value: 94.6, delta:  0.8, suffix: "%" },
  recommendationCtr:{ value: 21.3, delta:  2.4, suffix: "%" },
};

export function generateForecast() {
  const labels = [], actual = [], predicted = [];
  for (let i = 0; i < 30; i++) {
    labels.push(`Day ${i + 1}`);
    if (i < 14) {
      actual.push(60 + Math.random() * 25);
      predicted.push(null);
    } else if (i === 14) {
      const v = 60 + Math.random() * 25;
      actual.push(v);
      predicted.push(v);
    } else {
      actual.push(null);
      predicted.push(75 + Math.sin(i / 4) * 12 + Math.random() * 6);
    }
  }
  return { labels, actual, predicted };
}

export const churnRisk = [
  { name: "Emma Williams", risk: 0.87, last: "42d ago" },
  { name: "Robert Davis",  risk: 0.81, last: "38d ago" },
  { name: "Sophie Martin", risk: 0.74, last: "31d ago" },
  { name: "Daniel Lee",    risk: 0.68, last: "28d ago" },
  { name: "Maya Sharma",   risk: 0.62, last: "24d ago" },
];

export const restock = [
  { product: "Wireless Headphones", demand: 480, stock: 124, action: "Reorder" },
  { product: "Smart Watch Pro",     demand: 312, stock: 87,  action: "Reorder" },
  { product: "Yoga Mat Premium",    demand: 245, stock: 198, action: "Monitor" },
  { product: "Coffee Maker",        demand: 198, stock: 56,  action: "Urgent" },
  { product: "Running Shoes v2",    demand: 176, stock: 142, action: "Monitor" },
];

// ── NLP ──────────────────────────────────────────────────────
export const sentiment = {
  totalReviews: 2847,
  positive: 62.4,
  negative: 18.1,
  neutral:  19.5,
};

export const words = [
  { word: "quality",         count: 421, sentiment: "pos" },
  { word: "fast shipping",   count: 387, sentiment: "pos" },
  { word: "great value",     count: 312, sentiment: "pos" },
  { word: "excellent",       count: 298, sentiment: "pos" },
  { word: "recommend",       count: 276, sentiment: "pos" },
  { word: "perfect",         count: 254, sentiment: "pos" },
  { word: "durable",         count: 198, sentiment: "pos" },
  { word: "love it",         count: 187, sentiment: "pos" },
  { word: "delayed",         count: 143, sentiment: "neg" },
  { word: "average",         count: 134, sentiment: "neu" },
  { word: "broken",          count: 128, sentiment: "neg" },
  { word: "okay",            count: 121, sentiment: "neu" },
  { word: "disappointed",    count: 112, sentiment: "neg" },
  { word: "decent",          count: 108, sentiment: "neu" },
  { word: "overpriced",      count: 98,  sentiment: "neg" },
  { word: "expected",        count: 94,  sentiment: "neu" },
  { word: "poor quality",    count: 87,  sentiment: "neg" },
  { word: "nothing special", count: 76,  sentiment: "neu" },
];

export const complaints = [
  { text: "Delayed shipping / late delivery",    count: 143, pct: 27.4 },
  { text: "Product arrived damaged or broken",   count: 128, pct: 24.5 },
  { text: "Item doesn't match description",      count: 112, pct: 21.5 },
  { text: "Price too high for quality",          count: 98,  pct: 18.8 },
  { text: "Difficult return/refund process",     count: 41,  pct:  7.9 },
];

export const reviews = [
  { author: "Sarah J.",   date: "2d ago", text: "Absolutely love these headphones! The sound quality is incredible and they arrived faster than expected.", sentiment: "positive", confidence: 0.96 },
  { author: "Michael C.", date: "3d ago", text: "Decent product for the price. Nothing extraordinary but it does the job.",                                  sentiment: "neutral",  confidence: 0.71 },
  { author: "Emma W.",    date: "5d ago", text: "Very disappointed. The product arrived damaged and customer service was unhelpful.",                       sentiment: "negative", confidence: 0.93 },
  { author: "David K.",   date: "6d ago", text: "Great value for money! Highly recommend to anyone looking for a reliable option.",                          sentiment: "positive", confidence: 0.94 },
  { author: "Olivia B.",  date: "1w ago", text: "Shipping was delayed by 5 days. Product itself is okay.",                                                  sentiment: "negative", confidence: 0.78 },
  { author: "James W.",   date: "1w ago", text: "Perfect! Exactly as described, fast shipping, and excellent build quality.",                                sentiment: "positive", confidence: 0.97 },
  { author: "Sophie M.",  date: "2w ago", text: "Average product. Doesn't quite match the photos but works fine.",                                          sentiment: "neutral",  confidence: 0.68 },
  { author: "Lucas G.",   date: "2w ago", text: "Overpriced for what you get. Expected better quality at this price point.",                                sentiment: "negative", confidence: 0.85 },
];

// ── Monitoring (live) ────────────────────────────────────────
const NAMES = ["Sarah J.", "Michael C.", "Aisha P.", "David K.", "Emma W.", "Lucas G.", "Olivia B.", "James W.", "Sophie M.", "Daniel L.", "Maya S.", "Robert D."];
const STATUSES = [
  { label: "Completed",  cls: "status-completed" },
  { label: "Shipped",    cls: "status-shipped" },
  { label: "Processing", cls: "status-processing" },
  { label: "Pending",    cls: "status-pending" },
];

let nextOrderId = 84240;
let liveOrders = [];

function makeOrder(at) {
  return {
    time: at.toISOString(),
    id: "#" + (++nextOrderId).toString(),
    customer: NAMES[Math.floor(Math.random() * NAMES.length)],
    amount: +(Math.random() * 320 + 25).toFixed(2),
    status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
  };
}

// Seed initial 8 orders
(function seed() {
  const now = Date.now();
  for (let i = 7; i >= 0; i--) {
    liveOrders.push(makeOrder(new Date(now - i * 35000)));
  }
})();

// Push a new order every 4s (server side)
setInterval(() => {
  liveOrders.unshift(makeOrder(new Date()));
  if (liveOrders.length > 12) liveOrders.pop();
}, 4000);

export function getLiveOrders() {
  return liveOrders;
}

export function getMonitoringStats() {
  return {
    ordersPerMin:      8 + Math.floor(Math.random() * 12),
    activeSessions:    450 + Math.floor(Math.random() * 80),
    cartAbandonment:   { value: 23.4, delta: -0.6, suffix: "%" },
    systemStatus:      "Healthy",
  };
}
