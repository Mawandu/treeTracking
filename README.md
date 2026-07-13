# TreeTracking

Système de traçabilité et reconnaissance des bois basé sur la Blockchain Hyperledger Fabric et IPFS.

## Description

TreeTracking est une plateforme de traçabilité forestière permettant de suivre l'origine, l'exploitation, le transport et l'achat de grumes de bois de manière transparente et immuable.

## Architecture

- **Blockchain**: Hyperledger Fabric 1.4
- **Storage**: IPFS (InterPlanetary File System)
- **Backend**: Node.js 12 + Express.js
- **Frontend**: React 18
- **Database**: CouchDB

## Fonctionnalités
- Initialisation des grumes
- Validation d'origine
- Émission de permis
- Déclaration d'exploitation
- Données physiques
- Upload multimédia IPFS
- Suivi transport
- Validation d'achat
- Historique complet
- Vérification conformité
- Gestion des licences avec quotas
- Transfert de propriété
- Gel d'urgence du réseau
- État du réseau
- Dashboard statistiques
- Export PDF et QR Code

## Structure du Projet
```
treesystems/
├── api-server/          # API REST Node.js
├── treetracking-web/    # Frontend React
├── chaincode/           # Smart contracts Go
├── network/             # Configuration réseau Fabric
├── docs/                # Documentation
└── tests/               # Tests unitaires et E2E
```

## Installation

### Prérequis

- Docker 20.10+
- Docker Compose 1.29+
- Node.js 12.x
- Go 1.17+
- IPFS Kubo 0.30.0

### Démarrage Rapide
```bash
# Cloner le repository
git clone https://github.com/Mawandu/treeTracking.git
cd treeTracking

# Démarrer tous les services
./start-treetracking.sh

# Vérifier l'état
./status-treetracking.sh

# Arrêter les services
./stop-treetracking.sh
```

## Services

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3001 | Interface utilisateur |
| API Server | http://localhost:3000 | API REST |
| IPFS Gateway | http://localhost:8080 | Passerelle IPFS |
| Documentation | http://localhost:8000 | Docs techniques |

## Organisations (MSP)

1. **ForestryAuthorityMSP** - Autorité forestière
2. **LoggingCompaniesMSP** - Entreprises d'exploitation
3. **BuyingCompaniesMSP** - Entreprises acheteuses
4. **TreeTrackingAdminMSP** - Administrateur réseau

## Cycle de vie d'une grume
```
INITIALIZED → PERMITTED → HARVESTED → TRANSPORTED → SOLD
```

## Tests
```bash
# Tests chaincode
cd chaincode/treetracking
go test -v

# Tests API
cd api-server
npm test

# Tests E2E
./run-e2e-tests.sh
```

## Documentation

- [Architecture Technique](docs/architecture.md)
- [Guide API](docs/api-guide.md)
- [Spécifications Chaincode](docs/chaincode-specs.md)
- [Glossaire](docs/glossaire.md)

## Sécurité

- Blockchain privée et permissionnée
- Authentification MSP (X.509)
- Endorsement policies par fonction
- Gel d'urgence du réseau
- Audit trail complet

## Contribution

Auteur: **Mawandu Hamba Heritier**  
Encadrant: **Dr. HO Tuong Vinh**  
Année: 2025-2026  
Institution: VNU-IS Hanoï

## 📄 License

Projet académique - VNU International School

## 📞 Contact

- GitHub: [@Mawandu](https://github.com/Mawandu)
- Email: heritiermawandu@yahoo.fr

---

**TreeTracking** - Traçabilité Forestière sur Blockchain
