# Guide de Déploiement Production

## Prérequis

### Matériel minimum
- **4 serveurs physiques/VMs** (1 par organisation)
- CPU: 4 cores minimum
- RAM: 8 GB minimum
- Disque: 100 GB SSD
- Réseau: 1 Gbps

### Logiciels
- Ubuntu Server 20.04 LTS
- Docker 20.10+
- Docker Compose 1.29+
- Node.js 12.x
- Go 1.17+
- IPFS 0.30+

## Architecture Production

[Load Balancer]
↓
[API Servers x3] ← Redis Cache
↓
[Fabric Network]

Orderers x3 (Raft)
Peers x2 per org
CouchDB per peer
↓
[IPFS Cluster x3]
[PostgreSQL] (metrics)
[Prometheus + Grafana]

## Installation

### 1. Préparation serveurs
```bash
# Sur chaque serveur
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose git curl

# Installer Node.js 12
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 12
nvm use 12

# Installer Go
wget https://go.dev/dl/go1.17.13.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.17.13.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc

2. Configuration Fabric
2.1 Générer crypto-material production

# Sur serveur admin
cd ~/treesystems/network-config
cryptogen generate --config=crypto-config.yaml --output="../crypto-config-prod"
configtxgen -profile FourOrgsChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID treetrackingchannel

2.2 Docker Compose production
Créer docker-compose-prod.yaml avec :

TLS activé
Raft orderers (3)
2 peers par org
Resource limits
Restart policies
Logging configured

2.3 Déployer le réseau

docker-compose -f docker-compose-prod.yaml up -d
docker ps  # Vérifier 15+ conteneurs

3. Déployer chaincode

# Installer sur tous les peers
./deploy-chaincode-prod.sh

# Vérifier
peer chaincode list --installed
peer chaincode list --instantiated -C treetrackingchannel

4. Configuration API Servers
4.1 Load Balancer (Nginx)

upstream api_backend {
    least_conn;
    server api1.treetracking.com:3000;
    server api2.treetracking.com:3000;
    server api3.treetracking.com:3000;
}

server {
    listen 80;
    server_name api.treetracking.com;

    location / {
        proxy_pass http://api_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

4.2 Redis Cache

# .env.production
NODE_ENV=production
PORT=3000
FABRIC_NETWORK=production
IPFS_HOST=ipfs-cluster.treetracking.com
REDIS_URL=redis://localhost:6379
LOG_LEVEL=info

4.4 PM2 Process Manager

npm install -g pm2

# ecosystem.config.js
module.exports = {
  apps: [{
    name: 'treetracking-api',
    script: './server.js',
    instances: 4,
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};

pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

5. IPFS Cluster

# Sur 3 serveurs
wget https://dist.ipfs.tech/ipfs-cluster-service/v1.0.5/ipfs-cluster-service_v1.0.5_linux-amd64.tar.gz
tar -xvzf ipfs-cluster-service_v1.0.5_linux-amd64.tar.gz
sudo mv ipfs-cluster-service/ipfs-cluster-service /usr/local/bin/

# Initialiser cluster
ipfs-cluster-service init
ipfs-cluster-service daemon &

# Bootstrap autres noeuds
ipfs-cluster-service --bootstrap /ip4/NODE1_IP/tcp/9096/p2p/CLUSTER_ID daemon &

6. Frontend Production

# Build
cd ~/treesystems/treetracking-web
npm run build

# Servir avec Nginx
sudo cp -r build/* /var/www/treetracking/

Nginx config frontend

server {
    listen 80;
    server_name treetracking.com;
    root /var/www/treetracking;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location /api {
        proxy_pass http://api.treetracking.com;
    }
}

Sécurité
SSL/TLS (Let's Encrypt)

sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d treetracking.com -d api.treetracking.com


Firewall

sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 7051/tcp  # Fabric peers
sudo ufw enable

Backup automatique

# Crontab
0 2 * * * /opt/scripts/backup-blockchain.sh
0 3 * * * /opt/scripts/backup-ipfs.sh
0 4 * * * /opt/scripts/backup-database.sh

Monitoring
Prometheus

# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'fabric-peers'
    static_configs:
      - targets: ['peer0:9443', 'peer1:9443']
  
  - job_name: 'api-servers'
    static_configs:
      - targets: ['api1:3000', 'api2:3000']

Grafana Dashboards

Fabric: Transactions, blocks, endorsement time
API: Request rate, response time, errors
IPFS: Storage usage, bandwidth
System: CPU, RAM, Disk

Maintenance
Update chaincode   

# Nouvelle version
peer chaincode install -n treetracking -v 2.1 ...
peer chaincode upgrade -n treetracking -v 2.1 ...

Scale API

pm2 scale treetracking-api +2  # Ajouter 2 instances

IPFS Garbage Collection

ipfs repo gc  # Libérer espace

Troubleshooting Production
Logs

# Fabric
docker logs peer0.admin.treetracking.com --tail 100

# API
pm2 logs treetracking-api

# IPFS
journalctl -u ipfs

Health Checks

# API
curl https://api.treetracking.com/health

# Fabric
peer channel list

# IPFS
ipfs swarm peers

Checklist pré-production

 Certificats SSL installés
 Firewall configuré
 Backup automatique testé
 Monitoring actif
 Load balancer fonctionnel
 Redis cache opérationnel
 IPFS cluster synchronisé
 Tests de charge effectués
 Documentation à jour
 Plan de disaster recovery
