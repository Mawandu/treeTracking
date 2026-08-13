#!/bin/bash

# TreeTracking v2.0 - Service Status Check

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "TreeTracking v2.0 - Service Status"
echo "======================================"

if docker ps | grep -q "peer0.admin"; then
    echo -e "Blockchain:    ${GREEN}[ACTIVE]${NC}"
else
    echo -e "Blockchain:    ${RED}[INACTIVE]${NC}"
fi

if pgrep -x ipfs > /dev/null; then
    echo -e "IPFS:          ${GREEN}[ACTIVE]${NC}"
else
    echo -e "IPFS:          ${RED}[INACTIVE]${NC}"
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "API Server:    ${GREEN}[ACTIVE] (port 3000)${NC}"
else
    echo -e "API Server:    ${RED}[INACTIVE]${NC}"
fi

if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "Frontend:      ${GREEN}[ACTIVE] (port 3001)${NC}"
else
    echo -e "Frontend:      ${RED}[INACTIVE]${NC}"
fi

if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "Documentation: ${GREEN}[ACTIVE] (port 8000)${NC}"
else
    echo -e "Documentation: ${RED}[INACTIVE]${NC}"
fi

echo ""
