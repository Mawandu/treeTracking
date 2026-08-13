const fs = require('fs');
const path = require('path');

const basePath = '/home/hamba/treesystems';

function getPrivateKeyPath(userType, domain) {
    const keystorePath = path.join(basePath, `crypto-config/peerOrganizations/${domain}/users/${userType}@${domain}/msp/keystore`);
    const files = fs.readdirSync(keystorePath);
    for (const file of files) {
        if (file.endsWith('_sk')) {
            return path.join(keystorePath, file);
        }
    }
    throw new Error(`No private key found in ${keystorePath}`);
}

const networkConfig = {
    name: 'TreeTrackingNetwork',
    version: '1.0',
    caliper: {
        blockchain: 'fabric',
    },
    clients: {
        'ForestryAuthorityMSP-User1': {
            client: {
                organization: 'ForestryAuthorityMSP',
                credentialStore: { path: '/tmp/hfc-kvs/forestry', cryptoStore: { path: '/tmp/hfc-cvs/forestry' } },
                clientPrivateKey: { path: getPrivateKeyPath('User1', 'forestryauthority.treetracking.com') },
                clientSignedCert: { path: path.join(basePath, 'crypto-config/peerOrganizations/forestryauthority.treetracking.com/users/User1@forestryauthority.treetracking.com/msp/signcerts/User1@forestryauthority.treetracking.com-cert.pem') }
            }
        },
        'LoggingCompaniesMSP-User1': {
            client: {
                organization: 'LoggingCompaniesMSP',
                credentialStore: { path: '/tmp/hfc-kvs/logging', cryptoStore: { path: '/tmp/hfc-cvs/logging' } },
                clientPrivateKey: { path: getPrivateKeyPath('User1', 'loggingcompany.treetracking.com') },
                clientSignedCert: { path: path.join(basePath, 'crypto-config/peerOrganizations/loggingcompany.treetracking.com/users/User1@loggingcompany.treetracking.com/msp/signcerts/User1@loggingcompany.treetracking.com-cert.pem') }
            }
        },
        'BuyingCompaniesMSP-User1': {
            client: {
                organization: 'BuyingCompaniesMSP',
                credentialStore: { path: '/tmp/hfc-kvs/buying', cryptoStore: { path: '/tmp/hfc-cvs/buying' } },
                clientPrivateKey: { path: getPrivateKeyPath('User1', 'buyingcompany.treetracking.com') },
                clientSignedCert: { path: path.join(basePath, 'crypto-config/peerOrganizations/buyingcompany.treetracking.com/users/User1@buyingcompany.treetracking.com/msp/signcerts/User1@buyingcompany.treetracking.com-cert.pem') }
            }
        },
        'TreeTrackingAdminMSP-User1': {
            client: {
                organization: 'TreeTrackingAdminMSP',
                credentialStore: { path: '/tmp/hfc-kvs/admin', cryptoStore: { path: '/tmp/hfc-cvs/admin' } },
                clientPrivateKey: { path: getPrivateKeyPath('User1', 'admin.treetracking.com') },
                clientSignedCert: { path: path.join(basePath, 'crypto-config/peerOrganizations/admin.treetracking.com/users/User1@admin.treetracking.com/msp/signcerts/User1@admin.treetracking.com-cert.pem') }
            }
        }
    },
    channels: {
        treetrackingchannel: {
            created: true,
            orderers: ['orderer.treetracking.com'],
            peers: {
                'peer0.admin.treetracking.com': { eventSource: true },
                'peer0.forestryauthority.treetracking.com': { eventSource: true },
                'peer0.loggingcompany.treetracking.com': { eventSource: true },
                'peer0.buyingcompany.treetracking.com': { eventSource: true }
            },
            contracts: [
                { id: 'treetracking', version: '2.0' }
            ]
        }
    },
    organizations: {
        TreeTrackingAdminMSP: {
            mspid: 'TreeTrackingAdminMSP',
            peers: ['peer0.admin.treetracking.com'],
            adminPrivateKey: { path: getPrivateKeyPath('Admin', 'admin.treetracking.com') },
            signedCert: { path: path.join(basePath, 'crypto-config/peerOrganizations/admin.treetracking.com/users/Admin@admin.treetracking.com/msp/signcerts/Admin@admin.treetracking.com-cert.pem') }
        },
        ForestryAuthorityMSP: {
            mspid: 'ForestryAuthorityMSP',
            peers: ['peer0.forestryauthority.treetracking.com'],
            adminPrivateKey: { path: getPrivateKeyPath('Admin', 'forestryauthority.treetracking.com') },
            signedCert: { path: path.join(basePath, 'crypto-config/peerOrganizations/forestryauthority.treetracking.com/users/Admin@forestryauthority.treetracking.com/msp/signcerts/Admin@forestryauthority.treetracking.com-cert.pem') }
        },
        LoggingCompaniesMSP: {
            mspid: 'LoggingCompaniesMSP',
            peers: ['peer0.loggingcompany.treetracking.com'],
            adminPrivateKey: { path: getPrivateKeyPath('Admin', 'loggingcompany.treetracking.com') },
            signedCert: { path: path.join(basePath, 'crypto-config/peerOrganizations/loggingcompany.treetracking.com/users/Admin@loggingcompany.treetracking.com/msp/signcerts/Admin@loggingcompany.treetracking.com-cert.pem') }
        },
        BuyingCompaniesMSP: {
            mspid: 'BuyingCompaniesMSP',
            peers: ['peer0.buyingcompany.treetracking.com'],
            adminPrivateKey: { path: getPrivateKeyPath('Admin', 'buyingcompany.treetracking.com') },
            signedCert: { path: path.join(basePath, 'crypto-config/peerOrganizations/buyingcompany.treetracking.com/users/Admin@buyingcompany.treetracking.com/msp/signcerts/Admin@buyingcompany.treetracking.com-cert.pem') }
        }
    },
    orderers: {
        'orderer.treetracking.com': {
            url: 'grpc://localhost:7050'
        }
    },
    peers: {
        'peer0.admin.treetracking.com': {
            url: 'grpc://localhost:7051'
        },
        'peer0.forestryauthority.treetracking.com': {
            url: 'grpc://localhost:9051'
        },
        'peer0.loggingcompany.treetracking.com': {
            url: 'grpc://localhost:11051'
        },
        'peer0.buyingcompany.treetracking.com': {
            url: 'grpc://localhost:13051'
        }
    }
};

fs.writeFileSync(path.join(__dirname, 'networkconfig.json'), JSON.stringify(networkConfig, null, 2));
console.log('networkconfig.json generated successfully');

