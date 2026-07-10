# ══════════════════════════════════════════════════════════════
#  StreamIQ — Mock Data Layer  (Python · Olist-inspired schema)
#  ──────────────────────────────────────────────────────────────
#  Mirrors the Olist Brazilian E-Commerce Dataset structure:
#    orders, customers, products, payments, reviews, sellers, geo
#
#  All figures are realistic for a ~100 K-order Brazilian platform.
#  Replace any section with real DB / ML outputs when ready.
# ══════════════════════════════════════════════════════════════

import math
import random
import time
from datetime import datetime, timedelta

# ── Olist-inspired product categories ────────────────────────
OLIST_CATEGORIES = [
    "bed_bath_table",
    "health_beauty",
    "sports_leisure",
    "furniture_decor",
    "computers_accessories",
    "housewares",
    "watches_gifts",
    "telephony",
    "garden_tools",
    "auto",
]

CATEGORY_LABELS = [
    "Bed Bath & Table",
    "Health & Beauty",
    "Sports & Leisure",
    "Furniture & Décor",
    "Computers & Accessories",
    "Housewares",
    "Watches & Gifts",
    "Telephony",
    "Garden Tools",
    "Auto",
]

# ── Brazilian states (geolocation) ────────────────────────────
BR_STATES = ["SP", "RJ", "MG", "RS", "PR", "SC", "BA", "GO", "PE", "CE"]

# ── Customer names (diverse Olist-style) ──────────────────────
CUSTOMER_NAMES = [
    "Ana Souza", "Carlos Oliveira", "Mariana Lima", "Pedro Santos",
    "Juliana Costa", "Rafael Pereira", "Fernanda Rodrigues", "Bruno Alves",
    "Camila Ferreira", "Lucas Martins", "Isabela Gomes", "Gabriel Silva",
]

SELLER_NAMES = [
    "TechStore BR", "ModaMais", "CasaFácil", "EletroShop",
    "FitZone", "JardinArt", "AutoParts Pro", "BioNatura",
]

# ── 1. KPIs (dashboard overview) ─────────────────────────────
# Based on Olist ~100 K orders, avg ticket R$154 ≈ $31 USD
# Scaled to USD for a larger platform representation
KPIS = {
    "totalSales":    {"value": 2_143_870, "delta": 12.4,  "currency": "BRL"},
    "totalOrders":   {"value": 96_461,    "delta": 8.7},
    "avgOrderValue": {"value": 154,       "delta": 3.5,   "currency": "BRL"},
    "customers":     {"value": 89_043,    "delta": 5.2},
}

# ── 2. Sales trend ────────────────────────────────────────────
PERIOD_DAYS = {"7d": 7, "30d": 30, "90d": 90, "1y": 52}

def generate_sales(period="30d"):
    n = PERIOD_DAYS.get(period, 30)
    labels, data = [], []
    today = datetime.now()
    value = 58_000
    for i in range(n - 1, -1, -1):
        if period == "1y":
            d = today - timedelta(weeks=i)
            labels.append(f"Wk {n - i}")
        else:
            d = today - timedelta(days=i)
            labels.append(f"{d.month}/{d.day}")
        # Realistic seasonality: weekend dips, slight upward trend
        trend = (n - i) * 120
        noise = (random.random() - 0.45) * 9_000
        value = max(28_000, value + noise + trend * 0.1)
        data.append(round(value))
    return {"period": period, "labels": labels, "data": data}

# ── 3. Revenue by Olist category ─────────────────────────────
CATEGORIES = {
    "labels": CATEGORY_LABELS,
    "data":   [24, 18, 14, 11, 10, 8, 6, 4, 3, 2],
}

# ── 4. Top products (Olist best sellers) ─────────────────────
TOP_PRODUCTS = {
    "labels": [
        "Cama Box Queen",
        "Kit Skincare",
        "Tênis Running",
        "Luminária LED",
        "Smartwatch Fit",
        "Panela Elétrica",
        "Notebook Stand",
    ],
    "data": [186, 148, 122, 97, 84, 68, 54],
}

# ── 5. Orders distribution (Olist statuses) ───────────────────
ORDERS_DISTRIBUTION = {
    "labels": ["Delivered", "Shipped", "Processing", "Pending", "Cancelled"],
    "data":   [73, 12, 8, 5, 2],
}

