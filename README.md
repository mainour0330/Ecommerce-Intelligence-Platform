# StreamIQ – E-Commerce Intelligence Platform

StreamIQ is an end-to-end E-Commerce Intelligence Platform designed to transform raw e-commerce data into actionable business insights through Data Engineering, Machine Learning, NLP, and interactive dashboards.

The platform is built using the Olist Brazilian E-Commerce Dataset and demonstrates a complete data pipeline from data ingestion to business intelligence and predictive analytics.

---

# Features

- Interactive business dashboard
- Sales analytics and KPI monitoring
- Customer segmentation
- Product performance analysis
- Demand forecasting using Machine Learning
- Customer churn prediction
- NLP sentiment analysis for customer reviews
- Real-time order monitoring
- Role-based dashboard interface
- Dark / Light theme

---

# Project Architecture

```
Olist Dataset
      │
      ▼
 Azure Blob Storage
      │
      ▼
 Apache Spark (ETL)
      │
      ▼
 Flask REST API
      │
      ▼
Frontend Dashboard
```

---

# Technology Stack

## Frontend

- HTML5
- CSS3
- JavaScript (ES6)
- Chart.js
- CSS Grid & Flexbox

## Backend

- Python 3.11
- Flask REST API

## Data Engineering

- Azure Blob Storage
- Apache Spark
- PySpark

## Machine Learning

- Scikit-learn
- Random Forest
- Demand Forecasting

## NLP

- NLTK
- Sentiment Analysis

---

# Dashboard Modules

## Executive Dashboard

- Total Sales
- Orders
- Customers
- Average Order Value
- Revenue Trends

## Customer Analytics

- Customer Segmentation
- Customer Lifetime Value
- VIP Customers
- At-Risk Customers

## Product Analytics

- Best Selling Products
- Category Performance
- Inventory Monitoring

## Machine Learning

- Sales Forecast
- Churn Prediction
- Product Restock Recommendation

## NLP Analytics

- Sentiment Distribution
- Word Frequency
- Complaint Analysis
- Review Explorer

## Live Monitoring

- Live Orders
- Active Sessions
- Orders per Minute
- Pipeline Status

---

# Dataset

This project uses the **Olist Brazilian E-Commerce Public Dataset**, which contains:

- Customers
- Orders
- Products
- Sellers
- Reviews
- Payments
- Geolocation
- Order Items

---

# Project Structure

```
StreamIQ/
│
├── frontend/
├── backend/
├── data_pipeline/
├── notebooks/
├── models/
├── docs/
└── README.md
```

---

# Future Improvements

- Azure Synapse Analytics Integration
- Apache Kafka Real-Time Streaming
- Power BI Reporting
- Recommendation System
- Authentication & User Management
- Docker Deployment
- CI/CD Pipeline

---

# Authors

Graduation Project

Faculty of Computers and Artificial Intelligence

Data Engineering & Artificial Intelligence

---

> **Note**
>
> The current version demonstrates the complete architecture using simulated and Olist-inspired data. The project is designed to support Azure Blob Storage, Apache Spark, PostgreSQL, and Machine Learning integration for production deployment.
