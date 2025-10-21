# Guide des Procédures TreeTracking v2.0

## 🌲 1. ForestryAuthority (Autorité Forestière)

### Procédure complète de gestion d'une grume

#### A. Initialiser une grume
1. Accéder : http://localhost:3001/dashboard/ForestryAuthorityMSP
2. Entrer un Log ID (ex: LOG006)
3. Remplir Species (ex: Sapelli) et Origin (ex: Forêt de Kisangani)
4. Cliquer "Initialize Log"

#### B. Émettre une licence (NOUVEAU v2.0)
1. Section "License Management"
2. Remplir License ID (ex: LIC-2025-002)
3. Choisir Company MSP (LoggingCompaniesMSP)
4. Total Cubage (ex: 1000 m³)
5. Date expiration
6. Cliquer "Issue License"

#### C. Valider l'origine
1. Rechercher le Log ID
2. Cliquer "Validate Origin"

#### D. Émettre un permis
1. Permit ID (ex: PERMIT-006)
2. Date d'expiration
3. Cliquer "Issue Permit"

---

## 🪓 2. LoggingCompany (Entreprise Exploitante)

### Procédure d'exploitation

#### A. Déclarer la coupe
1. Accéder : http://localhost:3001/dashboard/LoggingCompaniesMSP
2. Rechercher le Log ID
3. Vérifier que le statut est "PERMITTED"
4. Cliquer "Declare Harvest"

#### B. Ajouter données physiques
1. Dimensions (ex: 500x60x60cm)
2. Poids (ex: 1200 kg)
3. Quality (A, B, ou C)
4. Marking (ex: MARK-123)
5. Cliquer "Add Physical Data"

#### C. Uploader une photo IPFS
1. Cliquer "Choisir un fichier"
2. Sélectionner une photo de la grume
3. Cliquer "Upload to IPFS"
4. Attendre le hash IPFS (QmXXX...)

#### D. Mettre à jour le transport
1. Transport Status (ex: "En route vers Kinshasa")
2. Cliquer "Update Transport"

---

## 🏢 3. BuyingCompany (Entreprise Acheteuse)

### Procédure d'achat et transfert

#### A. Vérifier une grume
1. Accéder : http://localhost:3001/dashboard/BuyingCompaniesMSP
2. Rechercher le Log ID
3. Vérifier l'historique complet
4. Voir la photo sur IPFS

#### B. Valider un achat
1. Buyer ID (ex: BUYER-001)
2. Price (ex: 15000)
3. Currency (USD, EUR, CDF)
4. Cliquer "Validate Purchase"

#### C. Transférer la propriété (NOUVEAU v2.0)
1. Rechercher un log au statut "SOLD"
2. Section "Transfer Ownership" apparaît
3. New Buyer ID (ex: BUYER-002)
4. Transfer Price (ex: 18000)
5. Cliquer "Transfer"
6. Vérifier l'événement "OWNERSHIP_TRANSFERRED" dans l'historique

---

## 🔧 4. Admin (Administrateur Réseau)

### Gestion du réseau

#### A. Surveillance
1. Accéder : http://localhost:3001/dashboard/TreeTrackingAdminMSP
2. Badge réseau en haut : ACTIVE ou FROZEN
3. Rechercher n'importe quel Log ID
4. Voir tous les historiques

#### B. Gel d'urgence (NOUVEAU v2.0)
1. Section "Network Control"
2. Status actuel : ACTIVE
3. Freeze Reason (ex: "Audit en cours")
4. Cliquer "Emergency Freeze"
5. **Effet** : Toutes les transactions bloquées

#### C. Dégeler le réseau
1. Status : FROZEN
2. Cliquer "Unfreeze Network"
3. Réseau redevient opérationnel

#### D. Consulter les licences
1. Utiliser l'API ou créer interface dédiée
2. GET http://localhost:3000/api/license/LIC-2025-001

---

## 📊 Tests de bout en bout

