# Scripts de gestion TreeTracking v2.0

## Démarrage complet
```bash
./start-treetracking.sh
Démarre tous les services dans l'ordre :

Blockchain (Docker)
IPFS daemon
API Server (Node 12)
Frontend React
Documentation

Arrêt complet
./stop-treetracking.sh
Arrête tous les services proprement.
Vérifier l'état
./status-treetracking.sh
Affiche l'état de chaque service.
Services individuels
Blockchain uniquement
cd ~/treesystems
docker-compose up -d
API Server uniquement
cd ~/treesystems/api-server
nvm use 12
npm start
Frontend uniquement
cd ~/treesystems/treetracking-web
npm start
Logs
Tous les logs sont dans ~/treesystems/logs/:

ipfs.log
api-server.log
react.log
docs.log

Voir les logs en temps réel :
tail -f ~/treesystems/logs/api-server.log
Troubleshooting
Port déjà utilisé
# Trouver le processus
lsof -i :3000

# Tuer le processus
fuser -k 3000/tcp
Blockchain ne démarre pas
cd ~/treesystems
docker-compose down
docker-compose up -d
Node version incorrecte
nvm use 12