# ── 6. Customer KPIs (RFM segmentation) ───────────────────────
CUSTOMER_KPIS = {
    "vip":    {"value": 3_842,  "delta": 6.1},
    "loyal":  {"value": 14_210, "delta": 3.4},
    "atRisk": {"value": 8_974,  "delta": -1.8},
    "isNew":  {"value": 62_017, "delta": 12.7},
}

CUSTOMER_SEGMENTS = {
    "labels": ["VIP", "Loyal", "At-Risk", "New"],
    "data":   [3842, 14210, 8974, 62017],
}

# ── 7. Lifetime value distribution ────────────────────────────
LTV_DISTRIBUTION = {
    "labels": ["<R$100", "R$100-500", "R$500-1k", "R$1k-5k", "R$5k+"],
    "data":   [22_400, 41_300, 16_800, 7_200, 1_343],
}

# ── 8. Top customers table ────────────────────────────────────
CUSTOMERS = [
    {"name": "Ana Souza",         "segment": "VIP",     "orders": 47, "spent": 12_480, "last": "2d ago",  "state": "SP"},
    {"name": "Carlos Oliveira",   "segment": "VIP",     "orders": 38, "spent": 9_215,  "last": "1d ago",  "state": "RJ"},
    {"name": "Mariana Lima",      "segment": "Loyal",   "orders": 24, "spent": 4_870,  "last": "5d ago",  "state": "MG"},
    {"name": "Pedro Santos",      "segment": "Loyal",   "orders": 22, "spent": 4_421,  "last": "3d ago",  "state": "SP"},
    {"name": "Juliana Costa",     "segment": "At-Risk", "orders": 8,  "spent": 1_240,  "last": "42d ago", "state": "BA"},
    {"name": "Rafael Pereira",    "segment": "New",     "orders": 2,  "spent": 312,    "last": "6h ago",  "state": "PR"},
    {"name": "Fernanda Rodrigues","segment": "Loyal",   "orders": 18, "spent": 3_680,  "last": "4d ago",  "state": "RS"},
    {"name": "Bruno Alves",       "segment": "VIP",     "orders": 33, "spent": 8_740,  "last": "8h ago",  "state": "SC"},
]

# ── 9. Prediction KPIs ────────────────────────────────────────
PREDICTION_KPIS = {
    "churnRisk":         {"value": 8.2,  "delta": -1.2, "suffix": "%"},
    "forecastRevenue":   {"value": 2.4,  "delta": 14.7, "prefix": "R$", "suffix": "M"},
    "modelAccuracy":     {"value": 94.6, "delta":  0.8, "suffix": "%"},
    "recommendationCtr": {"value": 21.3, "delta":  2.4, "suffix": "%"},
}

# ── 10. Demand forecast (scikit-learn Prophet-style output) ──
def generate_forecast():
    """
    Simulates output from a scikit-learn / Prophet forecasting model.
    First 14 days = actual historical data.
    Days 15-30 = model-predicted demand with upper/lower confidence bands.
    """
    labels, actual, predicted, lower, upper = [], [], [], [], []
    base = 68.0
    for i in range(30):
        labels.append(f"Day {i + 1}")
        # Simulate weekly seasonality
        seasonal = 8 * math.sin(2 * math.pi * i / 7)
        trend = i * 0.4
        noise = random.gauss(0, 3)
        val = base + seasonal + trend + noise

        if i < 14:
            actual.append(round(val, 1))
            predicted.append(None)
            lower.append(None)
            upper.append(None)
        elif i == 14:
            actual.append(round(val, 1))
            predicted.append(round(val, 1))
            lower.append(round(val - 4, 1))
            upper.append(round(val + 4, 1))
        else:
            actual.append(None)
            pred_val = base + seasonal + trend + random.gauss(0, 1.5)
            predicted.append(round(pred_val, 1))
            lower.append(round(pred_val - 5 - i * 0.15, 1))
            upper.append(round(pred_val + 5 + i * 0.15, 1))

    return {
        "labels": labels,
        "actual": actual,
        "predicted": predicted,
        "lower": lower,
        "upper": upper,
        "model": "RandomForestRegressor",
        "rmse": 4.23,
        "r2": 0.91,
    }

