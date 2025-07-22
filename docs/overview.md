# Tree Tracking System

This project demonstrates a simple wood log traceability setup using IPFS for decentralized storage and Hyperledger Fabric for immutable records.

## Components

- **IPFS Upload Script** (`scripts/ipfs_upload.py`)
  - Reads `treeTracking.csv` and uploads each record as JSON to IPFS.
  - Stores the mapping of log number to IPFS hash in `ipfs_mapping.json`.
- **Hyperledger Chaincode** (`hyperledger/chaincode/traceability.js`)
  - Allows recording and querying IPFS hashes on a Fabric ledger.

These components form the basis for tracking logs from the CSV dataset on a blockchain while keeping the full data on IPFS.
