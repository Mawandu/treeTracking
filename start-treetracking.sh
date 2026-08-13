#!/bin/bash

# TreeTracking v2.0 - Startup Script

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "======================================"
echo "TreeTracking v2.0 - Startup"
echo "======================================"

echo -e "\n${YELLOW}[1/5] Checking prerequisites...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}[ERROR] Docker not installed${NC}"
    exit 1
fi

if ! command -v ipfs &> /dev/null; then
    echo -e "${RED}[ERROR] IPFS not installed${NC}"
    exit 1
fi

if ! command -v nvm &> /dev/null; then
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

echo -e "${GREEN}[OK] Prerequisites OK${NC}"

echo -e "\n${YELLOW}[2/5] Starting Blockchain (Docker)...${NC}"
cd ~/treesystems
if docker ps | grep -q "peer0.admin"; then
    echo "Blockchain already active"
else
    docker-compose up -d
    echo "Waiting for Fabric initialization (15s)..."
    sleep 15
fi
echo -e "${GREEN}[OK] Blockchain active${NC}"

echo -e "\n${YELLOW}[3/5] Starting IPFS...${NC}"
if pgrep -x ipfs > /dev/null; then
    echo "IPFS already active"
else
    ipfs daemon > ~/treesystems/logs/ipfs.log 2>&1 &
    sleep 5
fi
echo -e "${GREEN}[OK] IPFS active (port 8080)${NC}"

echo -e "\n${YELLOW}[4/5] Starting API Server (Node 12)...${NC}"
cd ~/treesystems/api-server

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 12

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "API Server already active"
else
    npm start > ~/treesystems/logs/api-server.log 2>&1 &
    sleep 5
fi
echo -e "${GREEN}[OK] API Server active (port 3000)${NC}"

echo -e "\n${YELLOW}[5/5] Starting Frontend React...${NC}"
cd ~/treesystems/treetracking-web

if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo "Frontend already active"
else
    npm start > ~/treesystems/logs/react.log 2>&1 &
    sleep 10
fi
echo -e "${GREEN}[OK] Frontend active (port 3001)${NC}"

echo -e "\n${YELLOW}[Bonus] Starting Documentation...${NC}"
cd ~/treesystems/docs

if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "Documentation already active"
else
    python3 -m http.server 8000 > ~/treesystems/logs/docs.log 2>&1 &
    sleep 2
fi
echo -e "${GREEN}[OK] Documentation active (port 8000)${NC}"

echo -e "\n======================================"
echo -e "${GREEN}[OK] TreeTracking v2.0 started successfully!${NC}"
echo "======================================"
echo ""
echo "Active services:"
echo "  - Blockchain:    docker ps"
echo "  - IPFS:          http://127.0.0.1:8080/ipfs/"
echo "  - API Server:    http://localhost:3000"
echo "  - Frontend:      http://localhost:3001"
echo "  - Documentation: http://localhost:8000/viewer.html"
echo ""
echo "Logs available in ~/treesystems/logs/"
echo ""
echo "To stop: ./stop-treetracking.sh"
echo ""
