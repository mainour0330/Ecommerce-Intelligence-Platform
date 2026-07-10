from kafka import KafkaProducer
import pandas as pd
import json
import time

# ==========================
# Load Dataset
# ==========================

orders = pd.read_csv("data/fact_orders.csv")

print(f"Loaded {len(orders)} Orders")

# ==========================
# Kafka Producer
# ==========================

producer = KafkaProducer(
    bootstrap_servers="localhost:9092",
    value_serializer=lambda v: json.dumps(v).encode("utf-8")
)

print("Kafka Producer Started...\n")

# ==========================
# Infinite Streaming
# ==========================

index = 0

while True:

    row = orders.iloc[index]

    order = {
        "order_id": row["order_id"],
        "customer_id": row["customer_id"],
        "purchase_time": str(row["order_purchase_timestamp"]),
        "status": row["order_status"],
        "amount": float(row["payment_value"]),
        "review_score": int(row["review_score"]) if pd.notna(row["review_score"]) else None,
        "season": row["season"],
        "weekend": bool(row["is_weekend"])
    }

    producer.send("orders_stream", order)
    producer.flush()

    print(f"Sent Order {index + 1}: {order['order_id']}")

    index += 1

    # لما يخلص البيانات يبدأ من الأول
    if index >= len(orders):
        index = 0

    time.sleep(1)