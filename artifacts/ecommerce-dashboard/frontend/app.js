/* ══════════════════════════════════════════════════════════════
   StreamIQ — Dashboard Frontend
   Supports: Admin role (full access) / User role (restricted)
   ══════════════════════════════════════════════════════════════ */

// ── Auth guard ────────────────────────────────────────────────
const ROLE = localStorage.getItem("nexora-role");
if (!ROLE) {
  window.location.replace("/");
}

const IS_ADMIN = ROLE === "admin";

const API = "api";

async function fetchJson(path) {
  const res = await fetch(`${API}/${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${path}`);
  return res.json();
}

// ── Role UI setup ─────────────────────────────────────────────
function setupRoleUI() {
  const badge  = document.getElementById("roleBadge");
  const avatar = document.getElementById("roleAvatar");
  const name   = document.getElementById("roleName");
  const label  = document.getElementById("roleLabel");
  const dot    = document.getElementById("roleDot");

  if (IS_ADMIN) {
    avatar.textContent  = "A";
    name.textContent    = "Admin";
    label.textContent   = "Role: Admin";
    badge.classList.add("role-admin");
    dot.style.background = "#4ade80";
  } else {
    avatar.textContent  = "U";
    name.textContent    = "User";
    label.textContent   = "Role: User";
    badge.classList.add("role-user");
    dot.style.background = "#60a5fa";
  }

  // Hide admin-only nav items for User role
  if (!IS_ADMIN) {
    document.querySelectorAll(".admin-only").forEach(el => {
      el.style.display = "none";
    });
  }
}

setupRoleUI();

// ── Logout ────────────────────────────────────────────────────
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("nexora-role");
  window.location.replace("/");
});

// ── Brand click returns home ──────────────────────────────────
const brandLink = document.querySelector(".brand");
if (brandLink) {
  brandLink.addEventListener("click", () => {
    window.location.replace("/");
  });
}

// ── Theme management ──────────────────────────────────────────
const THEME_KEY = "nexora-theme";

function applyTheme(theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem(THEME_KEY, theme);
  const label = document.querySelector(".theme-label");
  if (label) label.textContent = theme === "dark" ? "Light Mode" : "Dark Mode";
  renderAllCharts();
}

function toggleTheme() {
  const isDark = document.documentElement.classList.contains("dark");
  applyTheme(isDark ? "light" : "dark");
}

document.getElementById("themeBtnSidebar").addEventListener("click", toggleTheme);
document.getElementById("themeBtnTop").addEventListener("click", toggleTheme);
applyTheme(localStorage.getItem(THEME_KEY) || "light");

// ── Page navigation ───────────────────────────────────────────
const PAGE_TITLES = {
  dashboard:   "Dashboard",
  customers:   "Customers",
  predictions: "Predictions",
  nlp:         "NLP Insights",
  monitoring:  "Real-Time Monitoring",
};

document.querySelectorAll(".nav-item").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const page = link.dataset.page;

    // Block user from accessing monitoring
    if (page === "monitoring" && !IS_ADMIN) return;

    document.querySelectorAll(".nav-item").forEach((n) => n.classList.toggle("active", n === link));
    document.querySelectorAll(".page").forEach((p) => p.classList.toggle("hidden", p.id !== `page-${page}`));
    document.getElementById("pageTitle").textContent = PAGE_TITLES[page];
    window.scrollTo(0, 0);
  });
});

// ── Theme-aware chart colors ──────────────────────────────────
function colors() {
  const isDark = document.documentElement.classList.contains("dark");
  return {
    primary: isDark ? "#4f9bff" : "#2f80ed",
    grid:    isDark ? "rgba(255,255,255,0.06)" : "rgba(10,31,68,0.06)",
    text:    isDark ? "#a4b1c8" : "#51607a",
    palette: ["#2f80ed","#16a34a","#f59e0b","#a855f7","#ef4444","#06b6d4","#ec4899","#84cc16","#f97316","#14b8a6"],
  };
}

Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.font.size   = 11;

const charts = {};
const cache  = {};

// ── KPI / number rendering ────────────────────────────────────
function fmtNumber(n) { return n.toLocaleString(); }

function deltaHtml({ delta }) {
  const up = delta >= 0;
  return `<div class="kpi-delta ${up ? "up" : "down"}">${up ? "▲" : "▼"} ${up ? "+" : ""}${delta}% vs last period</div>`;
}

