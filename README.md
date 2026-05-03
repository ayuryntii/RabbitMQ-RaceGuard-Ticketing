<div align="center">
  <h1 align="center">NexCore-TicketBroker 🎟️⚡</h1>
  <p align="center">
    <strong>Professional Ticket Booking Simulation & Race Condition Solver</strong>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/Frontend-React.js-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React.js" />
    <img src="https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Message_Broker-RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white" alt="RabbitMQ" />
    <img src="https://img.shields.io/badge/Styling-Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  </p>
</div>

<br />

## 📖 Overview
**NexCore-TicketBroker** is an advanced, full-stack ticket booking simulation system engineered to demonstrate the critical backend issue of **Race Conditions** during high-traffic transactions. This project provides a robust solution using **RabbitMQ** as a Mutual Exclusion (Semaphore) mechanism to guarantee data integrity, completely resolving "Overbooked" anomalies.

Designed with a premium **Cyber IT Dashboard**, the system allows real-time monitoring of both the "Unsafe" (Race Condition) and "Safe" (RabbitMQ Synchronized) booking processes.

---

## ✨ Key Features
- 🛡️ **Race Condition Demonstration**: Simulates high-concurrency ticket purchasing to demonstrate data inconsistency.
- 🐇 **RabbitMQ Message Queueing**: Implements `prefetch_count=1` as a Binary Semaphore for strict mutual exclusion.
- 📊 **Real-time Cyber Dashboard**: A React-based HUD interface for monitoring live transactions, queue status, and system telemetry.
- ⚡ **Asynchronous Processing**: Non-blocking Node.js backend to handle thousands of simultaneous requests.
- 🎨 **Premium UI/UX**: Styled with Tailwind CSS, featuring a sleek dark mode and high-tech aesthetics.

---

## 🔬 The Problem & The Solution

### ⚠️ The Problem: Race Condition
In a high-traffic environment (like a concert ticket sale), thousands of users attempt to buy tickets simultaneously. Without proper synchronization, multiple processes read the same ticket stock and update it concurrently. 
This results in **Race Conditions**, where tickets are oversold (e.g., stock reaches negative values).

### 🛠️ The Solution: Mutual Exclusion via RabbitMQ
We utilize RabbitMQ to queue all incoming requests. By configuring the worker with `prefetch_count=1`, the queue acts as a **Binary Semaphore**. 
- The system ensures only **one worker** processes a single order at any given time.
- The next request is only processed after an Acknowledgment (`Ack`) is received.
- **Result**: 100% Data Integrity. Zero oversold tickets.

---

## 📈 Performance Analysis

| Parameter | ❌ Unsafe (Race Condition) | ✅ Safe (RabbitMQ) |
| :--- | :--- | :--- |
| **Total Requests** | 500 concurrent | 500 concurrent |
| **Initial Stock** | 100 tickets | 100 tickets |
| **Final Stock Result**| `< 0` (Data Corrupted, e.g., -15) | **Exactly `0`** |
| **System Status** | GAGAL (Overbooked) | **BERHASIL** |
| **Execution Speed** | Extremely fast (No coordination) | Slightly slower (Network & Queueing overhead), but **100% Reliable** |

*Conclusion: In transactional systems, data integrity is vastly more critical than saving a few milliseconds of execution time.*

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16+)
- RabbitMQ server (Local or CloudAMQP)

### 1. Backend Setup
```bash
cd backend
npm install
# Set your RabbitMQ URL in server.js or .env
node server.js
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 💻 Tech Stack
- **Frontend**: React.js, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Message Broker**: RabbitMQ (amqplib)
- **Architecture**: Micro-services concept / Event-driven

---

<div align="center">
  <p><i>"Ensuring data integrity through sophisticated distributed architecture."</i></p>
  <p><b>Developed by [Nama Anda]</b> • Tugas #7 Sistem Terdistribusi / Pemrograman Lanjut</p>
</div>
