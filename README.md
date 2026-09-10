# 🛡️ DesignProof — AI-Powered Brand & Design Protection SaaS

[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.0-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-CLIP%20ViT--B-EE4C2C?logo=pytorch&logoColor=white)](https://pytorch.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

An enterprise-grade SaaS platform engineered to help brands, designers, and e-commerce merchants detect counterfeit and copied designs, monitor infringements across the web, and automate legal takedown notices (DMCA) using state-of-the-art vision AI.

---

## 🎯 Key Highlights

- **Visual AI Similarity Matching**: Multi-stage pipeline combining perceptual hashing (pHash, dHash, aHash), structural similarity (SSIM), and deep visual semantic embeddings using **OpenAI CLIP (ViT-B/32)**.
- **Automated Web & Reverse Search**: Continuous automated reverse image discovery using Google Lens and SerpAPI crawlers.
- **DMCA & Takedown Engine**: Automated legal notice generator tailored for domain registrars, hosting providers, Shopify stores, and marketplaces.
- **Enterprise Client & Admin Portals**: Complete brand management, product catalogs, infringement review with side-by-side visual diffs, and compliance tracking.
- **Production-Ready Multi-Container Architecture**: Pre-configured Docker Compose with Nginx gateway, Node.js API, Python Flask AI engine, PostgreSQL 15, and Redis 7.

---

## 🏗️ Architecture & Project Structure

```text
DesignProof/
├── frontend/                   # React 18 + Tailwind CSS Web Application (Vite)
│   ├── src/
│   │   ├── components/        # Reusable UI components & modals
│   │   ├── pages/             # Client & Admin pages (Dashboard, Detections, etc.)
│   │   ├── services/          # Axios API gateway client
│   │   └── context/           # Authentication & Theme state
│   ├── Dockerfile             # Multi-stage production Nginx container
│   └── nginx.conf             # Reverse-proxy gateway configuration
│
├── backend/
│   ├── node_service/          # Node.js + Express REST API Gateway
│   │   ├── src/
│   │   │   ├── controllers/   # Auth, detections, notices, billing handlers
│   │   │   ├── models/        # Sequelize ORM models (Users, Brands, Detections)
│   │   │   ├── routes/        # API endpoints (/api/*)
│   │   │   └── services/      # Email, SerpAPI, crawler & cron services
│   │   └── Dockerfile         # Production Node 18 Alpine container
│   │
│   └── python_service/        # Python AI/ML Image Matching Service
│       ├── ai_matching.py     # Multi-stage CLIP & OpenCV matching engine
│       ├── app.py             # Flask microservice API
│       ├── requirements.txt   # PyTorch, OpenCV, sentence-transformers, Pillow
│       └── Dockerfile         # Production Python 3.10 Slim container
│
├── database/
│   ├── schema.sql             # Relational PostgreSQL 15 schema
│   └── migrations/            # Date-wise optimization & enforcement migrations
│
├── docker-compose.yml         # 5-service production container orchestrator
├── deploy.sh                  # 1-command automated deployment script for Linux VPS
└── setup-ssl.sh               # Automated Let's Encrypt SSL/HTTPS helper script
```

---

## ⚡ Quick Start

### Method 1: Using Docker Compose (Recommended)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/designproof.git
   cd designproof
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   ```

3. **Start the complete stack**:
   ```bash
   docker compose up -d --build
   ```

- **Frontend App**: [http://localhost](http://localhost)
- **Backend API**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Python AI Engine**: [http://localhost:5001/health](http://localhost:5001/health)

---

### Method 2: Local Native Development (Without Docker)

If you have PostgreSQL (port `5432`) and Redis (port `6379`) running locally:

```bash
# 1. Install root dependencies
npm install

# 2. Run all services concurrently (Node + Python + Vite)
npm run dev
```

---

## ⚙️ Environment Variables (`.env`)

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `FRONTEND_PORT` | Port for frontend web UI | `80` (Docker) or `3000`/`5173` |
| `BACKEND_PORT_FORWARD` | Node.js Express API port | `5000` |
| `PYTHON_PORT_FORWARD` | Python AI service port | `5001` |
| `DB_NAME` | PostgreSQL database name | `designproof_db` |
| `DB_USER` / `DB_PASSWORD` | PostgreSQL credentials | `postgres` / `root` |
| `JWT_SECRET` | Secret key for signing user auth tokens | *Secure random string* |
| `SERP_API_KEY` | SerpAPI key for Google Lens reverse search | *(Your API key)* |
| `SMTP_HOST` / `EMAIL_USER` | SMTP credentials for automated takedown emails | `smtp.ethereal.email` |

---

## 🔒 Security & Compliance

- **Authentication**: JWT-based stateless authentication with bcrypt password hashing.
- **Audit Trails**: Immutable `audit_logs` table tracking every scan, match approval, and legal notice dispatched.
- **Protection**: Helmet HTTP headers, CORS validation, parameter sanitized ORM queries, and rate limiting.

---

## 📄 License

This project is licensed under the MIT License.
