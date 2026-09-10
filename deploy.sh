#!/usr/bin/env bash
# ==============================================================================
# DesignProof Automated VPS Deployment Script
# Supports: Ubuntu 20.04+, Debian 11+, AWS EC2, DigitalOcean, Hetzner, Linode
# ==============================================================================

set -e

# Color codes for pretty terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}======================================================${NC}"
echo -e "${CYAN}   🚀 DesignProof - Automated Deployment Script       ${NC}"
echo -e "${CYAN}======================================================${NC}"

# Step 1: Check root / sudo privileges
if [ "$EUID" -ne 0 ]; then
    echo -e "${YELLOW}[!] Warning: It is recommended to run this script as root or with sudo.${NC}"
fi

# Step 2: Detect & Install Docker & Docker Compose if missing
echo -e "\n${BLUE}[1/6] Checking system requirements (Docker & Compose)...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}[*] Docker not found. Installing official Docker Engine...${NC}"
    apt-get update -y
    apt-get install -y ca-certificates curl gnupg lsb-release
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    systemctl enable --now docker
    echo -e "${GREEN}[✓] Docker installed successfully!${NC}"
else
    echo -e "${GREEN}[✓] Docker is already installed: $(docker --version)${NC}"
fi

# Check Docker Compose (v2 plugin or standalone)
DOCKER_COMPOSE_CMD="docker compose"
if ! docker compose version &> /dev/null; then
    if command -v docker-compose &> /dev/null; then
        DOCKER_COMPOSE_CMD="docker-compose"
    else
        echo -e "${YELLOW}[*] Installing Docker Compose plugin...${NC}"
        apt-get update -y && apt-get install -y docker-compose-plugin
    fi
fi
echo -e "${GREEN}[✓] Using compose tool: ${DOCKER_COMPOSE_CMD}${NC}"

# Step 3: Setup Environment Configuration (.env)
echo -e "\n${BLUE}[2/6] Verifying environment configuration (.env)...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}[*] .env file not found. Generating from .env.example with secure random secrets...${NC}"
    cp .env.example .env
    
    # Generate secure random keys for production
    RANDOM_JWT=$(openssl rand -hex 24 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
    RANDOM_SESSION=$(openssl rand -hex 24 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
    RANDOM_DB_PASS=$(openssl rand -hex 16 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 20 | head -n 1)

    sed -i "s/super_secret_production_jwt_key_change_me_before_deploy/${RANDOM_JWT}/g" .env
    sed -i "s/super_secret_session_key_change_me_before_deploy/${RANDOM_SESSION}/g" .env
    sed -i "s/designproof_secure_db_pass_2026/${RANDOM_DB_PASS}/g" .env
    
    echo -e "${GREEN}[✓] Created .env with generated secure JWT & DB secrets.${NC}"
else
    echo -e "${GREEN}[✓] Existing .env file found.${NC}"
fi

# Step 4: Configure Firewall (UFW) if active
echo -e "\n${BLUE}[3/6] Configuring firewall rules (HTTP/HTTPS/SSH)...${NC}"
if command -v ufw &> /dev/null; then
    if ufw status | grep -q "Status: active"; then
        echo -e "${YELLOW}[*] UFW firewall is active. Allowing ports 22, 80, 443...${NC}"
        ufw allow 22/tcp || true
        ufw allow 80/tcp || true
        ufw allow 443/tcp || true
        ufw reload || true
        echo -e "${GREEN}[✓] Firewall configured.${NC}"
    else
        echo -e "${GREEN}[✓] UFW firewall is inactive.${NC}"
    fi
fi

# Step 5: Build and start Docker containers
echo -e "\n${BLUE}[4/6] Building and starting DesignProof microservices...${NC}"
$DOCKER_COMPOSE_CMD down --remove-orphans || true
$DOCKER_COMPOSE_CMD build --parallel
$DOCKER_COMPOSE_CMD up -d

# Step 6: Health verification
echo -e "\n${BLUE}[5/6] Waiting for services to initialize...${NC}"
sleep 8

echo -e "\n${BLUE}[6/6] Checking container statuses...${NC}"
$DOCKER_COMPOSE_CMD ps

# Get public IP if accessible
SERVER_IP=$(curl -s -m 3 ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')

echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}   🎉 DesignProof Deployment Succeeded!                ${NC}"
echo -e "${GREEN}======================================================${NC}"
echo -e "Web Application : ${CYAN}http://${SERVER_IP}${NC}"
echo -e "Backend API     : ${CYAN}http://${SERVER_IP}/api${NC}"
echo -e "Node Service    : ${CYAN}http://localhost:5000${NC}"
echo -e "Python Service  : ${CYAN}http://localhost:5001${NC}"
echo -e "PostgreSQL      : ${CYAN}localhost:5432${NC}"
echo -e "Redis           : ${CYAN}localhost:6379${NC}"
echo -e "\n${YELLOW}Helpful Management Commands:${NC}"
echo -e "  - View live logs      : ${CYAN}${DOCKER_COMPOSE_CMD} logs -f${NC}"
echo -e "  - Restart all services: ${CYAN}${DOCKER_COMPOSE_CMD} restart${NC}"
echo -e "  - Stop all services   : ${CYAN}${DOCKER_COMPOSE_CMD} down${NC}"
echo -e "  - Update to latest code: ${CYAN}git pull && ./deploy.sh${NC}"
echo -e "======================================================\n"
