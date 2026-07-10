# ══════════════════════════════════════════════════════════════
#  StreamIQ — Backend API Server
#  ──────────────────────────────────────────────────────────────
#  Technology Stack (per Technical Plan):
#    • Language:   Python 3.11
#    • Framework:  Flask (REST API)
#    • Data:       Olist Brazilian E-Commerce Dataset (mock)
#    • ML layer:   scikit-learn / Prophet outputs (simulated)
#    • Streaming:  Apache Kafka event-stream simulation
#    • Pipeline:   ETL/ELT → PostgreSQL / Azure Synapse ready
#
#  Routes:
#    GET /              → Landing page
#    GET /dashboard     → Main dashboard (requires role in localStorage)
#    GET /api/*         → REST API endpoints
#    GET /<static>      → Frontend static files
# ══════════════════════════════════════════════════════════════

import os
import sys
import mimetypes
from pathlib import Path
from flask import Flask, jsonify, request, send_file, abort

# ── Resolve paths ─────────────────────────────────────────────
HERE     = Path(__file__).parent           # backend/
ROOT     = HERE.parent                     # ecommerce-dashboard/
FRONTEND = ROOT / "frontend"

PORT      = int(os.environ.get("PORT", 3000))
BASE_PATH = os.environ.get("BASE_PATH", "/").rstrip("/")   # "" or "/prefix"

# ── Import mock data layer ────────────────────────────────────
sys.path.insert(0, str(HERE))
from data import (
    KPIS, generate_sales, CATEGORIES, TOP_PRODUCTS, ORDERS_DISTRIBUTION,
    CUSTOMER_KPIS, CUSTOMER_SEGMENTS, LTV_DISTRIBUTION, CUSTOMERS,
    PREDICTION_KPIS, generate_forecast, CHURN_RISK, RESTOCK,
    SENTIMENT, WORDS, COMPLAINTS, REVIEWS,
    get_live_orders, get_monitoring_stats,
)

# ── Flask app ─────────────────────────────────────────────────
app = Flask(__name__, static_folder=None)
app.config["JSON_SORT_KEYS"] = False

# ── CORS + cache headers ──────────────────────────────────────
@app.after_request
def add_headers(resp):
    resp.headers["Access-Control-Allow-Origin"]  = "*"
    resp.headers["Access-Control-Allow-Headers"] = "Content-Type"
    resp.headers["Cache-Control"]                = "no-store"
    return resp

# ── Static file helper ────────────────────────────────────────
def _serve(filename: str):
    target = (FRONTEND / filename).resolve()
    try:
        target.relative_to(FRONTEND.resolve())
    except ValueError:
        abort(403)
    if not target.is_file():
        abort(404)
    mime, _ = mimetypes.guess_type(str(target))
    return send_file(target, mimetype=mime or "application/octet-stream")

# ══════════════════════════════════════════════════════════════
#  PAGE ROUTES
# ══════════════════════════════════════════════════════════════

@app.route(f"{BASE_PATH}/")
def landing():
    """Root — serves the StreamIQ landing page."""
    return send_file(FRONTEND / "landing.html", mimetype="text/html")

@app.route(f"{BASE_PATH}/dashboard")
def dashboard():
    """Dashboard — serves the main analytics app."""
    return send_file(FRONTEND / "index.html", mimetype="text/html")

# ── Static assets (css, js, svg, etc.) ───────────────────────
@app.route(f"{BASE_PATH}/<path:filename>")
def static_files(filename):
    # Block path traversal; API routes handled separately
    if filename.startswith("api/"):
        abort(404)
    target = (FRONTEND / filename).resolve()
    try:
        target.relative_to(FRONTEND.resolve())
    except ValueError:
        abort(403)
    if target.is_file():
        mime, _ = mimetypes.guess_type(str(target))
        return send_file(target, mimetype=mime or "application/octet-stream")
    # SPA fallback
    return send_file(FRONTEND / "index.html", mimetype="text/html")

# ══════════════════════════════════════════════════════════════
#  API ROUTES  (/api/*)
# ══════════════════════════════════════════════════════════════

@app.route(f"{BASE_PATH}/api/kpis")
def api_kpis():
    return jsonify(KPIS)

@app.route(f"{BASE_PATH}/api/sales")
def api_sales():
    period = request.args.get("period", "30d")
    return jsonify(generate_sales(period))

@app.route(f"{BASE_PATH}/api/categories")
def api_categories():
    return jsonify(CATEGORIES)

@app.route(f"{BASE_PATH}/api/products")
def api_products():
    return jsonify(TOP_PRODUCTS)

@app.route(f"{BASE_PATH}/api/orders-distribution")
def api_orders_distribution():
    return jsonify(ORDERS_DISTRIBUTION)

@app.route(f"{BASE_PATH}/api/customer-kpis")
def api_customer_kpis():
    return jsonify(CUSTOMER_KPIS)

@app.route(f"{BASE_PATH}/api/customer-segments")
def api_customer_segments():
    return jsonify(CUSTOMER_SEGMENTS)

@app.route(f"{BASE_PATH}/api/ltv")
def api_ltv():
    return jsonify(LTV_DISTRIBUTION)

@app.route(f"{BASE_PATH}/api/customers")
def api_customers():
    return jsonify(CUSTOMERS)

@app.route(f"{BASE_PATH}/api/prediction-kpis")
def api_prediction_kpis():
    return jsonify(PREDICTION_KPIS)

@app.route(f"{BASE_PATH}/api/forecast")
def api_forecast():
    return jsonify(generate_forecast())

@app.route(f"{BASE_PATH}/api/churn")
def api_churn():
    return jsonify(CHURN_RISK)

@app.route(f"{BASE_PATH}/api/restock")
def api_restock():
    return jsonify(RESTOCK)

@app.route(f"{BASE_PATH}/api/nlp/sentiment")
def api_nlp_sentiment():
    return jsonify(SENTIMENT)

@app.route(f"{BASE_PATH}/api/nlp/words")
def api_nlp_words():
    return jsonify(WORDS)

@app.route(f"{BASE_PATH}/api/nlp/complaints")
def api_nlp_complaints():
    return jsonify(COMPLAINTS)

@app.route(f"{BASE_PATH}/api/nlp/reviews")
def api_nlp_reviews():
    return jsonify(REVIEWS)

@app.route(f"{BASE_PATH}/api/monitoring/orders")
def api_monitoring_orders():
    return jsonify(get_live_orders())

@app.route(f"{BASE_PATH}/api/monitoring/stats")
def api_monitoring_stats():
    return jsonify(get_monitoring_stats())

# ══════════════════════════════════════════════════════════════
#  ENTRY POINT
# ══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print(f"\n  StreamIQ backend running  (Python {sys.version.split()[0]} · Flask)")
    print(f"  Stack:    Flask REST API · Olist Dataset · scikit-learn · NLTK/spaCy")
    print(f"  Pipeline: CSV → Kafka → PySpark → PostgreSQL → ML Models → REST API")
    print(f"  ➜  Landing:   http://localhost:{PORT}/")
    print(f"  ➜  Dashboard: http://localhost:{PORT}/dashboard")
    print(f"  ➜  API:       http://localhost:{PORT}/api/kpis")
    print(f"  ➜  Frontend:  {FRONTEND}\n")

    app.run(host="0.0.0.0", port=PORT, debug=False, threaded=True)