function renderDashboardKpis(d) {
  const fmt = (n) => "R$" + Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  document.querySelector("#kpiTotalSales .kpi-value").textContent = fmt(d.totalSales.value);
  document.querySelector("#kpiTotalSales .kpi-delta-slot").outerHTML = `<div class="kpi-delta-slot">${deltaHtml(d.totalSales)}</div>`;
  document.querySelector("#kpiOrders .kpi-value").textContent = fmtNumber(d.totalOrders.value);
  document.querySelector("#kpiOrders .kpi-delta-slot").outerHTML = `<div class="kpi-delta-slot">${deltaHtml(d.totalOrders)}</div>`;
  document.querySelector("#kpiAov .kpi-value").textContent = fmt(d.avgOrderValue.value);
  document.querySelector("#kpiAov .kpi-delta-slot").outerHTML = `<div class="kpi-delta-slot">${deltaHtml(d.avgOrderValue)}</div>`;
  document.querySelector("#kpiCustomers .kpi-value").textContent = fmtNumber(d.customers.value);
  document.querySelector("#kpiCustomers .kpi-delta-slot").outerHTML = `<div class="kpi-delta-slot">${deltaHtml(d.customers)}</div>`;
}

function renderCustomerKpis(d) {
  const set = (id, k) => {
    document.querySelector(`#${id} .kpi-value`).textContent = fmtNumber(k.value);
    document.querySelector(`#${id} .kpi-delta-slot`).outerHTML = `<div class="kpi-delta-slot">${deltaHtml(k)}</div>`;
  };
  set("ckpiVip", d.vip); set("ckpiLoyal", d.loyal); set("ckpiRisk", d.atRisk); set("ckpiNew", d.isNew);
}

function renderPredictionKpis(d) {
  const fmt = (k) => `${k.prefix || ""}${k.value}${k.suffix || ""}`;
  const set = (id, k) => {
    document.querySelector(`#${id} .kpi-value`).textContent = fmt(k);
    document.querySelector(`#${id} .kpi-delta-slot`).outerHTML = `<div class="kpi-delta-slot">${deltaHtml(k)}</div>`;
  };
  set("pkpiChurn",    d.churnRisk);
  set("pkpiForecast", d.forecastRevenue);
  set("pkpiAccuracy", d.modelAccuracy);
  set("pkpiCtr",      d.recommendationCtr);
}

// ── Chart renderers ───────────────────────────────────────────
function renderSalesChart() {
  const c = colors();
  const data = cache.sales;
  if (!data) return;
  const ctx = document.getElementById("salesChart");
  const grad = ctx.getContext("2d").createLinearGradient(0, 0, 0, 280);
  grad.addColorStop(0, c.primary + "55");
  grad.addColorStop(1, c.primary + "00");
  if (charts.sales) charts.sales.destroy();
  charts.sales = new Chart(ctx, {
    type: "line",
    data: { labels: data.labels, datasets: [{
      data: data.data, borderColor: c.primary, backgroundColor: grad,
      borderWidth: 2.5, fill: true, tension: 0.35,
      pointRadius: 0, pointHoverRadius: 5, pointHoverBackgroundColor: c.primary,
    }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: {
        backgroundColor: "#0a1f44", titleColor: "#fff", bodyColor: "#cbd5e1",
        padding: 10, cornerRadius: 6, displayColors: false,
        callbacks: { label: (ctx) => "R$" + ctx.parsed.y.toLocaleString() },
      }},
      scales: {
        x: { grid: { display: false }, ticks: { color: c.text } },
        y: { grid: { color: c.grid }, ticks: { color: c.text, callback: v => "R$" + (v/1000).toFixed(0) + "k" } },
      },
    },
  });
}