### Scénario complet LOG007
```bash
# Terminal
cd ~/treesystems/api-server

# Test 1: Émettre licence
curl -X POST http://localhost:3000/api/forestry/issueLicense \
  -H "Content-Type: application/json" \
  -d '{
    "licenseID": "LIC-2025-003",
    "companyMSP": "LoggingCompaniesMSP",
    "totalCubage": 800,
    "expiryDate": "2025-12-31T23:59:59Z"
  }'

# Test 2: Initialiser LOG007
curl -X POST http://localhost:3000/api/forestry/initializeLog \
  -H "Content-Type: application/json" \
  -d '{"logID": "LOG007", "species": "Wenge", "origin": "Foret de Mbandaka"}'

# Test 3: Valider origine
curl -X POST http://localhost:3000/api/forestry/validateOrigin \
  -H "Content-Type: application/json" \
  -d '{"logID": "LOG007"}'

# Test 4: Émettre permis
curl -X POST http://localhost:3000/api/forestry/issuePermit \
  -H "Content-Type: application/json" \
  -d '{
    "logID": "LOG007",
    "permitID": "PERMIT-007",
    "expiryDate": "2025-11-30T23:59:59Z"
  }'

# Test 5: Déclarer coupe
curl -X POST http://localhost:3000/api/logging/declareHarvest \
  -H "Content-Type: application/json" \
  -d '{"logID": "LOG007"}'

# Test 6: Données physiques
curl -X POST http://localhost:3000/api/logging/addPhysicalData \
  -H "Content-Type: application/json" \
  -d '{
    "logID": "LOG007",
    "dimensions": "450x55x55cm",
    "weight": 1100,
    "quality": "A",
    "marking": "WEN-007"
  }'

# Test 7: Transport
curl -X POST http://localhost:3000/api/logging/updateTransport \
  -H "Content-Type: application/json" \
  -d '{"logID": "LOG007", "status": "Arrivé au port de Matadi"}'

# Test 8: Achat
curl -X POST http://localhost:3000/api/buying/validatePurchase \
  -H "Content-Type: application/json" \
  -d '{
    "logID": "LOG007",
    "buyerID": "BUYER-EXPORT-001",
    "price": 22000,
    "currency": "USD"
  }'

# Test 9: Transfert
curl -X POST http://localhost:3000/api/buying/transferOwnership \
  -H "Content-Type: application/json" \
  -d '{
    "logID": "LOG007",
    "newBuyerID": "BUYER-INTL-999",
    "price": 28000,
    "currency": "EUR"
  }'

# Test 10: Vérifier historique complet
curl http://localhost:3000/api/logs/LOG007
🔍 Points de contrôle
ForestryAuthority

 Licence émise avec cubage correct
 Log initialisé avec espèce et origine
 Origine validée
 Permis émis avant expiration

LoggingCompany

 Coupe déclarée après permis
 Données physiques complètes
 Photo uploadée sur IPFS (hash QmXXX...)
 Transport mis à jour

BuyingCompany

 Achat validé
 Prix et devise corrects
 Transfert effectué avec nouvel acheteur

Admin

 Réseau gelé en cas d'urgence
 Toutes transactions bloquées pendant freeze
 Réseau dégelé après audit
 Tous événements tracés


📱 URLs importantes

Home : http://localhost:3001
ForestryAuthority : http://localhost:3001/dashboard/ForestryAuthorityMSP
LoggingCompany : http://localhost:3001/dashboard/LoggingCompaniesMSP
BuyingCompany : http://localhost:3001/dashboard/BuyingCompaniesMSP
Admin : http://localhost:3001/dashboard/TreeTrackingAdminMSP
API Health : http://localhost:3000/health
IPFS Gateway : http://127.0.0.1:8080/ipfs/QmXXX...


⚠️ Dépannage
IPFS ne fonctionne pas
ipfs daemon &
sleep 10
curl http://127.0.0.1:8080/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/readme

API ne répond pas 
cd ~/treesystems/api-server
nvm use 12
npm start

Dashboard Reacr ne charge pas

cd ~/treesystems/treetracking-web
npm start

Blockchain inaccessible 

cd ~/treesystems
docker ps  # Vérifier que tous les conteneurs tournent
docker-compose restart

📈 Améliorations futures suggérées

Vision par ordinateur : Reconnaissance automatique d'espèces
GPS : Géolocalisation des grumes
QR Code : Génération pour traçabilité terrain
Rapport PDF : Export de la traçabilité complète
Statistiques : Dashboard avec graphiques
Notifications : Alertes email/SMS
Multi-langue : FR, EN, Lingala
Mobile App : Version Android/iOS native
