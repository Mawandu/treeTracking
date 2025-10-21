'use strict';

const { FileSystemWallet, X509WalletMixin } = require('fabric-network');
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);

        const orgs = [
            { msp: 'TreeTrackingAdminMSP', domain: 'admin.treetracking.com' },
            { msp: 'ForestryAuthorityMSP', domain: 'forestryauthority.treetracking.com' },
            { msp: 'LoggingCompaniesMSP', domain: 'loggingcompany.treetracking.com' },
            { msp: 'BuyingCompaniesMSP', domain: 'buyingcompany.treetracking.com' }
        ];

        console.log('Enrolling admin identities using Fabric SDK v1.4 syntax...');
        for (const org of orgs) {
            const identityLabel = `Admin@${org.msp}`;
            const identity = await wallet.exists(identityLabel);
            if (identity) {
                console.log(`Identity ${identityLabel} already exists.`);
                continue;
            }

            const certPath = path.resolve(__dirname, '..', 'crypto-config', 'peerOrganizations', org.domain, 'users', `Admin@${org.domain}`, 'msp', 'signcerts');
            const keyPath = path.resolve(__dirname, '..', 'crypto-config', 'peerOrganizations', org.domain, 'users', `Admin@${org.domain}`, 'msp', 'keystore');

            const cert = fs.readFileSync(path.join(certPath, fs.readdirSync(certPath)[0])).toString();
            const key = fs.readFileSync(path.join(keyPath, fs.readdirSync(keyPath)[0])).toString();
            
            // Utilisation de la syntaxe v1.4
            const user_identity = X509WalletMixin.createIdentity(org.msp, cert, key);
            
            await wallet.import(identityLabel, user_identity);
            console.log(`Successfully enrolled and imported ${identityLabel} into the wallet.`);
        }

    } catch (error) {
        console.error(`Failed to enroll admin: ${error}`);
        process.exit(1);
    }
}

main();