function renderCategoryChart() {
  const c = colors();
  const data = cache.categories;
  if (!data) return;
  const ctx = document.getElementById("categoryChart");
  if (charts.category) charts.category.destroy();
  charts.category = new Chart(ctx, {
    type: "doughnut",
    data: { labels: data.labels, datasets: [{ data: data.data, backgroundColor: c.palette, borderWidth: 0 }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: "60%",
      plugins: { legend: { position: "bottom", labels: { color: c.text, padding: 10, boxWidth: 10, boxHeight: 10, usePointStyle: true } } } },
  });
}

function renderProductsChart() {
  const c = colors();
  const data = cache.products;
  if (!data) return;
  const ctx = document.getElementById("productsChart");
  if (charts.products) charts.products.destroy();
  charts.products = new Chart(ctx, {
    type: "bar",
    data: { labels: data.labels, datasets: [{ data: data.data, backgroundColor: c.primary, borderRadius: 6, barThickness: 18 }] },
    options: { indexAxis: "y", responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.parsed.x + "k units" } } },
      scales: { x: { grid: { color: c.grid }, ticks: { color: c.text, callback: v => v + "k" } },
                y: { grid: { display: false }, ticks: { color: c.text } } } },
  });
}

function renderOrdersChart() {
  const c = colors();
  const data = cache.ordersDist;
  if (!data) return;
  const ctx = document.getElementById("ordersChart");
  if (charts.orders) charts.orders.destroy();
  charts.orders = new Chart(ctx, {
    type: "doughnut",
    data: { labels: data.labels, datasets: [{ data: data.data,
      backgroundColor: ["#16a34a","#2f80ed","#f59e0b","#94a3b8","#ef4444"], borderWidth: 0 }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: "65%",
      plugins: { legend: { position: "bottom", labels: { color: c.text, padding: 10, boxWidth: 10, boxHeight: 10, usePointStyle: true } } } },
  });
}

function renderSegmentChart() {
  const c = colors();
  const data = cache.segments;
  if (!data) return;
  const ctx = document.getElementById("segmentChart");
  if (charts.segment) charts.segment.destroy();
  charts.segment = new Chart(ctx, {
    type: "doughnut",
    data: { labels: data.labels, datasets: [{ data: data.data,
      backgroundColor: ["#2f80ed","#16a34a","#ef4444","#f59e0b"], borderWidth: 0 }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: "62%",
      plugins: { legend: { position: "bottom", labels: { color: c.text, padding: 10, boxWidth: 10, boxHeight: 10, usePointStyle: true } } } },
  });
}

function renderLtvChart() {
  const c = colors();
  const data = cache.ltv;
  if (!data) return;
  const ctx = document.getElementById("ltvChart");
  if (charts.ltv) charts.ltv.destroy();
  charts.ltv = new Chart(ctx, {
    type: "bar",
    data: { labels: data.labels, datasets: [{ data: data.data, backgroundColor: c.primary, borderRadius: 6 }] },
    options: { responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: { grid: { display: false }, ticks: { color: c.text } },
                y: { grid: { color: c.grid }, ticks: { color: c.text } } } },
  });
}

function renderForecastChart() {
  const c = colors();
  const data = cache.forecast;
  if (!data) return;
  const ctx = document.getElementById("forecastChart");
  if (charts.forecast) charts.forecast.destroy();
  charts.forecast = new Chart(ctx, {
    type: "line",
    data: { labels: data.labels, datasets: [
      { label: "Actual",    data: data.actual,    borderColor: c.primary,  borderWidth: 2.5, tension: 0.35, pointRadius: 0, fill: false },
      { label: "Forecast",  data: data.predicted, borderColor: "#16a34a",  borderWidth: 2.5, borderDash: [6,4], tension: 0.35, pointRadius: 0, fill: false },
      { label: "Upper CI",  data: data.upper,     borderColor: "rgba(22,163,74,0.2)", borderWidth: 1, pointRadius: 0, fill: false },
      { label: "Lower CI",  data: data.lower,     borderColor: "rgba(22,163,74,0.2)", borderWidth: 1, pointRadius: 0, fill: false },
    ] },
    options: { responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: "top", align: "end", labels: { color: c.text, boxWidth: 10, boxHeight: 10, usePointStyle: true,
        filter: (item) => !item.text.includes("CI") } } },
      scales: { x: { grid: { display: false }, ticks: { color: c.text, maxRotation: 0, autoSkipPadding: 18 } },
                y: { grid: { color: c.grid }, ticks: { color: c.text, callback: v => v + "k" } } } },
  });
}

function renderAllCharts() {
  requestAnimationFrame(() => {
    renderSalesChart();
    renderCategoryChart();
    renderProductsChart();
    renderOrdersChart();
    renderSegmentChart();
    renderLtvChart();
    renderForecastChart();
  });
}

