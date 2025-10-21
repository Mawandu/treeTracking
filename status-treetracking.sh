#!/bin/bash

# TreeTracking v2.0 - Vérification de l'état

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "TreeTracking v2.0 - État des services"
echo "======================================"

# Blockchain
if docker ps | grep -q "peer0.admin"; then
    echo -e "Blockchain:    ${GREEN}✅ ACTIF${NC}"
else
    echo -e "Blockchain:    ${RED}❌ INACTIF${NC}"
fi

# IPFS
if pgrep -x ipfs > /dev/null; then
    echo -e "IPFS:          ${GREEN}✅ ACTIF${NC}"
else
    echo -e "IPFS:          ${RED}❌ INACTIF${NC}"
fi

# API Server
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "API Server:    ${GREEN}✅ ACTIF (port 3000)${NC}"
else
    echo -e "API Server:    ${RED}❌ INACTIF${NC}"
fi

# Frontend
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "Frontend:      ${GREEN}✅ ACTIF (port 3001)${NC}"
else
    echo -e "Frontend:      ${RED}❌ INACTIF${NC}"
fi

# Documentation
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "Documentation: ${GREEN}✅ ACTIF (port 8000)${NC}"
else
    echo -e "Documentation: ${RED}❌ INACTIF${NC}"
fi

echo ""
