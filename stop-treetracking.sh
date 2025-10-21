#!/bin/bash

# TreeTracking v2.0 - Script d'arrêt global

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "======================================"
echo "TreeTracking v2.0 - Arrêt"
echo "======================================"

# 1. Arrêter Frontend
echo -e "\n${YELLOW}Arrêt Frontend...${NC}"
pkill -f "react-scripts start" || true

# 2. Arrêter API Server
echo -e "${YELLOW}Arrêt API Server...${NC}"
pkill -f "node server.js" || true

# 3. Arrêter Documentation
echo -e "${YELLOW}Arrêt Documentation...${NC}"
pkill -f "python3 -m http.server 8000" || true

# 4. Arrêter IPFS
echo -e "${YELLOW}Arrêt IPFS...${NC}"
pkill -f "ipfs daemon" || true

# 5. Arrêter Blockchain
echo -e "${YELLOW}Arrêt Blockchain...${NC}"
cd ~/treesystems
docker-compose down

echo -e "\n${GREEN}✅ Tous les services arrêtés${NC}\n"