// ── Period selector ───────────────────────────────────────────
document.getElementById("periodSelector").addEventListener("click", async (e) => {
  if (e.target.tagName !== "BUTTON") return;
  document.querySelectorAll("#periodSelector button").forEach((b) => b.classList.toggle("active", b === e.target));
  cache.sales = await fetchJson(`sales?period=${e.target.dataset.period}`);
  renderSalesChart();
});

// ── Tables & lists ────────────────────────────────────────────
const segmentClass = { VIP: "tag-vip", Loyal: "tag-loyal", "At-Risk": "tag-risk", New: "tag-new" };

function renderCustomersTable(rows) {
  document.getElementById("customersTable").innerHTML = rows.map((c) => `
    <tr>
      <td><strong>${c.name}</strong></td>
      <td><span class="tag ${segmentClass[c.segment]}">${c.segment}</span></td>
      <td>${c.orders}</td>
      <td>R$${c.spent.toLocaleString()}</td>
      <td>${c.last}</td>
    </tr>`).join("");
}

function renderChurnTable(rows) {
  document.getElementById("churnTable").innerHTML = rows.map((c) => `
    <tr>
      <td><strong>${c.name}</strong></td>
      <td><span class="risk-bar"><span class="risk-fill" style="width:${c.risk*100}%"></span></span>${(c.risk*100).toFixed(0)}%</td>
      <td>${c.last}</td>
    </tr>`).join("");
}

function renderRestockTable(rows) {
  document.getElementById("restockTable").innerHTML = rows.map((r) => {
    const cls = r.action === "Urgent" ? "tag-risk" : (r.action === "Reorder" ? "tag-new" : "tag-loyal");
    return `<tr>
      <td><strong>${r.product}</strong></td>
      <td>${r.demand}</td>
      <td>${r.stock}</td>
      <td><span class="tag ${cls}">${r.action}</span></td>
    </tr>`;
  }).join("");
}

function renderWordCloud(words) {
  document.getElementById("wordCloud").innerHTML = words.map((w) => {
    const cls  = w.sentiment === "pos" ? "word-pos" : (w.sentiment === "neg" ? "word-neg" : "word-neu");
    const size = 11 + Math.min(8, w.count / 1000);
    return `<span class="word-tag ${cls}" style="font-size:${size}px">${w.word}<span class="count">${w.count.toLocaleString()}</span></span>`;
  }).join("");
}

function renderComplaints(items) {
  document.getElementById("complaintsList").innerHTML = items.map((c, i) => `
    <li>
      <div class="cmp-head">
        <span><span class="cmp-rank">${i+1}.</span>${c.text}</span>
        <span class="cmp-count">${c.count.toLocaleString()}</span>
      </div>
      <div class="cmp-bar"><div class="cmp-fill" style="width:${c.pct * 3.2}%"></div></div>
      <div class="cmp-pct">${c.pct}% of complaints</div>
    </li>`).join("");
}

function renderSentiment(s) {
  document.getElementById("sentTotal").textContent = s.totalReviews.toLocaleString();
  const set = (id, val) => {
    document.querySelector(`#${id} .sent-pct`).innerHTML = `${val}<small>%</small>`;
    document.querySelector(`#${id} .bar-fill`).style.width = val + "%";
  };
  set("sentPos", s.positive); set("sentNeg", s.negative); set("sentNeu", s.neutral);
}

// ── Reviews (with filtering) ──────────────────────────────────
function filterAndRenderReviews() {
  const search = document.getElementById("reviewSearch").value.toLowerCase();
  const filter = document.getElementById("sentimentFilter").value;
  const filtered = (cache.reviews || []).filter((r) =>
    (filter === "all" || r.sentiment === filter) &&
    (search === "" || r.text.toLowerCase().includes(search) || r.author.toLowerCase().includes(search))
  );
  document.getElementById("reviewsList").innerHTML = filtered.length ? filtered.map((r) => `
    <div class="review">
      <div class="review-head">
        <span class="review-author">${r.author}</span>
        <span class="review-date">${r.date}</span>
      </div>
      <div class="review-text">${r.text}</div>
      <div class="review-meta">
        <span class="sent-badge ${r.sentiment}">${r.sentiment}</span>
        <span class="review-conf">Confidence: ${(r.confidence * 100).toFixed(0)}%</span>
        <span class="review-cat">${r.category || ""}</span>
      </div>
    </div>`).join("") : '<p style="color:var(--fg-muted);padding:20px;text-align:center">No reviews match your filters.</p>';
}
document.getElementById("reviewSearch").addEventListener("input", filterAndRenderReviews);
document.getElementById("sentimentFilter").addEventListener("change", filterAndRenderReviews);

