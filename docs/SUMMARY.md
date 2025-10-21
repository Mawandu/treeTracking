# Documentation TreeTracking v2.0 - Résumé

## Vue d'ensemble

TreeTracking est une plateforme de traçabilité forestière utilisant :
- Blockchain Hyperledger Fabric 1.4
- Stockage décentralisé IPFS
- API REST Node.js 12
- Interface React 18

## Structure de la documentation

docs/
├── README.md                 # Point d'entrée
├── index.html               # Documentation web
├── SUMMARY.md               # Ce fichier
├── architecture/
│   └── ARCHITECTURE.md      # Architecture détaillée
├── api/
│   └── openapi.yaml         # Spécification API
└── deployment/
├── INSTALL.md           # Installation dev
└── PRODUCTION.md        # Déploiement prod

## Composants principaux

### Blockchain (Hyperledger Fabric)
- 1 Orderer (port 7050)
- 4 Peers (7051, 9051, 11051, 13051)
- 1 Channel: treetrackingchannel
- Chaincode v2.0 (Go)

### API Server (Node.js)
- 18 endpoints REST
- Fabric SDK integration
- IPFS client
- Port 3000

### IPFS
- Daemon port 5001
- Gateway port 8080
- Stockage distribué photos/docs

### Frontend (React)
- 4 dashboards (1 par MSP)
- Real-time network status
- IPFS file viewer
- Port 3001

## Fonctionnalités v2.0

### Nouvelles fonctions
1. **IssueLicense** - Gestion licences avec cubage
2. **GetLicense** - Consultation licence
3. **TransferOwnership** - Transfert propriété
4. **EmergencyFreeze** - Gel réseau
5. **UnfreezeNetwork** - Dégel réseau
6. **GetNetworkState** - État réseau

### Endpoints ajoutés
- POST /api/forestry/issueLicense
- GET /api/license/{id}
- POST /api/buying/transferOwnership
- POST /api/admin/emergencyFreeze
- POST /api/admin/unfreezeNetwork
- GET /api/admin/networkState

## Acteurs et rôles

| MSP | Rôle | Fonctions principales |
|-----|------|----------------------|
| ForestryAuthorityMSP | Autorité forestière | Initialize, Validate, Permit, License |
| LoggingCompaniesMSP | Exploitation | Harvest, PhysicalData, Upload, Transport |
| BuyingCompaniesMSP | Achat/Vente | Purchase, Transfer, Compliance |
| TreeTrackingAdminMSP | Administration | Audit, Freeze, Policies |

## Cycle de vie d'une grume

INITIALIZED → PERMITTED → HARVESTED → TRANSPORTED → SOLD

1. **ForestryAuthority** initialise et valide
2. **ForestryAuthority** émet permis
3. **LoggingCompany** déclare coupe
4. **LoggingCompany** ajoute données + photo IPFS
5. **LoggingCompany** met à jour transport
6. **BuyingCompany** valide achat
7. **BuyingCompany** peut transférer (v2.0)

## URLs importantes

- Frontend: http://localhost:3001
- API: http://localhost:3000
- API Health: http://localhost:3000/health
- IPFS Gateway: http://127.0.0.1:8080/ipfs/
- IPFS API: http://127.0.0.1:5001

## Commandes utiles

### Développement
```bash
# Démarrer IPFS
ipfs daemon &

# Démarrer Fabric
docker-compose up -d

# Démarrer API
cd api-server && nvm use 12 && npm start

# Démarrer Frontend
cd treetracking-web && npm start

Tests

# Health check
curl http://localhost:3000/health

# Test blockchain
curl http://localhost:3000/api/logs/LOG001

# Test IPFS
curl http://127.0.0.1:8080/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/readme

Monitoring

# Logs blockchain
docker logs peer0.admin.treetracking.com

# Logs API
pm2 logs (production)

# État IPFS
ipfs swarm peers

Performance

Throughput: ~10 TPS (dev)
Transaction time: ~500ms
Block time: ~2s
IPFS upload: ~2s (selon fichier)

Sécurité

Certificats X.509 par organisation
Endorsement policies par fonction
CORS configuré (localhost:3001)
Content-addressed storage (IPFS)

Prochaines étapes

Tests unitaires et intégration
Dashboard statistiques
QR Code génération
GPS tracking
Vision par ordinateur
Déploiement production

Support

Documentation: docs/
Guide utilisateur: GUIDE_PROCEDURES.md
API Spec: docs/api/openapi.yaml
Architecture: docs/architecture/ARCHITECTURE.md

Auteur
Mawandu Hamba Heritier