# ── 11. Churn risk (Random Forest classifier output) ──────────
CHURN_RISK = [
    {"name": "Juliana Costa",     "risk": 0.87, "last": "42d ago", "orders": 8,  "state": "BA", "model": "RF"},
    {"name": "Roberto Dias",      "risk": 0.81, "last": "38d ago", "orders": 5,  "state": "PE", "model": "RF"},
    {"name": "Sofia Monteiro",    "risk": 0.74, "last": "31d ago", "orders": 7,  "state": "CE", "model": "RF"},
    {"name": "Daniel Carvalho",   "risk": 0.68, "last": "28d ago", "orders": 9,  "state": "GO", "model": "RF"},
    {"name": "Maya Araújo",       "risk": 0.62, "last": "24d ago", "orders": 11, "state": "MG", "model": "RF"},
]

# ── 12. Restock (demand forecasting → inventory action) ───────
RESTOCK = [
    {"product": "Cama Box Queen",   "demand": 520, "stock": 124, "action": "Reorder",  "category": "bed_bath_table"},
    {"product": "Kit Skincare",      "demand": 380, "stock": 87,  "action": "Reorder",  "category": "health_beauty"},
    {"product": "Tênis Running",     "demand": 295, "stock": 198, "action": "Monitor",  "category": "sports_leisure"},
    {"product": "Panela Elétrica",   "demand": 241, "stock": 56,  "action": "Urgent",   "category": "housewares"},
    {"product": "Smartwatch Fit",    "demand": 198, "stock": 142, "action": "Monitor",  "category": "watches_gifts"},
]

# ── 13. NLP — Sentiment (NLTK/spaCy-style output) ────────────
SENTIMENT = {
    "totalReviews": 98_410,
    "positive": 57.2,
    "negative": 19.4,
    "neutral":  23.4,
    "avgScore": 3.9,
    "model": "VADER + spaCy pt_core_news_sm",
}

# ── 14. NLP — Word frequency (bigrams + unigrams) ─────────────
WORDS = [
    {"word": "entrega rápida",      "count": 8_421, "sentiment": "pos"},
    {"word": "ótima qualidade",     "count": 7_387, "sentiment": "pos"},
    {"word": "recomendo",           "count": 6_312, "sentiment": "pos"},
    {"word": "produto excelente",   "count": 5_298, "sentiment": "pos"},
    {"word": "perfeito",            "count": 4_876, "sentiment": "pos"},
    {"word": "chegou antes",        "count": 3_954, "sentiment": "pos"},
    {"word": "durável",             "count": 3_198, "sentiment": "pos"},
    {"word": "amei",                "count": 2_887, "sentiment": "pos"},
    {"word": "atrasou",             "count": 2_143, "sentiment": "neg"},
    {"word": "razoável",            "count": 1_934, "sentiment": "neu"},
    {"word": "veio quebrado",       "count": 1_728, "sentiment": "neg"},
    {"word": "regular",             "count": 1_521, "sentiment": "neu"},
    {"word": "decepcionado",        "count": 1_312, "sentiment": "neg"},
    {"word": "ok",                  "count": 1_108, "sentiment": "neu"},
    {"word": "caro demais",         "count": 998,   "sentiment": "neg"},
    {"word": "como esperado",       "count": 894,   "sentiment": "neu"},
    {"word": "qualidade ruim",      "count": 787,   "sentiment": "neg"},
    {"word": "nada especial",       "count": 676,   "sentiment": "neu"},
]

# ── 15. NLP — Top complaints ──────────────────────────────────
COMPLAINTS = [
    {"text": "Atraso na entrega / entrega tardia",     "count": 2_143, "pct": 28.1},
    {"text": "Produto chegou danificado ou quebrado",  "count": 1_728, "pct": 22.7},
    {"text": "Item diferente da descrição",            "count": 1_312, "pct": 17.2},
    {"text": "Preço alto para a qualidade",            "count": 998,   "pct": 13.1},
    {"text": "Processo de devolução difícil",          "count": 721,   "pct":  9.4},
    {"text": "Embalagem danificada",                   "count": 521,   "pct":  6.8},
    {"text": "Atendimento ruim",                       "count": 200,   "pct":  2.6},
]

