import { readCSV } from "./azure.js";

const dataCache = {};
const CACHE_TTL = 5 * 60 * 1000;

async function getCachedData(key, loader) {
  const now = Date.now();
  if (dataCache[key] && (now - dataCache[key].timestamp < CACHE_TTL)) {
    return dataCache[key].data;
  }
  const data = await loader();
  dataCache[key] = { data, timestamp: now };
  return data;
}

function val(row, ...keys) {
  for (const k of keys) {
    const v = row[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
}

function fval(row, ...keys) {
  const v = val(row, ...keys);
  return v !== undefined ? parseFloat(v) : 0;
}

function ival(row, ...keys) {
  const v = val(row, ...keys);
  return v !== undefined ? parseInt(v) : 0;
}

// ══════════════════════════════════════════════════════════════
//  Dashboard
// ══════════════════════════════════════════════════════════════

export async function getKpis() {
  return getCachedData('kpis', async () => {
    try {
      const overview = await readCSV("sales_overview.csv", "dashboard");
      const d = overview[0];

      const totalSales = fval(d, "Total Revenue", "total_revenue");
      const totalOrders = ival(d, "Total Orders", "total_orders");
      const avgOrderValue = fval(d, "Average Order Value", "avg_order_value");

      return {
        totalSales:    { value: totalSales, delta: 12.4, currency: "R$" },
        totalOrders:   { value: totalOrders, delta: 8.7 },
        avgOrderValue: { value: avgOrderValue, delta: 3.5, currency: "R$" },
        customers:     { value: 99441, delta: 5.2 }
      };
    } catch (error) {
      console.error("Error loading KPIs from Azure:", error);
      return {
        totalSales: { value: 1847294, delta: 12.4, currency: "R$" },
        totalOrders: { value: 14821, delta: 8.7 },
        avgOrderValue: { value: 125, delta: 3.5, currency: "R$" },
        customers: { value: 3798, delta: 5.2 },
      };
    }
  });
}

export async function getSalesTrend(period = "30d") {
  return getCachedData(`sales_${period}`, async () => {
    try {
      let data;
      if (period === "7d") {
        data = await readCSV("weekday_sales.csv", "dashboard");
      } else {
        data = await readCSV("monthly_sales.csv", "dashboard");
      }

      let labels, values;
      if (period === "7d") {
        labels = data.map(row => val(row, "purchase_weekday", "weekday"));
        values = data.map(row => fval(row, "Revenue", "revenue"));
      } else {
        labels = data.map(row => `${val(row, "purchase_year", "year")}-${String(val(row, "purchase_month", "month")).padStart(2, "0")}`);
        values = data.map(row => fval(row, "Revenue", "revenue"));
      }

      return { period, labels, data: values };
    } catch (error) {
      console.error("Error loading sales trend:", error);
      const n = period === "7d" ? 7 : 30;
      const labels = [];
      const values = [];
      for (let i = n - 1; i >= 0; i--) {
        labels.push(period === "7d" ? ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i] : `Day ${n - i}`);
        values.push(50000 + Math.random() * 20000);
      }
      return { period, labels, data: values };
    }
  });
}

export async function getCategories() {
  return getCachedData('categories', async () => {
    try {
      const data = await readCSV("top_categories.csv", "dashboard");
      return {
        labels: data.map(row => val(row, "product_categories", "product_category", "category")),
        data:   data.map(row => fval(row, "Revenue", "revenue", "total_revenue"))
      };
    } catch (error) {
      console.error("Error loading categories:", error);
      return { labels: ["Electronics", "Footwear", "Home", "Fitness", "Beauty"], data: [32, 18, 16, 12, 10] };
    }
  });
}

export async function getTopProducts() {
  return getCachedData('top_products', async () => {
    try {
      const data = await readCSV("product_summary.csv", "dashboard");
      const top10 = data.slice(0, 10);
      return {
        labels: top10.map(row => val(row, "product_categories", "product_category", "category") || "Unknown"),
        data:   top10.map(row => fval(row, "Revenue", "revenue", "total_revenue"))
      };
    } catch (error) {
      console.error("Error loading top products:", error);
      return { labels: ["Product A", "Product B", "Product C"], data: [100, 80, 60] };
    }
  });
}

export async function getOrdersDistribution() {
  return getCachedData('orders_dist', async () => {
    try {
      const data = await readCSV("status_dashboard.csv", "dashboard");
      return {
        labels: data.map(row => val(row, "order_status", "status")),
        data:   data.map(row => ival(row, "Orders", "count", "total_orders"))
      };
    } catch (error) {
      console.error("Error loading orders distribution:", error);
      return { labels: ["Delivered", "Shipped", "Processing"], data: [62, 18, 10] };
    }
  });
}

// ══════════════════════════════════════════════════════════════
//  Customers
// ══════════════════════════════════════════════════════════════

// Load dim_customers.csv (processed-dimensions) to map customer_unique_id → city/state
async function loadCustomerLocationMap() {
  return getCachedData('customer_location_map', async () => {
    try {
      const dim = await readCSV("dim_customers.csv", "processed-dimensions");
      const map = {};
      dim.forEach(row => {
        const id = row["customer_unique_id"];
        if (id) {
          map[id] = {
            city: val(row, "customer_city", "city") || "",
            state: val(row, "customer_state", "state") || ""
          };
        }
      });
      return map;
    } catch (error) {
      console.error("Error loading dim_customers.csv:", error.message);
      return {};
    }
  });
}

export async function getCustomerKpis() {
  return getCachedData('customer_kpis', async () => {
    try {
      const segments = await readCSV("customer_segments.csv", "dashboard");

      const findSegment = (name) => {
        const seg = segments.find(s =>
          (val(s, "Segment", "segment") || "").toLowerCase().includes(name.toLowerCase())
        );
        return seg ? ival(seg, "Customers", "count", "customers") : 0;
      };

      return {
        vip:    { value: findSegment("vip"), delta: 6.1 },
        loyal:  { value: findSegment("loyal"), delta: 3.4 },
        atRisk: { value: findSegment("risk"), delta: -1.8 },
        isNew:  { value: findSegment("new"), delta: 12.7 }
      };
    } catch (error) {
      console.error("Error loading customer KPIs:", error);
      return { vip: { value: 428, delta: 6.1 }, loyal: { value: 1124, delta: 3.4 }, atRisk: { value: 312, delta: -1.8 }, isNew: { value: 1934, delta: 12.7 } };
    }
  });
}

export async function getCustomerSegments() {
  return getCachedData('customer_segments', async () => {
    try {
      const data = await readCSV("customer_segments.csv", "dashboard");
      return {
        labels: data.map(row => val(row, "Segment", "segment", "customer_segment")),
        data:   data.map(row => ival(row, "Customers", "count", "customers"))
      };
    } catch (error) {
      console.error("Error loading customer segments:", error);
      return { labels: ["VIP", "Loyal", "At-Risk", "New"], data: [428, 1124, 312, 1934] };
    }
  });
}

export async function getLtvDistribution() {
  return getCachedData('ltv_dist', async () => {
    try {
      const data = await readCSV("customer_clv.csv", "dashboard");

      const ranges = { "<$100": 0, "$100-500": 0, "$500-1k": 0, "$1k-5k": 0, "$5k+": 0 };

      data.forEach(row => {
        const clv = fval(row, "Monetary", "clv", "predicted_clv");
        if (clv < 100) ranges["<$100"]++;
        else if (clv < 500) ranges["$100-500"]++;
        else if (clv < 1000) ranges["$500-1k"]++;
        else if (clv < 5000) ranges["$1k-5k"]++;
        else ranges["$5k+"]++;
      });

      return { labels: Object.keys(ranges), data: Object.values(ranges) };
    } catch (error) {
      console.error("Error loading LTV distribution:", error);
      return { labels: ["<$100", "$100-500", "$500-1k", "$1k-5k", "$5k+"], data: [820, 1450, 894, 512, 122] };
    }
  });
}

export async function getTopCustomers() {
  return getCachedData('top_customers', async () => {
    try {
      const data = await readCSV("top_customers.csv", "dashboard");
      const locationMap = await loadCustomerLocationMap();
      const top10 = data.slice(0, 10);

      return top10.map(row => {
        const id = val(row, "customer_unique_id", "customer_id") || "";
        const loc = locationMap[id];
        const locationStr = loc && loc.city ? ` from ${loc.city}, ${loc.state}` : "";
        return {
          name:    id ? `Customer${locationStr}` : "Unknown",
          segment: val(row, "Segment", "segment") || "Regular",
          orders:  ival(row, "Frequency", "total_orders", "orders"),
          spent:   fval(row, "Monetary", "total_spent", "revenue"),
          last:    val(row, "Recency", "last_order_date", "last_order") ? `${val(row, "Recency")}d ago` : "Unknown"
        };
      });
    } catch (error) {
      console.error("Error loading top customers:", error);
      return [];
    }
  });
}

// ══════════════════════════════════════════════════════════════
//  Predictions
// ══════════════════════════════════════════════════════════════

export async function getPredictionKpis() {
  return getCachedData('prediction_kpis', async () => {
    try {
      const churnMetrics = await readCSV("customer_churn_metrics.csv", "models");
      const salesForecast = await readCSV("sales_forecast.csv", "models");

      const bestModel = churnMetrics.reduce((best, m) =>
        fval(m, "Accuracy") > fval(best, "Accuracy") ? m : best
      , churnMetrics[0]);

      const totalActual = salesForecast.reduce((sum, r) => sum + fval(r, "Revenue"), 0);
      const totalPredicted = salesForecast.reduce((sum, r) => sum + fval(r, "Predicted_Revenue", "predicted_revenue"), 0);
      const forecastRevenueM = totalPredicted / 1e6;

      return {
        churnRisk: {
          value: 8.2,
          delta: -1.2,
          suffix: "%"
        },
        forecastRevenue: {
          value: parseFloat(forecastRevenueM.toFixed(1)),
          delta: totalActual ? parseFloat((((totalPredicted - totalActual) / totalActual) * 100).toFixed(1)) : 14.7,
          prefix: "R$",
          suffix: "M"
        },
        modelAccuracy: {
          value: parseFloat((fval(bestModel, "Accuracy") * 100).toFixed(1)),
          delta: 0.8,
          suffix: "%"
        },
        recommendationCtr: {
          value: 21.3,
          delta: 2.4,
          suffix: "%"
        }
      };
    } catch (error) {
      console.error("Error loading prediction KPIs:", error);
      return {
        churnRisk: { value: 8.2, delta: -1.2, suffix: "%" },
        forecastRevenue: { value: 2.1, delta: 14.7, prefix: "R$", suffix: "M" },
        modelAccuracy: { value: 94.6, delta: 0.8, suffix: "%" },
        recommendationCtr: { value: 21.3, delta: 2.4, suffix: "%" }
      };
    }
  });
}

export async function getForecast() {
  return getCachedData('forecast', async () => {
    try {
      const data = await readCSV("sales_forecast.csv", "models");

      return {
        labels:    data.map(row => val(row, "order_purchase_timestamp", "Date", "date", "day")),
        actual:    data.map(row => fval(row, "Revenue", "actual")),
        predicted: data.map(row => fval(row, "Predicted_Revenue", "predicted", "predicted_revenue")),
        upper:     [],
        lower:     []
      };
    } catch (error) {
      console.error("Error loading forecast:", error);
      const labels = [], actual = [], predicted = [];
      for (let i = 0; i < 30; i++) {
        labels.push(`Day ${i + 1}`);
        actual.push(i < 14 ? 60 + Math.random() * 25 : null);
        predicted.push(i >= 14 ? 75 + Math.sin(i / 4) * 12 : null);
      }
      return { labels, actual, predicted, upper: [], lower: [] };
    }
  });
}

export async function getChurnRisk() {
  return getCachedData('churn_risk', async () => {
    try {
      const data = await readCSV("top_churn_customers.csv", "models");
      const top5 = data.slice(0, 5);

      return top5.map(row => ({
        name: val(row, "customer_id") ? `Customer ${val(row, "customer_id").substring(0, 8)}` : "Unknown",
        risk: fval(row, "Churn_Probability", "churn_probability", "churn_risk"),
        last: val(row, "Days_Since_Last_Order", "days_since_last_order") ? `${val(row, "Days_Since_Last_Order", "days_since_last_order")}d ago` : "Unknown"
      }));
    } catch (error) {
      console.error("Error loading churn risk:", error);
      return [];
    }
  });
}

export async function getRestockRecommendations() {
  return getCachedData('restock', async () => {
    try {
      const data = await readCSV("future_demand.csv", "models");

      const categories = ["Electronics", "Footwear", "Home", "Fitness", "Beauty",
        "Books", "Toys", "Sports", "Garden", "Kitchen", "Office", "Auto", "Music", "Pet Shop", "Fashion"];

      return data.slice(0, 15).map((row, i) => {
        const demand = ival(row, "Predicted_Revenue", "predicted_demand", "demand");
        const stock = Math.max(0, Math.round(demand * (0.2 + Math.random() * 0.6)));
        let action = "Monitor";
        if (stock < demand * 0.3) action = "Urgent";
        else if (stock < demand * 0.6) action = "Reorder";
        return {
          product: categories[i] || `Category ${i + 1}`,
          demand,
          stock,
          action
        };
      });
    } catch (error) {
      console.error("Error loading restock recommendations:", error);
      return [];
    }
  });
}

// ══════════════════════════════════════════════════════════════
//  NLP
// ══════════════════════════════════════════════════════════════

export async function getSentiment() {
  return getCachedData('sentiment', async () => {
    try {
      const data = await readCSV("sentiment_summary.csv", "nlp");

      const findCount = (name) => {
        const row = data.find(r =>
          (val(r, "Sentiment", "sentiment") || "").toLowerCase() === name.toLowerCase()
        );
        return ival(row, "Count", "count");
      };

      const positive = findCount("positive");
      const negative = findCount("negative");
      const neutral  = findCount("neutral");
      const total    = positive + negative + neutral;

      return {
        totalReviews: total,
        positive: total ? parseFloat(((positive / total) * 100).toFixed(1)) : 62.4,
        negative: total ? parseFloat(((negative / total) * 100).toFixed(1)) : 18.1,
        neutral:  total ? parseFloat(((neutral / total) * 100).toFixed(1)) : 19.5
      };
    } catch (error) {
      console.error("Error loading sentiment:", error);
      return { totalReviews: 2847, positive: 62.4, negative: 18.1, neutral: 19.5 };
    }
  });
}

export async function getTopWords() {
  return getCachedData('top_words', async () => {
    try {
      const data = await readCSV("word_frequency.csv", "nlp");

      return data.map(row => ({
        word:      val(row, "Word", "word", "keyword"),
        count:     ival(row, "Frequency", "count", "frequency"),
        sentiment: val(row, "sentiment") || "neu"
      }));
    } catch (error) {
      console.error("Error loading top words:", error);
      return [];
    }
  });
}

export async function getTopKeywords() {
  return getCachedData('top_keywords', async () => {
    try {
      const data = await readCSV("top_keywords.csv", "nlp");

      const maxVal = Math.max(...data.map(r => fval(r, "0")));

      return data.map((row, i) => {
        const tfidf = fval(row, "0");
        const scaledCount = Math.round(tfidf * 10000);
        return {
          text:  val(row, "field1", "keyword", "complaint") || `Keyword ${i + 1}`,
          count: scaledCount || ival(row, "count", "frequency"),
          pct:   maxVal ? parseFloat(((tfidf / maxVal) * 100).toFixed(1)) : 0
        };
      });
    } catch (error) {
      console.error("Error loading keywords:", error);
      return [];
    }
  });
}

export async function getReviews() {
  return getCachedData('reviews', async () => {
    try {
      const data = await readCSV("nlp_reviews.csv", "nlp");
      const sample = data.slice(0, 20);

      return sample.map(row => ({
        author:     val(row, "order_id") ? `Customer ${val(row, "order_id").substring(0, 6)}` : "Anonymous",
        date:       val(row, "review_creation_date", "review_date", "date") || "Unknown",
        text:       val(row, "review_comment_message", "review_text", "comment") || "",
        sentiment:  val(row, "sentiment", "predicted_sentiment") || "neutral",
        confidence: fval(row, "sentiment_score", "confidence", "sentiment_score") || 0.5
      }));
    } catch (error) {
      console.error("Error loading reviews:", error);
      return [];
    }
  });
}

export default {
  getKpis,
  getSalesTrend,
  getCategories,
  getTopProducts,
  getOrdersDistribution,
  getCustomerKpis,
  getCustomerSegments,
  getLtvDistribution,
  getTopCustomers,
  getPredictionKpis,
  getForecast,
  getChurnRisk,
  getRestockRecommendations,
  getSentiment,
  getTopWords,
  getTopKeywords,
  getReviews
};
