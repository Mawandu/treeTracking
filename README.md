# TreeTracking v2.0

Systeme de tracabilite et reconnaissance des bois base sur la Blockchain Hyperledger Fabric et IPFS.

## Description

TreeTracking est une plateforme de tracabilite forestiere permettant de suivre l'origine, l'exploitation, le transport et l'achat de grumes de bois de maniere transparente et immuable.

## Architecture

- **Blockchain**: Hyperledger Fabric 1.4
- **Storage**: IPFS (InterPlanetary File System)
- **Backend**: Node.js 12 + Express.js
- **Frontend**: React 18
- **Database**: CouchDB

## Fonctionnalites v2.0

### Version 1.0 (12 fonctions)
- Initialisation des grumes
- Validation d'origine
- Emission de permis
- Declaration d'exploitation
- Donnees physiques
- Upload multimedia IPFS
- Suivi transport
- Validation d'achat
- Historique complet
- Verification conformite

### Version 2.0 (6 nouvelles fonctions)
- Gestion des licences avec quotas
- Transfert de propriete
- Gel d'urgence du reseau
- Etat du reseau
- Dashboard statistiques
- Export PDF et QR Code

## Structure du Projet
```
treesystems/
├── api-server/          # API REST Node.js
├── caliper-workspace/   # Benchmarking Hyperledger Caliper
├── chaincode/           # Smart contracts Go
├── treetracking-web/    # Frontend React
├── docs/                # Documentation
├── scripts/             # Helper scripts
└── config/              # Network configuration
```

## Installation

### Prerequis

- Docker 20.10+
- Docker Compose 1.29+
- Node.js 12.x
- Go 1.17+
- IPFS Kubo 0.30.0

### Demarrage Rapide
```bash
# Cloner le repository
git clone https://github.com/Mawandu/treeTracking.git
cd treeTracking

# Demarrer tous les services
./start-treetracking.sh

# Verifier l'etat
./status-treetracking.sh

# Arreter les services
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

1. **ForestryAuthorityMSP** - Autorite forestiere
2. **LoggingCompaniesMSP** - Entreprises d'exploitation
3. **BuyingCompaniesMSP** - Entreprises acheteuses
4. **TreeTrackingAdminMSP** - Administrateur reseau

## Cycle de vie d'une grume
```
INITIALIZED -> PERMITTED -> HARVESTED -> TRANSPORTED -> SOLD
```

## Securite

- Blockchain privee et permissionnee
- Authentification MSP (X.509)
- Endorsement policies par fonction
- Gel d'urgence du reseau
- Audit trail complet

## Auteurs

Auteur: **Mawandu Hamba Heritier**  
Encadrant: **Dr. HO Tuong Vinh**  
Annee: 2025-2026  
Institution: VNU-IS Hanoi

## License

Projet academique - VNU International School

## Contact

- GitHub: [@Mawandu](https://github.com/Mawandu)

---

**TreeTracking v2.0** - Tracabilite Forestiere sur Blockchain