# ── 16. NLP — Review Explorer (Olist-style reviews in PT) ─────
REVIEWS = [
    {
        "author": "Ana S.",     "date": "2d ago",
        "text": "Amei o produto! Chegou super rápido e a qualidade é excelente. Recomendo muito!",
        "sentiment": "positive", "confidence": 0.96, "score": 5,
        "category": "bed_bath_table",
    },
    {
        "author": "Carlos O.",  "date": "3d ago",
        "text": "Produto razoável pelo preço. Nada extraordinário, mas cumpre o que promete.",
        "sentiment": "neutral",  "confidence": 0.71, "score": 3,
        "category": "housewares",
    },
    {
        "author": "Juliana C.", "date": "5d ago",
        "text": "Muito decepcionada. O produto chegou danificado e o atendimento foi péssimo.",
        "sentiment": "negative", "confidence": 0.93, "score": 1,
        "category": "computers_accessories",
    },
    {
        "author": "Pedro S.",   "date": "6d ago",
        "text": "Ótimo custo-benefício! Recomendo para quem busca um produto confiável.",
        "sentiment": "positive", "confidence": 0.94, "score": 5,
        "category": "sports_leisure",
    },
    {
        "author": "Fernanda R.", "date": "1w ago",
        "text": "A entrega atrasou 5 dias. O produto em si está ok, mas esperava mais rapidez.",
        "sentiment": "negative", "confidence": 0.78, "score": 2,
        "category": "health_beauty",
    },
    {
        "author": "Bruno A.",   "date": "1w ago",
        "text": "Perfeito! Exatamente como descrito, entrega rápida e ótima qualidade.",
        "sentiment": "positive", "confidence": 0.97, "score": 5,
        "category": "watches_gifts",
    },
    {
        "author": "Mariana L.", "date": "2w ago",
        "text": "Produto médio. Não condiz 100% com as fotos, mas funciona bem.",
        "sentiment": "neutral",  "confidence": 0.68, "score": 3,
        "category": "furniture_decor",
    },
    {
        "author": "Rafael P.",  "date": "2w ago",
        "text": "Caro demais para o que entrega. Esperava melhor qualidade neste preço.",
        "sentiment": "negative", "confidence": 0.85, "score": 2,
        "category": "telephony",
    },
]

# ══════════════════════════════════════════════════════════════
#  LIVE MONITORING — Kafka-style simulated event stream
#  Orders push every 4 s (mimics Kafka consumer)
# ══════════════════════════════════════════════════════════════

_ORDER_STATUSES = [
    {"label": "Delivered",  "cls": "status-completed"},
    {"label": "Shipped",    "cls": "status-shipped"},
    {"label": "Processing", "cls": "status-processing"},
    {"label": "Pending",    "cls": "status-pending"},
]

_next_order_id = 84_240
_live_orders: list = []


def _make_order(ts: datetime) -> dict:
    global _next_order_id
    _next_order_id += 1
    return {
        "time":     ts.isoformat(),
        "id":       f"#{_next_order_id}",
        "customer": random.choice(CUSTOMER_NAMES),
        "seller":   random.choice(SELLER_NAMES),
        "amount":   round(random.uniform(29.90, 499.90), 2),
        "state":    random.choice(BR_STATES),
        "status":   random.choice(_ORDER_STATUSES),
        "category": random.choice(OLIST_CATEGORIES),
    }


def _seed_orders():
    now = datetime.now()
    for i in range(7, -1, -1):
        _live_orders.append(_make_order(now - timedelta(seconds=i * 35)))


_seed_orders()


def get_live_orders() -> list:
    """Add a new order (simulates Kafka consumer receiving an event)."""
    _live_orders.insert(0, _make_order(datetime.now()))
    if len(_live_orders) > 20:
        _live_orders.pop()
    return _live_orders


def get_monitoring_stats() -> dict:
    return {
        "ordersPerMin":    8 + random.randint(0, 14),
        "activeSessions":  450 + random.randint(0, 120),
        "cartAbandonment": {"value": round(22.8 + random.uniform(-1.5, 1.5), 1), "delta": -0.6, "suffix": "%"},
        "systemStatus":    "Healthy",
        "pipeline":        "Apache Kafka → PySpark → PostgreSQL",
        "lastIngested":    datetime.now().strftime("%H:%M:%S"),
    }
