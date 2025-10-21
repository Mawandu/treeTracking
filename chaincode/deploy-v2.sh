#!/bin/bash
set -e

export FABRIC_CFG_PATH=$PWD/../config/
export CORE_PEER_TLS_ENABLED=true
CHANNEL_NAME=treetrackingchannel

echo "=== Installation Admin Peer ==="
export CORE_PEER_LOCALMSPID="TreeTrackingAdminMSP"
export CORE_PEER_ADDRESS=localhost:7051
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/../crypto-config/peerOrganizations/admin.treetracking.com/peers/peer0.admin.treetracking.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/../crypto-config/peerOrganizations/admin.treetracking.com/users/Admin@admin.treetracking.com/msp
peer lifecycle chaincode install treetracking_v2.tar.gz

echo "=== Installation ForestryAuthority Peer ==="
export CORE_PEER_LOCALMSPID="ForestryAuthorityMSP"
export CORE_PEER_ADDRESS=localhost:9051
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/../crypto-config/peerOrganizations/forestryauthority.treetracking.com/peers/peer0.forestryauthority.treetracking.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/../crypto-config/peerOrganizations/forestryauthority.treetracking.com/users/Admin@forestryauthority.treetracking.com/msp
peer lifecycle chaincode install treetracking_v2.tar.gz

echo "=== Installation LoggingCompany Peer ==="
export CORE_PEER_LOCALMSPID="LoggingCompaniesMSP"
export CORE_PEER_ADDRESS=localhost:11051
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/../crypto-config/peerOrganizations/loggingcompany.treetracking.com/peers/peer0.loggingcompany.treetracking.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/../crypto-config/peerOrganizations/loggingcompany.treetracking.com/users/Admin@loggingcompany.treetracking.com/msp
peer lifecycle chaincode install treetracking_v2.tar.gz

echo "=== Installation BuyingCompany Peer ==="
export CORE_PEER_LOCALMSPID="BuyingCompaniesMSP"
export CORE_PEER_ADDRESS=localhost:13051
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/../crypto-config/peerOrganizations/buyingcompany.treetracking.com/peers/peer0.buyingcompany.treetracking.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/../crypto-config/peerOrganizations/buyingcompany.treetracking.com/users/Admin@buyingcompany.treetracking.com/msp
peer lifecycle chaincode install treetracking_v2.tar.gz

echo ""
echo "=== Package ID ==="
peer lifecycle chaincode queryinstalled
