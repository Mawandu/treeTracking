#!/bin/bash

# TreeTracking v2.0 - Script de démarrage global
# Usage: ./start-treetracking.sh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "======================================"
echo "TreeTracking v2.0 - Démarrage"
echo "======================================"

# Vérifier les prérequis
echo -e "\n${YELLOW}[1/5] Vérification des prérequis...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker non installé${NC}"
    exit 1
fi

if ! command -v ipfs &> /dev/null; then
    echo -e "${RED}❌ IPFS non installé${NC}"
    exit 1
fi

if ! command -v nvm &> /dev/null; then
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

echo -e "${GREEN}✅ Prérequis OK${NC}"

# 1. Démarrer Blockchain
echo -e "\n${YELLOW}[2/5] Démarrage Blockchain (Docker)...${NC}"
cd ~/treesystems
if docker ps | grep -q "peer0.admin"; then
    echo "Blockchain déjà active"
else
    docker-compose up -d
    echo "Attente initialisation Fabric (15s)..."
    sleep 15
fi
echo -e "${GREEN}✅ Blockchain active${NC}"

# 2. Démarrer IPFS
echo -e "\n${YELLOW}[3/5] Démarrage IPFS...${NC}"
if pgrep -x ipfs > /dev/null; then
    echo "IPFS déjà actif"
else
    ipfs daemon > ~/treesystems/logs/ipfs.log 2>&1 &
    sleep 5
fi
echo -e "${GREEN}✅ IPFS actif (port 8080)${NC}"

# 3. Démarrer API Server
echo -e "\n${YELLOW}[4/5] Démarrage API Server (Node 12)...${NC}"
cd ~/treesystems/api-server

# Charger NVM et utiliser Node 12
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 12

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "API Server déjà actif"
else
    npm start > ~/treesystems/logs/api-server.log 2>&1 &
    sleep 5
fi
echo -e "${GREEN}✅ API Server actif (port 3000)${NC}"

# 4. Démarrer Frontend React
echo -e "\n${YELLOW}[5/5] Démarrage Frontend React...${NC}"
cd ~/treesystems/treetracking-web

if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo "Frontend déjà actif"
else
    npm start > ~/treesystems/logs/react.log 2>&1 &
    sleep 10
fi
echo -e "${GREEN}✅ Frontend actif (port 3001)${NC}"

# 5. Démarrer Documentation
echo -e "\n${YELLOW}[Bonus] Démarrage Documentation...${NC}"
cd ~/treesystems/docs

if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "Documentation déjà active"
else
    python3 -m http.server 8000 > ~/treesystems/logs/docs.log 2>&1 &
    sleep 2
fi
echo -e "${GREEN}✅ Documentation active (port 8000)${NC}"

# Résumé
echo -e "\n======================================"
echo -e "${GREEN}✅ TreeTracking v2.0 démarré avec succès!${NC}"
echo "======================================"
echo ""
echo "📊 Services actifs:"
echo "  - Blockchain:    docker ps"
echo "  - IPFS:          http://127.0.0.1:8080/ipfs/"
echo "  - API Server:    http://localhost:3000"
echo "  - Frontend:      http://localhost:3001"
echo "  - Documentation: http://localhost:8000/viewer.html"
echo ""
echo "📝 Logs disponibles dans ~/treesystems/logs/"
echo ""
echo "🛑 Pour arrêter: ./stop-treetracking.sh"
echo ""
