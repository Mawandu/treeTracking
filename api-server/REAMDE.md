
# TreeTracking API Documentation

API REST pour la plateforme de traçabilité forestière TreeTracking basée sur Hyperledger Fabric.

## Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Architecture](#architecture)
- [Démarrage rapide](#démarrage-rapide)
- [Authentification](#authentification)
- [Endpoints](#endpoints)
- [Modèles de données](#modèles-de-données)
- [Codes d'erreur](#codes-derreur)
- [Exemples d'utilisation](#exemples-dutilisation)

## Vue d'ensemble

L'API TreeTracking permet aux différents acteurs de la chaîne d'approvisionnement du bois d'interagir avec la blockchain pour assurer une traçabilité complète et transparente.

### URL de base
```
http://localhost:3000
```

### Format des données
- Requêtes : JSON (`Content-Type: application/json`)
- Réponses : JSON

## Architecture

### Organisations MSP

| Organisation | MSP ID | Rôle |
|-------------|--------|------|
| Admin | TreeTrackingAdminMSP | Administration du réseau |
| Forestry Authority | ForestryAuthorityMSP | Validation origine, émission permis |
| Logging Company | LoggingCompaniesMSP | Exploitation, données physiques |
| Buying Company | BuyingCompaniesMSP | Vérification, achat |

### Statuts des grumes

```
INITIALIZED → PERMITTED → HARVESTED → TRANSPORTED → SOLD
```

## Démarrage rapide

### Prérequis
- Node.js v10.15.3+ ou v12.15.0+
- Réseau Hyperledger Fabric actif
- Identités MSP enrollées

### Installation

```bash
npm install
```

### Enrollment des identités

```bash
npm run enroll
```

### Démarrage du serveur

```bash
npm start
```

### Test de santé

```bash
curl http://localhost:3000/health
```

Réponse attendue :
```json
{
  "status": "ok",
  "timestamp": "2025-09-30T06:00:00.000Z"
}
```

## Authentification

L'authentification se fait via le paramètre `msp` dans les requêtes ou est déterminée automatiquement selon l'endpoint utilisé.

Les identités MSP sont gérées dans le wallet local (`./wallet/`).

## Endpoints

### Forestry Authority

#### Initialiser une grume

Crée un nouvel enregistrement de grume dans la blockchain.

**Endpoint:** `POST /api/forestry/initializeLog`

**Permissions:** ForestryAuthorityMSP uniquement

**Body:**
```json
{
  "logID": "string",      // Identifiant unique de la grume
  "species": "string",    // Espèce d'arbre (ex: "Acajou", "Sapelli")
  "origin": "string"      // Origine géographique (ex: "Foret de Yangambi")
}
```

**Réponse succès (200):**
```json
{
  "success": true,
  "message": "Log initialized",
  "logID": "LOG001"
}
```

**Exemple:**
```bash
curl -X POST http://localhost:3000/api/forestry/initializeLog \
  -H "Content-Type: application/json" \
  -d '{
    "logID": "LOG003",
    "species": "Wenge",
    "origin": "Foret de Mai-Ndombe"
  }'
```

---

#### Valider l'origine

Valide l'authenticité de l'origine forestière d'une grume.

**Endpoint:** `POST /api/forestry/validateOrigin`

**Permissions:** ForestryAuthorityMSP uniquement

**Body:**
```json
{
  "logID": "string"
}
```

**Réponse succès (200):**
```json
{
  "success": true,
  "message": "Origin validated"
}
```

**Exemple:**
```bash
curl -X POST http://localhost:3000/api/forestry/validateOrigin \
  -H "Content-Type: application/json" \
  -d '{"logID": "LOG003"}'
```

---

#### Émettre un permis de coupe

Émet un permis d'exploitation pour une grume validée.

**Endpoint:** `POST /api/forestry/issuePermit`

**Permissions:** ForestryAuthorityMSP uniquement

**Body:**
```json
{
  "logID": "string",
  "permitID": "string",
  "expiryDate": "string"  // Format ISO 8601: "2025-12-31T23:59:59Z"
}
```

**Réponse succès (200):**
```json
{
  "success": true,
  "message": "Permit issued",
  "permitID": "PERMIT-003"
}
```

**Exemple:**
```bash
curl -X POST http://localhost:3000/api/forestry/issuePermit \
  -H "Content-Type: application/json" \
  -d '{
    "logID": "LOG003",
    "permitID": "PERMIT-003",
    "expiryDate": "2026-06-30T23:59:59Z"
  }'
```

---

### Logging Company

#### Déclarer l'exploitation

Signale le début de l'exploitation d'une grume autorisée.

**Endpoint:** `POST /api/logging/declareHarvest`

**Permissions:** LoggingCompaniesMSP uniquement

**Body:**
```json
{
  "logID": "string"
}
```

**Réponse succès (200):**
```json
{
  "success": true,
  "message": "Harvest declared"
}
```

**Exemple:**
```bash
curl -X POST http://localhost:3000/api/logging/declareHarvest \
  -H "Content-Type: application/json" \
  -d '{"logID": "LOG003"}'
```

---

#### Ajouter des données physiques

Enregistre les mesures physiques de la grume exploitée.

**Endpoint:** `POST /api/logging/addPhysicalData`

**Permissions:** LoggingCompaniesMSP uniquement

**Body:**
```json
{
  "logID": "string",
  "dimensions": "string",  // Format: "longueur x largeur x hauteur"
  "weight": number,        // Poids en kg
  "quality": "string",     // Grade de qualité: "A", "B", "C"
  "marking": "string"      // Marquage unique
}
```

**Réponse succès (200):**
```json
{
  "success": true,
  "message": "Physical data added"
}
```

**Exemple:**
```bash
curl -X POST http://localhost:3000/api/logging/addPhysicalData \
  -H "Content-Type: application/json" \
  -d '{
    "logID": "LOG003",
    "dimensions": "450x60x60cm",
    "weight": 1200.5,
    "quality": "A",
    "marking": "MARK-003"
  }'
```

---

#### Uploader multimédia

Enregistre le hash IPFS des fichiers multimédia (photos, documents).

**Endpoint:** `POST /api/logging/uploadMultimedia`

**Permissions:** LoggingCompaniesMSP uniquement

**Body:**
```json
{
  "logID": "string",
  "ipfsHash": "string",    // Hash IPFS du fichier
  "metadata": {            // Métadonnées optionnelles
    "type": "string",
    "camera": "string",
    "gps": "string"
  }
}
```

**Réponse succès (200):**
```json
{
  "success": true,
  "message": "Multimedia uploaded",
  "ipfsHash": "QmXYZ123abc"
}
```

**Exemple:**
```bash
curl -X POST http://localhost:3000/api/logging/uploadMultimedia \
  -H "Content-Type: application/json" \
  -d '{
    "logID": "LOG003",
    "ipfsHash": "QmABC456def",
    "metadata": {
      "type": "photo",
      "camera": "Sony A7",
      "gps": "-2.8456, 23.6543"
    }
  }'
```

---

#### Mettre à jour le transport

Enregistre le statut de transport de la grume.

**Endpoint:** `POST /api/logging/updateTransport`

**Permissions:** LoggingCompaniesMSP uniquement

**Body:**
```json
{
  "logID": "string",
  "status": "string"  // Description du statut
}
```

**Réponse succès (200):**
```json
{
  "success": true,
  "message": "Transport status updated"
}
```

**Exemple:**
```bash
curl -X POST http://localhost:3000/api/logging/updateTransport \
  -H "Content-Type: application/json" \
  -d '{
    "logID": "LOG003",
    "status": "Arrivé au port de Matadi"
  }'
```

---

### Buying Company

#### Valider un achat

Enregistre une transaction d'achat validée.

**Endpoint:** `POST /api/buying/validatePurchase`

**Permissions:** BuyingCompaniesMSP uniquement

**Body:**
```json
{
  "logID": "string",
  "buyerID": "string",
  "price": number,
  "currency": "string"  // "USD", "EUR", "CDF", etc.
}
```

**Réponse succès (200):**
```json
{
  "success": true,
  "message": "Purchase validated"
}
```

**Exemple:**
```bash
curl -X POST http://localhost:3000/api/buying/validatePurchase \
  -H "Content-Type: application/json" \
  -d '{
    "logID": "LOG003",
    "buyerID": "BUYER-456",
    "price": 25000,
    "currency": "USD"
  }'
```

---

#### Vérifier la conformité

Vérifie si une grume respecte tous les critères de conformité.

**Endpoint:** `GET /api/buying/verifyCompliance/:logID`

**Permissions:** BuyingCompaniesMSP uniquement

**Paramètres URL:**
- `logID` : Identifiant de la grume

**Réponse succès (200):**
```json
{
  "success": true,
  "data": {
    "compliant": true,
    "logID": "LOG003"
  }
}
```

**Critères de conformité:**
- Origine validée (`originValidated: true`)
- Permis valide et non révoqué
- Données physiques présentes
- Au moins un fichier multimédia IPFS

**Exemple:**
```bash
curl http://localhost:3000/api/buying/verifyCompliance/LOG003
```

---

### Requêtes générales

#### Consulter l'historique d'une grume

Récupère toutes les informations et l'historique complet d'une grume.

**Endpoint:** `GET /api/logs/:logID`

**Permissions:** Toutes les organisations (selon paramètre `msp`)

**Paramètres URL:**
- `logID` : Identifiant de la grume

**Paramètres Query:**
- `msp` : Organisation MSP (optionnel, défaut: TreeTrackingAdminMSP)
  - `TreeTrackingAdminMSP`
  - `ForestryAuthorityMSP`
  - `LoggingCompaniesMSP`
  - `BuyingCompaniesMSP`

**Réponse succès (200):**
```json
{
  "success": true,
  "data": {
    "logID": "LOG001",
    "species": "Acajou",
    "origin": "Foret de Yangambi",
    "status": "SOLD",
    "createdBy": "...",
    "createdAt": "2025-09-30T04:29:39Z",
    "originValidated": true,
    "permit": {
      "permitID": "PERMIT-001",
      "logID": "LOG001",
      "issuedBy": "...",
      "issuedAt": "2025-09-30T04:36:20Z",
      "expiryDate": "2025-12-31T23:59:59Z",
      "isRevoked": false
    },
    "physicalData": {
      "dimensions": "300x50x50cm",
      "weight": 850.5,
      "quality": "A",
      "marking": "MARK-001",
      "addedBy": "...",
      "addedAt": "2025-09-30T04:40:29Z"
    },
    "multimediaData": [
      {
        "ipfsHash": "QmXYZ123abc",
        "metadata": {
          "type": "photo",
          "camera": "Canon"
        },
        "uploadedBy": "...",
        "uploadedAt": "2025-09-30T04:41:13Z"
      }
    ],
    "transportStatus": "En route vers Kinshasa",
    "purchase": {
      "buyerID": "BUYER-123",
      "price": 15000,
      "currency": "USD",
      "isCompliant": true,
      "validatedBy": "...",
      "validatedAt": "2025-09-30T04:43:01Z"
    },
    "history": [
      {
        "action": "INITIALIZED",
        "actor": "...",
        "timestamp": "2025-09-30T04:29:39Z",
        "description": "Log initialized: Acajou from Foret de Yangambi"
      },
      ...
    ]
  }
}
```

**Exemple:**
```bash
curl "http://localhost:3000/api/logs/LOG001?msp=TreeTrackingAdminMSP"
```

---

#### Health Check

Vérifie l'état du serveur API.

**Endpoint:** `GET /health`

**Permissions:** Public

**Réponse succès (200):**
```json
{
  "status": "ok",
  "timestamp": "2025-09-30T06:00:00.000Z"
}
```

**Exemple:**
```bash
curl http://localhost:3000/health
```

---

## Modèles de données

### TreeLog

```typescript
interface TreeLog {
  logID: string;
  species: string;
  origin: string;
  status: "INITIALIZED" | "PERMITTED" | "HARVESTED" | "TRANSPORTED" | "SOLD";
  createdBy: string;
  createdAt: string;
  originValidated: boolean;
  permit?: HarvestPermit;
  physicalData?: PhysicalData;
  multimediaData?: MultimediaData[];
  transportStatus?: string;
  purchase?: Purchase;
  history: HistoryEntry[];
}
```

### HarvestPermit

```typescript
interface HarvestPermit {
  permitID: string;
  logID: string;
  issuedBy: string;
  issuedAt: string;
  expiryDate: string;
  isRevoked: boolean;
  revocationDate?: string;
  revocationBy?: string;
}
```

### PhysicalData

```typescript
interface PhysicalData {
  dimensions: string;
  weight: number;
  quality: string;
  marking: string;
  addedBy: string;
  addedAt: string;
}
```

### MultimediaData

```typescript
interface MultimediaData {
  ipfsHash: string;
  metadata: Record<string, string>;
  uploadedBy: string;
  uploadedAt: string;
}
```

### Purchase

```typescript
interface Purchase {
  buyerID: string;
  price: number;
  currency: string;
  isCompliant: boolean;
  validatedBy: string;
  validatedAt: string;
}
```

### HistoryEntry

```typescript
interface HistoryEntry {
  action: string;
  actor: string;
  timestamp: string;
  description: string;
}
```

## Codes d'erreur

| Code HTTP | Description |
|-----------|-------------|
| 200 | Succès |
| 400 | Requête invalide (paramètres manquants ou incorrects) |
| 403 | Accès refusé (permissions MSP insuffisantes) |
| 404 | Ressource non trouvée |
| 500 | Erreur serveur ou blockchain |

### Format des erreurs

```json
{
  "success": false,
  "error": "Message d'erreur détaillé"
}
```

### Erreurs courantes

**Log not found**
```json
{
  "success": false,
  "error": "Log LOG999 does not exist"
}
```

**Access denied**
```json
{
  "success": false,
  "error": "access denied: only ForestryAuthority can initialize logs"
}
```

**Invalid status transition**
```json
{
  "success": false,
  "error": "log must be in INITIALIZED status"
}
```

**Expired permit**
```json
{
  "success": false,
  "error": "permit has expired"
}
```

## Exemples d'utilisation

### Workflow complet d'une grume

```bash
# 1. ForestryAuthority initialise LOG004
curl -X POST http://localhost:3000/api/forestry/initializeLog \
  -H "Content-Type: application/json" \
  -d '{"logID":"LOG004","species":"Iroko","origin":"Foret de Kisangani"}'

# 2. ForestryAuthority valide l'origine
curl -X POST http://localhost:3000/api/forestry/validateOrigin \
  -H "Content-Type: application/json" \
  -d '{"logID":"LOG004"}'

# 3. ForestryAuthority émet un permis
curl -X POST http://localhost:3000/api/forestry/issuePermit \
  -H "Content-Type: application/json" \
  -d '{"logID":"LOG004","permitID":"PERMIT-004","expiryDate":"2026-12-31T23:59:59Z"}'

# 4. LoggingCompany déclare l'exploitation
curl -X POST http://localhost:3000/api/logging/declareHarvest \
  -H "Content-Type: application/json" \
  -d '{"logID":"LOG004"}'

# 5. LoggingCompany ajoute les données physiques
curl -X POST http://localhost:3000/api/logging/addPhysicalData \
  -H "Content-Type: application/json" \
  -d '{"logID":"LOG004","dimensions":"400x55x55cm","weight":980.0,"quality":"B","marking":"MARK-004"}'

# 6. LoggingCompany upload multimédia
curl -X POST http://localhost:3000/api/logging/uploadMultimedia \
  -H "Content-Type: application/json" \
  -d '{"logID":"LOG004","ipfsHash":"QmDEF789ghi","metadata":{"type":"photo"}}'

# 7. LoggingCompany met à jour le transport
curl -X POST http://localhost:3000/api/logging/updateTransport \
  -H "Content-Type: application/json" \
  -d '{"logID":"LOG004","status":"Expédié vers Brazzaville"}'

# 8. BuyingCompany vérifie la conformité
curl http://localhost:3000/api/buying/verifyCompliance/LOG004

# 9. BuyingCompany valide l'achat
curl -X POST http://localhost:3000/api/buying/validatePurchase \
  -H "Content-Type: application/json" \
  -d '{"logID":"LOG004","buyerID":"BUYER-789","price":18500,"currency":"USD"}'

# 10. Consulter l'historique final
curl "http://localhost:3000/api/logs/LOG004?msp=BuyingCompaniesMSP"
```

### Utilisation avec jq pour formatter le JSON

```bash
# Consulter une grume avec formatage
curl -s "http://localhost:3000/api/logs/LOG001?msp=TreeTrackingAdminMSP" | jq '.'

# Extraire uniquement le statut
curl -s "http://localhost:3000/api/logs/LOG001?msp=TreeTrackingAdminMSP" | jq '.data.status'

# Compter les entrées d'historique
curl -s "http://localhost:3000/api/logs/LOG001?msp=TreeTrackingAdminMSP" | jq '.data.history | length'
```

## Support et Contact

Pour toute question ou problème :
- Auteur : Mawandu Hamba Heritier
- Projet : TreeTracking
- Année : 2025-2026

## Licence

ISC
EOF

# Créer un fichier d'exemples Postman
cat << 'EOF' > POSTMAN_COLLECTION.json
{
  "info": {
    "name": "TreeTracking API",
    "description": "Collection complète des endpoints TreeTracking",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Forestry Authority",
      "item": [
        {
          "name": "Initialize Log",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "url": "http://localhost:3000/api/forestry/initializeLog",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"logID\": \"LOG005\",\n  \"species\": \"Teak\",\n  \"origin\": \"Foret de Luki\"\n}"
            }
          }
        },
        {
          "name": "Validate Origin",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "url": "http://localhost:3000/api/forestry/validateOrigin",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"logID\": \"LOG005\"\n}"
            }
          }
        },
        {
          "name": "Issue Permit",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "url": "http://localhost:3000/api/forestry/issuePermit",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"logID\": \"LOG005\",\n  \"permitID\": \"PERMIT-005\",\n  \"expiryDate\": \"2026-12-31T23:59:59Z\"\n}"
            }
          }
        }
      ]
    },
    {
      "name": "Logging Company",
      "item": [
        {
          "name": "Declare Harvest",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "url": "http://localhost:3000/api/logging/declareHarvest",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"logID\": \"LOG005\"\n}"
            }
          }
        },
        {
          "name": "Add Physical Data",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "url": "http://localhost:3000/api/logging/addPhysicalData",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"logID\": \"LOG005\",\n  \"dimensions\": \"500x70x70cm\",\n  \"weight\": 1500.0,\n  \"quality\": \"A\",\n  \"marking\": \"MARK-005\"\n}"
            }
          }
        },
        {
          "name": "Upload Multimedia",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "url": "http://localhost:3000/api/logging/uploadMultimedia",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"logID\": \"LOG005\",\n  \"ipfsHash\": \"QmGHI101jkl\",\n  \"metadata\": {\n    \"type\": \"photo\",\n    \"camera\": \"Nikon D850\"\n  }\n}"
            }
          }
        },
        {
          "name": "Update Transport",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "url": "http://localhost:3000/api/logging/updateTransport",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"logID\": \"LOG005\",\n  \"status\": \"Transit vers Kinshasa\"\n}"
            }
          }
        }
      ]
    },
    {
      "name": "Buying Company",
      "item": [
        {
          "name": "Verify Compliance",
          "request": {
            "method": "GET",
            "url": "http://localhost:3000/api/buying/verifyCompliance/LOG005"
          }
        },
        {
          "name": "Validate Purchase",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "url": "http://localhost:3000/api/buying/validatePurchase",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"logID\": \"LOG005\",\n  \"buyerID\": \"BUYER-999\",\n  \"price\": 22000,\n  \"currency\": \"USD\"\n}"
            }
          }
        }
      ]
    },
    {
      "name": "Queries",
      "item": [
        {
          "name": "Get Log History",
          "request": {
            "method": "GET",
            "url": "http://localhost:3000/api/logs/LOG001?msp=TreeTrackingAdminMSP"
          }
        },
        {
          "name": "Health Check",
          "request": {
            "method": "GET",
            "url": "http://localhost:3000/health"
          }
        }
      ]
    }
  ]
}

