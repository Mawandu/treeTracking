# Hyperledger Chaincode for Tree Tracking

This directory contains a simple Hyperledger Fabric smart contract to store IPFS hashes for each log.

## Files

- `chaincode/traceability.js` – Sample chaincode implementing basic record and read functions.

## Usage

1. Install Node.js dependencies (Fabric chaincode packages).
2. Deploy the contract in your Fabric network.
3. Call `recordLog` with the log ID and corresponding IPFS hash returned by the upload script.
