# Architecture TreeTracking

## 1. Vue d'ensemble

### Schéma Architecture Globale
cat << 'EOF' > architecture/ARCHITECTURE.md
# Architecture TreeTracking

## 1. Vue d'ensemble

### Schéma Architecture Globale
## 2. Composants détaillés

### 2.1 Blockchain Layer (Hyperledger Fabric)

**Orderer**
- Type: Solo (dev) / Raft (production)
- Port: 7050
- Rôle: Ordonne les transactions

**Channel: treetrackingchannel**
- Membres: 4 organisations
- Chaincode: treetracking v2.0
- Ledger: CouchDB (implicite)

**Peers (4)**

| Peer | MSP | Port | Rôle |
|------|-----|------|------|
| peer0.admin | TreeTrackingAdminMSP | 7051 | Administration |
| peer0.forestryauthority | ForestryAuthorityMSP | 9051 | Certification origine |
| peer0.loggingcompany | LoggingCompaniesMSP | 11051 | Exploitation |
| peer0.buyingcompany | BuyingCompaniesMSP | 13051 | Achat/Vente |

**Chaincode**
- Langage: Go
- Fonctions: 18 (12 v1 + 6 v2)
- Endorsement: OR policy par fonction

### 2.2 API Server (Node.js)

**Stack technique**
- Express.js 4.x
- fabric-network SDK
- ipfs-http-client
- CORS enabled

**Architecture**
api-server/
├── server.js           # Point d'entrée
├── ipfsManager.js      # Gestion IPFS
├── wallet/             # Identités Fabric
├── connection-profile.json
└── package.json

**Endpoints (18 au total)**
- Forestry: 5 endpoints
- Logging: 4 endpoints
- Buying: 4 endpoints 
- Admin: 3 endpoints 
- IPFS: 2 endpoints

### 2.3 IPFS Layer

**Configuration**
- Version: 0.30.0 (Kubo)
- API: 127.0.0.1:5001
- Gateway: 127.0.0.1:8080
- Storage: ~/.ipfs

**Usage**
- Stockage photos grumes
- Stockage documents légaux
- Hash content-addressed
- Redondance distribuée

### 2.4 Frontend (React)

**Stack**
- React 18.x
- React Router
- Axios
- CSS custom

**Pages**
- Home: Sélection MSP
- Dashboard: Interface par MSP
  - ForestryAuthority: Init + License
  - LoggingCompany: Harvest + IPFS
  - BuyingCompany: Purchase + Transfer
  - Admin: Network Control

## 3. Flux de données

### 3.1 Cycle de vie d'une grume

INITIALIZED → PERMITTED → HARVESTED → TRANSPORTED → SOLD
↓            ↓            ↓            ↓          ↓
Forestry    Forestry     Logging      Logging     Buying
Authority   Authority    Company      Company     Company

### 3.2 Flux transaction type
User (Browser)
|
| POST /api/forestry/initializeLog
v
API Server
|
| executeTransaction()
v
Fabric SDK
|
| submitTransaction('InitializeLog', ...)
v
Peer endorsement
|
| Execute chaincode
v
Orderer
|
| Order + commit block
v
All Peers
|
| Update world state
v
Response → API → User
### 3.3 Flux IPFS
User upload file
|
v
API: POST /api/ipfs/upload
|
v
IPFS.add(buffer)
|
v
IPFS returns hash (QmXXX...)
|
v
Chaincode: UploadMultimedia(logID, hash)
|
v
Hash stored on blockchain
|
v
User can retrieve: GET /ipfs/{hash}
## 4. Modèle de données

### 4.1 TreeLog (principal)
```go
type TreeLog struct {
    LogID           string
    Species         string
    Origin          string
    Status          string
    CreatedBy       string
    CreatedAt       string
    OriginValidated bool
    Permit          *HarvestPermit
    PhysicalData    *PhysicalData
    MultimediaData  []MultimediaData
    TransportStatus string
    Purchase        *Purchase
    History         []HistoryEntry
}
4.2 License (v2.0)
type License struct {
    LicenseID       string
    CompanyMSP      string
    TotalCubage     float64
    RemainingCubage float64
    ExpiryDate      string
    IssuedAt        string
    IssuedBy        string
    LogIDs          []string
    IsRevoked       bool
}
4.3 NetworkState (v2.0)
type NetworkState struct {
    IsFrozen bool
    Reason   string
    FrozenAt string
    FrozenBy string
}
5. Sécurité
5.1 Endorsement Policies
Chaque fonction a sa policy :
InitializeLog: OR('ForestryAuthorityMSP.member')
DeclareHarvest: OR('LoggingCompaniesMSP.member')
ValidatePurchase: OR('BuyingCompaniesMSP.member')
EmergencyFreeze: OR('TreeTrackingAdminMSP.admin')
5.2 Identités
Certificats X.509 par organisation :

Admin@admin.treetracking.com
Admin@forestryauthority.treetracking.com
Admin@loggingcompany.treetracking.com
Admin@buyingcompany.treetracking.com

5.3 CORS
API autorise uniquement :

Origin: http://localhost:3001
Credentials: true

6. Performance
6.1 Métriques actuelles (dev)

Transaction time: ~500ms
Throughput: ~10 TPS
IPFS upload: ~2s (selon fichier)
Block time: ~2s

6.2 Optimisations possibles

Fabric

Passer à Raft consensus
Ajouter peers par org
Cache CouchDB


IPFS

IPFS Cluster
CDN gateway
Pinning service


API

Redis cache
Connection pooling
Load balancing



7. Scalabilité
7.1 Limites actuelles

1 orderer (SPOF)
1 peer/org
Solo consensus
No HA

7.2 Architecture production
Load Balancer
    ↓
API Servers (3+)
    ↓
Fabric Network (Raft, 3+ orderers, 2+ peers/org)
    ↓
IPFS Cluster (3+ nodes)
8. Monitoring
8.1 Endpoints santé

API: http://localhost:3000/health
IPFS: http://127.0.0.1:5001/api/v0/version

8.2 Logs

Fabric: docker logs peer0.admin.treetracking.com
API: Console stdout
IPFS: ~/.ipfs/logs

9. Backup & Recovery
9.1 Données à sauvegarder

Blockchain: Ledger complet
IPFS: Pinned files
Wallet: Identités

9.2 Procédure backup
# Blockchain
docker exec peer0.admin.treetracking.com peer node snapshot

# IPFS
ipfs repo gc
ipfs pin ls --type=recursive > pinned.txt

# Wallet
tar -czf wallet-backup.tar.gz api-server/wallet/
