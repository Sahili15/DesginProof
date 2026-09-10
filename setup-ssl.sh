#!/usr/bin/env bash
# ==============================================================================
# DesignProof Custom Domain & Free SSL (Let's Encrypt / Certbot) Setup
# ==============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

if [ -z "$1" ]; then
    echo -e "${YELLOW}Usage: sudo ./setup-ssl.sh yourdomain.com [your-email@example.com]${NC}"
    exit 1
fi

DOMAIN=$1
EMAIL=${2:-"admin@$DOMAIN"}

echo -e "${CYAN}======================================================${NC}"
echo -e "${CYAN}   🔒 Configuring SSL for: $DOMAIN                    ${NC}"
echo -e "${CYAN}======================================================${NC}"

# Install certbot and host nginx if needed
apt-get update -y
apt-get install -y certbot python3-certbot-nginx nginx

# Stop any temporary port binding if running on 80
systemctl stop nginx || true

# Request Certificate
echo -e "\n${YELLOW}[*] Requesting SSL Certificate from Let's Encrypt...${NC}"
certbot certonly --standalone -d "$DOMAIN" --non-interactive --agree-tos --email "$EMAIL"

echo -e "\n${YELLOW}[*] Configuring Nginx Reverse Proxy with SSL...${NC}"

cat <<EOF > /etc/nginx/sites-available/designproof
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:80; # Points to Docker frontend container
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/designproof /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default || true

# Test and reload
nginx -t
systemctl restart nginx

# Setup automatic renewal
systemctl enable certbot.timer || true

echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}   ✨ SSL Configured Successfully!                    ${NC}"
echo -e "${GREEN}======================================================${NC}"
echo -e "Your app is now live securely at: ${CYAN}https://${DOMAIN}${NC}"
echo -e "======================================================\n"