// ── Live monitoring (Admin only) ──────────────────────────────
function renderLiveOrders(rows) {
  const fmtTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  document.getElementById("liveOrdersTable").innerHTML = rows.slice(0, 12).map((o) => `
    <tr>
      <td><code>${fmtTime(o.time)}</code></td>
      <td><strong>${o.id}</strong></td>
      <td>${o.customer}</td>
      <td>${o.seller || "—"}</td>
      <td>R$${o.amount.toFixed(2)}</td>
      <td><span class="state-tag">${o.state || "—"}</span></td>
      <td><span class="status-pill ${o.status.cls}">${o.status.label}</span></td>
    </tr>`).join("");
}

function renderMonitoringStats(s) {
  document.getElementById("liveOpm").textContent = s.ordersPerMin;
  document.getElementById("liveSessions").textContent = s.activeSessions;
  document.querySelector("#mkpiCart .kpi-value").textContent = s.cartAbandonment.value + s.cartAbandonment.suffix;
  document.querySelector("#mkpiCart .kpi-delta-slot").outerHTML = `<div class="kpi-delta-slot">${deltaHtml(s.cartAbandonment)}</div>`;
}

async function pollMonitoring() {
  if (!IS_ADMIN) return;
  try {
    const [orders, stats] = await Promise.all([
      fetchJson("monitoring/orders"),
      fetchJson("monitoring/stats"),
    ]);
    renderLiveOrders(orders);
    renderMonitoringStats(stats);
  } catch (e) { console.error("Monitoring poll failed:", e); }
}
setInterval(pollMonitoring, 4000);

// ── Initial load ─────────────────────────────────────────────
async function init() {
  try {
    const fetchList = [
      fetchJson("kpis"),
      fetchJson("sales?period=30d"),
      fetchJson("categories"),
      fetchJson("products"),
      fetchJson("orders-distribution"),
      fetchJson("customer-kpis"),
      fetchJson("customer-segments"),
      fetchJson("ltv"),
      fetchJson("customers"),
      fetchJson("prediction-kpis"),
      fetchJson("forecast"),
      fetchJson("churn"),
      fetchJson("restock"),
      fetchJson("nlp/sentiment"),
      fetchJson("nlp/words"),
      fetchJson("nlp/complaints"),
      fetchJson("nlp/reviews"),
    ];

    // Monitoring only for admins
    if (IS_ADMIN) {
      fetchList.push(fetchJson("monitoring/orders"), fetchJson("monitoring/stats"));
    }

    const results = await Promise.all(fetchList);
    const [
      kpis, sales, cats, prods, ordersDist,
      cKpis, segs, ltv, custs,
      pKpis, fc, churn, rstk,
      sent, wds, comps, revs,
      liveOrd, monStats,
    ] = results;

    cache.sales      = sales;
    cache.categories = cats;
    cache.products   = prods;
    cache.ordersDist = ordersDist;
    cache.segments   = segs;
    cache.ltv        = ltv;
    cache.forecast   = fc;
    cache.reviews    = revs;

    renderDashboardKpis(kpis);
    renderCustomerKpis(cKpis);
    renderPredictionKpis(pKpis);
    renderCustomersTable(custs);
    renderChurnTable(churn);
    renderRestockTable(rstk);
    renderSentiment(sent);
    renderWordCloud(wds);
    renderComplaints(comps);
    filterAndRenderReviews();

    if (IS_ADMIN && liveOrd) {
      renderLiveOrders(liveOrd);
      renderMonitoringStats(monStats);
    }

    renderAllCharts();
  } catch (e) {
    console.error("Failed to load dashboard data:", e);
    document.querySelector(".content").insertAdjacentHTML("afterbegin",
      `<div style="background:#fee;color:#b00;padding:14px 18px;border-radius:8px;margin-bottom:18px">
        Could not connect to the backend API. Make sure the server is running.
      </div>`);
  }
}

init();
