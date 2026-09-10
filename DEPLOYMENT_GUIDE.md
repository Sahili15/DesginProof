# 🚀 DesignProof — Production Deployment Guide

This guide provides step-by-step instructions for deploying the full **DesignProof** application suite onto any **Linux VPS / Cloud Server** (e.g., AWS EC2, DigitalOcean Droplet, Hetzner, Linode, or any Ubuntu/Debian server) using Docker Compose.

---

## 🏗️ Architecture Overview

The DesignProof production stack runs 5 containerized microservices:

| Service | Technology | Internal Port | Description |
| :--- | :--- | :--- | :--- |
| **Frontend** | React (Vite) + Nginx | `80` (HTTP) | Single Page App UI & reverse proxy gateway |
| **Backend Gateway** | Node.js (Express) | `5000` | REST API, Auth, Stripe/Billing, Enforcement cron |
| **AI / ML Service** | Python (Flask + OpenCV + PyTorch) | `5001` | Perceptual hashing, SSIM, OCR & image matching |
| **Database** | PostgreSQL 15 | `5432` | Relational storage with automated schema & migrations |
| **Cache / Queue** | Redis 7 | `6379` | Rate limiting, caching, and background job queues |

---

## ⚡ Quick Start: 1-Command Deployment on Ubuntu VPS

### Step 1: Provision a Server
- **Recommended OS**: Ubuntu 22.04 LTS or 24.04 LTS
- **Recommended Specs**: 2 vCPU, 4GB RAM (or minimum 2GB RAM with 2GB Swap)
- **Providers**: AWS EC2 (`t3.medium`), DigitalOcean Droplet ($24/mo plan), Hetzner (`CX22`/`CX32`), Linode / Akamai.

### Step 2: Connect via SSH
```bash
ssh root@YOUR_SERVER_IP
```

### Step 3: Clone the Repository
```bash
git clone <YOUR_GIT_REPOSITORY_URL> /var/www/designproof
cd /var/www/designproof
```

### Step 4: Run the Automated Deployment Script
```bash
chmod +x deploy.sh
sudo ./deploy.sh
```

> **What `./deploy.sh` does automatically:**
> 1. Detects and installs Docker & Docker Compose if missing.
> 2. Creates `.env` from `.env.example` with cryptographically secure random secrets.
> 3. Configures system firewall (UFW) to allow ports 22, 80, and 443.
> 4. Builds all production containers in parallel and brings up the stack.
> 5. Runs automated database schema creation and optimization migrations.

---

## ⚙️ Configuration & Environment Variables (`.env`)

Before or after running the script, customize your `.env` file for third-party keys:

```bash
nano .env
```

### Key Variables to Configure:

| Variable | Default / Example | Purpose |
| :--- | :--- | :--- |
| `FRONTEND_URL` | `http://your-server-ip` or `https://yourdomain.com` | Used for OAuth redirects and email links |
| `DB_PASSWORD` | auto-generated | Postgres database password |
| `JWT_SECRET` | auto-generated | Signing user authentication tokens |
| `SESSION_SECRET` | auto-generated | Session encryption key |
| `SERP_API_KEY` | *(your SerpAPI key)* | Enables automated Google Lens & Web reverse search |
| `EMAIL_USER` / `EMAIL_PASS` | SMTP credentials | For sending automated Takedown & Infringement notices |
| `GOOGLE_CLIENT_ID` / `SECRET` | *(optional)* | For Google 1-click Sign-in |
| `GITHUB_CLIENT_ID` / `SECRET` | *(optional)* | For GitHub OAuth Sign-in |

After modifying `.env`, restart the stack:
```bash
docker compose up -d
```

---

## 🔒 Custom Domain & Free SSL Setup (HTTPS)

To secure your deployment with a custom domain (e.g. `https://designproof.yourdomain.com`):

### 1. Point DNS A-Record
In your domain registrar (GoDaddy, Namecheap, Cloudflare, Route 53):
- **Type**: `A`
- **Name / Host**: `@` (or `app` / `subdomain`)
- **Value / Target**: `YOUR_VPS_PUBLIC_IP`

### 2. Run the SSL Helper Script
```bash
chmod +x setup-ssl.sh
sudo ./setup-ssl.sh yourdomain.com your-email@example.com
```

This script will automatically:
- Issue a valid SSL certificate from **Let's Encrypt** (Certbot).
- Configure host Nginx reverse proxy with HTTP/2 and auto-renewal.
- Redirect all HTTP traffic to HTTPS automatically.

---

## 🛠️ Management & Monitoring Commands

### View Live Logs
```bash
# All services
docker compose logs -f

# Specific service (e.g. backend or python service)
docker compose logs -f backend
docker compose logs -f python-service
```

### Restart or Stop the Application
```bash
# Restart all containers
docker compose restart

# Stop all containers
docker compose down

# Rebuild and start in background
docker compose up -d --build
```

### Database Backup & Restore
```bash
# Backup database to a .sql file
docker exec -t designproof_db pg_dumpall -c -U postgres > backup_$(date +%F).sql

# Restore database from a backup
cat backup_2026-08-09.sql | docker exec -i designproof_db psql -U postgres -d designproof_db
```

### Updating to New Code
```bash
git pull origin main
./deploy.sh
```

---

## 🧪 Testing the Deployment Locally (Windows / macOS / Linux)

To run the full production Docker stack locally on your machine:
```bash
# Copy template
cp .env.example .env

# Start with Docker Compose
docker compose up -d --build
```
Once started, visit:
- **Frontend App**: [http://localhost](http://localhost)
- **Backend API Health**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Python Matching Engine**: [http://localhost:5001/health](http://localhost:5001/health)
