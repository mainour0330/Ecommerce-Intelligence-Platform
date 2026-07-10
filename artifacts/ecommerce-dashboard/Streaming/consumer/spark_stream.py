from pyspark.sql import SparkSession
from pyspark.sql.functions import col, from_json
from pyspark.sql.types import *
import json

# ==========================================
# Spark Session
# ==========================================

spark = (
    SparkSession.builder
    .appName("Olist Kafka Streaming")
    .master("local[*]")
    .config(
        "spark.jars.packages",
        "org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.2"
    )
    .getOrCreate()
)

spark.sparkContext.setLogLevel("ERROR")

print("=" * 60)
print("Spark Started Successfully!")
print("=" * 60)
print("Spark Version:", spark.version)

# ==========================================
# Read From Kafka
# ==========================================

df = (
    spark.readStream
    .format("kafka")
    .option("kafka.bootstrap.servers", "localhost:9092")
    .option("subscribe", "orders_stream")
    .option("startingOffsets", "latest")
    .load()
)

print("=" * 60)
print("Kafka Connected Successfully!")
print("=" * 60)

# ==========================================
# JSON Schema
# ==========================================

schema = StructType([
    StructField("order_id", StringType(), True),
    StructField("customer_id", StringType(), True),
    StructField("purchase_time", StringType(), True),
    StructField("status", StringType(), True),
    StructField("amount", DoubleType(), True),
    StructField("review_score", IntegerType(), True),
    StructField("season", StringType(), True),
    StructField("weekend", BooleanType(), True)
])

# ==========================================
# Parse JSON
# ==========================================

json_df = (
    df.selectExpr("CAST(value AS STRING)")
      .select(
          from_json(
              col("value"),
              schema
          ).alias("data")
      )
      .select("data.*")
)

print("=" * 60)
print("Parsed JSON Successfully!")
print("=" * 60)

json_df.printSchema()
def save_batch(batch_df, batch_id):

    data = batch_df.toPandas()

    if not data.empty:
        data.to_json(
            "live_orders.json",
            orient="records",
            indent=4
        )

        print(f"Batch {batch_id} Saved Successfully")
# ==========================================
# Stream To Console
# ==========================================

import os
def save_batch(batch_df, batch_id):

    data = batch_df.toPandas()

    data.to_json(
        "live_orders.json",
        orient="records",
        indent=4
    )

    print(f"Saved Batch {batch_id}")

query = (
    json_df
    .writeStream
    .foreachBatch(save_batch)
    .outputMode("append")
    .start()
)
print("=" * 60)
print("Waiting For Kafka Messages...")
print("=" * 60)

query.awaitTermination()