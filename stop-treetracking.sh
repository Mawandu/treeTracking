#!/bin/bash

# TreeTracking v2.0 - Shutdown Script

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "======================================"
echo "TreeTracking v2.0 - Shutdown"
echo "======================================"

echo -e "\n${YELLOW}Stopping Frontend...${NC}"
pkill -f "react-scripts start" || true

echo -e "${YELLOW}Stopping API Server...${NC}"
pkill -f "node server.js" || true

echo -e "${YELLOW}Stopping Documentation...${NC}"
pkill -f "python3 -m http.server 8000" || true

echo -e "${YELLOW}Stopping IPFS...${NC}"
pkill -f "ipfs daemon" || true

echo -e "${YELLOW}Stopping Blockchain...${NC}"
cd ~/treesystems
docker-compose down

echo -e "\n${GREEN}[OK] All services stopped${NC}\n"
