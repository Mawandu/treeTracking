Guide d'Installation Développement
Installation rapide
1. Cloner le projet

git clone https://github.com/votre-repo/treetracking.git
cd treetracking

2. Installer dépendances 

# Node.js 12
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 12

# Docker
sudo apt install docker.io docker-compose

# IPFS
wget https://dist.ipfs.tech/kubo/v0.30.0/kubo_v0.30.0_linux-amd64.tar.gz
tar -xvzf kubo_v0.30.0_linux-amd64.tar.gz
cd kubo
sudo bash install.sh
ipfs init

3. Démarrer les services

# Terminal 1: IPFS
ipfs daemon &

# Terminal 2: Fabric
cd treesystems
docker-compose up -d

# Terminal 3: API
cd api-server
nvm use 12
npm install
npm start

# Terminal 4: Frontend
cd treetracking-web
npm install
npm start


4. Accéder

Frontend: http://localhost:3001
API: http://localhost:3000
IPFS Gateway: http://127.0.0.1:8080/ipfs/

Vérification

# Fabric
docker ps | grep treetracking

# API
curl http://localhost:3000/health

# IPFS
curl http://127.0.0.1:5001/api/v0/version
