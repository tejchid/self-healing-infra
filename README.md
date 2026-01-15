# Autonomous Observability Engine 🚀

**High-performance distributed telemetry pipeline for real-time infrastructure resilience.**

**[Live Demo](https://infra-heal.vercel.app/)**

### **Overview**

This project is an end-to-end observability pipeline designed to monitor system vitals, stream data via Kafka, and trigger autonomous self-healing protocols when resource saturation is detected.

### **The Stack**

* **Go**: High-concurrency collector for system metrics.
* **Apache Kafka**: Distributed message broker for sub-second data streaming.
* **Python (FastAPI)**: Diagnostic engine and automated recovery logic.
* **Next.js**: Real-time observability dashboard with "Chaos Mode" simulation.
* **Infrastructure**: Containerized with Docker and deployed via Vercel.

### **Core Features**

* **Real-Time Pipelines**: Optimized the Go-to-Kafka path to achieve sub-500ms latency from host to dashboard.
* **Autonomous Healing**: Engine detects CPU/RAM spikes and executes recovery scripts automatically via zsh sub-processes.
* **System Transparency**: A live dashboard that visualizes cluster health and logs every "healing" event in real-time.

### **Quick Start**

```bash
# Spin up Kafka and the Backend
docker-compose up -d

# Run the Dashboard
cd frontend && npm install && npm run dev

```
